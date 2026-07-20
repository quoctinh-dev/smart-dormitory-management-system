package com.sdms.backend.modules.notification.service.impl;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.notification.dto.NotificationResponse;
import com.sdms.backend.modules.notification.entity.Notification;
import com.sdms.backend.modules.notification.repository.NotificationRepository;
import com.sdms.backend.modules.notification.service.InAppNotificationService;
import com.sdms.backend.modules.user.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.sdms.backend.modules.notification.dto.IssueReportRequest;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.notification.enums.NotificationType;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationStatus;

@Service
@RequiredArgsConstructor
public class InAppNotificationServiceImpl implements InAppNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserAccountRepository userAccountRepository;
    private final com.sdms.backend.modules.room.repository.RoomRepository roomRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications() {
        UUID userId = getCurrentUserId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByUserIdAndIsReadFalse(getCurrentUserId());
    }

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

    @Override
    @Transactional
    public void markAllAsRead() {
        List<Notification> unreadList =
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(getCurrentUserId());

        unreadList.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });

        notificationRepository.saveAll(unreadList);
    }

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

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .actionUrl(notification.getActionUrl())
                .type(notification.getType())
                .isRead(notification.isRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void reportIssue(IssueReportRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserAccount account = (UserAccount) authentication.getPrincipal();
        
        String studentName = account.getStudent() != null ? account.getStudent().getFullName() : account.getUsername();
        
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
                    .orElse("Khu vực chung (Chưa phân phòng)");
        }
        
        // Find all admins and staff to notify
        List<UserAccount> admins = userAccountRepository.findByRole(Role.ADMIN);
        List<UserAccount> staffs = userAccountRepository.findByRole(Role.STAFF);
        
        String title = "Báo hỏng thiết bị từ sinh viên";
        String message = String.format("Sinh viên %s báo hỏng thiết bị tại phòng %s. Mô tả: %s", 
                studentName, roomCode, request.getDescription());
                
        // Create notification for each admin/staff
        String eventId = "issue-" + UUID.randomUUID();
        admins.forEach(admin -> createNotification(admin.getAccountId(), admin.getEmail(), title, message, null, eventId));
        staffs.forEach(staff -> createNotification(staff.getAccountId(), staff.getEmail(), title, message, null, eventId));
    }

    private void createNotification(UUID recipientId, String email, String title, String message, String imageUrl, String eventId) {
        Notification notification = Notification.builder()
                .userId(recipientId)
                .title(title)
                .message(message)
                .actionUrl(imageUrl) // using actionUrl to pass imageUrl for now
                .type(NotificationType.MAINTENANCE)
                .isRead(false)
                .recipient(email)
                .channel(NotificationChannel.IN_APP)
                .status(NotificationStatus.SENT)
                .eventId(eventId)
                .build();
        notificationRepository.save(notification);
    }
}
