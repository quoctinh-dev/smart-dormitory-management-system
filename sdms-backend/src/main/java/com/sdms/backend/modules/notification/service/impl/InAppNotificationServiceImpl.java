package com.sdms.backend.modules.notification.service.impl;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.notification.dto.IssueReportRequest;
import com.sdms.backend.modules.notification.dto.NotificationResponse;
import com.sdms.backend.modules.notification.entity.Notification;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationStatus;
import com.sdms.backend.modules.notification.enums.NotificationType;
import com.sdms.backend.modules.notification.repository.NotificationRepository;
import com.sdms.backend.modules.notification.service.InAppNotificationService;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.user.repository.UserAccountRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service xử lý các nghiệp vụ thông báo nội bộ ứng dụng (In-App Notification).
 * <p>
 * Quản lý danh sách thông báo người dùng, đánh dấu đã đọc, gửi báo cáo sự cố thiết bị/sửa chữa
 * và phát thông báo cảnh báo lỗi phần cứng IoT đến đội ngũ Quản trị viên (Admin) và Nhân viên (Staff).
 */
@Service
@RequiredArgsConstructor
public class InAppNotificationServiceImpl implements InAppNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserAccountRepository userAccountRepository;
    private final RoomRepository roomRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;

    /**
     * Lấy danh sách tất cả thông báo trong ứng dụng của người dùng đang đăng nhập (Sắp xếp theo thời gian mới nhất).
     *
     * @return Danh sách DTO thông báo
     */
    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications() {
        UUID userId = getCurrentUserId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số lượng thông báo chưa đọc của người dùng đang đăng nhập.
     *
     * @return Số lượng thông báo chưa đọc
     */
    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countUnreadByUserId(getCurrentUserId());
    }

    /**
     * Đánh dấu một thông báo cụ thể là đã đọc.
     *
     * @param notificationId Mã ID thông báo
     */
    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, getCurrentUserId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông báo"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    /**
     * Đánh dấu tất cả thông báo chưa đọc của người dùng hiện tại là đã đọc.
     */
    @Override
    @Transactional
    public void markAllAsRead() {
        int updatedCount = notificationRepository.markAllAsReadByUserId(getCurrentUserId());
        // Tránh log nhiều nếu không cần, nhưng đảm bảo data đã lưu thẳng vào DB.
    }

    /**
     * Trích xuất Mã ID tài khoản người dùng đang đăng nhập từ Security Context.
     *
     * @return UUID mã tài khoản người dùng
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện chức năng này");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserAccount account) {
            return account.getAccountId();
        }

        throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện chức năng này");
    }

    /**
     * Hàm helper chuyển đổi từ Entity Notification sang DTO NotificationResponse.
     */
    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .actionUrl(notification.getActionUrl())
                .type(notification.getType())
                .isRead(notification.isRead()) // Boolean auto-boxing từ boolean entity
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    /**
     * Tiếp nhận báo cáo sự cố hư hỏng cơ sở vật chất từ sinh viên và tự động tạo thông báo gửi đến toàn bộ Admin và Staff.
     *
     * @param request Thông tin chi tiết yêu cầu báo cáo sự cố
     */
    @Override
    @Transactional
    public void reportIssue(IssueReportRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserAccount account = (UserAccount) authentication.getPrincipal();

        String studentName = account.getStudent() != null ? account.getStudent().getFullName() : account.getUsername();

        // Kiểm tra điều kiện lưu trú nếu là tài khoản Sinh viên
        if (account.getRole() == Role.STUDENT) {
            if (account.getStudent() == null) {
                throw new AppException(ErrorCode.UNAUTHORIZED, "Tài khoản sinh viên không hợp lệ");
            }
            boolean hasActiveRoom = assignmentRepository.findByStudent_StudentIdAndStatus(account.getStudent().getStudentId(), AssignmentStatus.OCCUPIED).isPresent();
            if (!hasActiveRoom) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Bạn hiện không lưu trú tại Ký túc xá nên không thể gửi báo cáo sự cố");
            }
        }

        // Xác định vị trí phòng/khu vực xảy ra sự cố
        String roomCode = "Khu vực chung";
        if (request.isCommonArea()) {
            roomCode = "Khu vực chung";
        } else if (request.getRoomId() != null) {
            roomCode = roomRepository.findById(request.getRoomId())
                    .map(com.sdms.backend.modules.room.entity.Room::getRoomCode)
                    .orElse(request.getRoomId().toString());
        } else if (account.getStudent() != null) {
            roomCode = assignmentRepository.findByStudent_StudentIdAndStatus(account.getStudent().getStudentId(), AssignmentStatus.OCCUPIED)
                    .map(assignment -> assignment.getBed().getRoom().getRoomCode())
                    .orElse("Khu vực chung");
        }

        // Lấy danh sách tất cả Admin và Staff để phát thông báo
        List<UserAccount> admins = userAccountRepository.findByRole(Role.ADMIN);
        List<UserAccount> staffs = userAccountRepository.findByRole(Role.STAFF);

        String title = "Báo hỏng thiết bị từ sinh viên";
        String message = String.format(
                "Người báo: Sinh viên %s\n" +
                        "Vị trí: Phòng %s\n" +
                        "Mô tả chi tiết:\n" +
                        "------------------------\n" +
                        "%s",
                studentName, roomCode, request.getDescription()
        );

        // Tạo bản ghi thông báo cho từng Admin và Staff
        String studentCode = account.getStudent() != null && account.getStudent().getStudentCode() != null 
                ? account.getStudent().getStudentCode() : "KH";
        String eventId = "ISSUE-" + roomCode.replace(" ", "") + "-" + studentCode + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        admins.forEach(admin -> createNotification(admin.getAccountId(), admin.getEmail(), title, message, null, eventId));
        staffs.forEach(staff -> createNotification(staff.getAccountId(), staff.getEmail(), title, message, null, eventId));
    }

    /**
     * Hàm helper khởi tạo và lưu bản ghi thông báo mới vào cơ sở dữ liệu.
     */
    private void createNotification(UUID recipientId, String email, String title, String message, String imageUrl, String eventId) {
        Notification notification = Notification.builder()
                .userId(recipientId)
                .title(title)
                .message(message)
                .actionUrl(imageUrl)
                .type(NotificationType.MAINTENANCE)
                .isRead(false)
                .recipient(email)
                .channel(NotificationChannel.IN_APP)
                .status(NotificationStatus.SENT)
                .eventId(eventId)
                .build();
        notificationRepository.save(notification);
    }

    /**
     * Phát thông báo cảnh báo khẩn cấp khi thiết bị phần cứng IoT (Cổng kiểm soát ra vào) gặp sự cố kỹ thuật.
     *
     * @param gateId Mã ID thiết bị cổng
     * @param gateName Tên cổng kiểm soát
     * @param component Tên linh kiện/mô-đun bị lỗi
     * @param detail Chi tiết lỗi kỹ thuật
     */
    @Override
    @Transactional
    public void notifyHardwareError(String gateId, String gateName, String component, String detail) {
        List<UserAccount> admins = userAccountRepository.findByRole(Role.ADMIN);
        String title = "Sự cố thiết bị IoT: " + gateName;
        String message = String.format(
                "[Cổng: %s] Thiết bị '%s' gặp sự cố. Chi tiết: %s. Gate ID: %s",
                gateName, component, detail, gateId
        );
        String eventId = "hw-error-" + gateId + "-" + System.currentTimeMillis();
        String actionUrl = "/admin/smart-access";
        admins.forEach(admin -> {
            Notification notification = Notification.builder()
                    .userId(admin.getAccountId())
                    .title(title)
                    .message(message)
                    .actionUrl(actionUrl)
                    .type(NotificationType.IOT_HARDWARE_ERROR)
                    .isRead(false)
                    .recipient(admin.getEmail())
                    .channel(NotificationChannel.IN_APP)
                    .status(NotificationStatus.SENT)
                    .eventId(eventId)
                    .build();
            notificationRepository.save(notification);
        });
    }
}