package com.sdms.backend.modules.notification.controller;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.notification.entity.Notification;
import com.sdms.backend.modules.notification.entity.NotificationDeliveryHistory;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationStatus;
import com.sdms.backend.modules.notification.enums.NotificationType;
import com.sdms.backend.modules.notification.repository.NotificationDeliveryHistoryRepository;
import com.sdms.backend.modules.notification.repository.NotificationRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin - Quản lý thông báo", description = "Quản lý lịch sử và gửi thông báo hàng loạt")
public class AdminNotificationController {

    private final NotificationDeliveryHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final UserAccountRepository userAccountRepository;

    @Operation(summary = "Lấy lịch sử gửi thông báo")
    @GetMapping("/delivery-logs")
    public ApiResponse<PageResponse<NotificationDeliveryHistory>> getDeliveryLogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) Boolean isBroadcast,
            @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC)
            Pageable pageable) {
        Page<NotificationDeliveryHistory> page = historyRepository.findAll(
                com.sdms.backend.modules.notification.repository.NotificationHistorySpecification.filter(keyword, type, isBroadcast), 
                pageable
        );
        return ApiResponse.success("Lấy lịch sử thông báo thành công", PageResponse.of(page));
    }

    @Operation(summary = "Gửi thông báo hàng loạt")
    @PostMapping("/broadcast")
    @Transactional
    public ApiResponse<BroadcastResponse> broadcastNotification(@RequestBody BroadcastRequest request) {
        String title = request.title() == null ? "" : request.title().trim();
        String message = request.message() == null ? "" : request.message().trim();
        String targetAudience = request.targetAudience() == null ? "ALL" : request.targetAudience().trim().toUpperCase();

        if (title.isEmpty() || message.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Tiêu đề và nội dung thông báo không được để trống");
        }

        List<UserAccount> recipients = findRecipients(targetAudience);
        String eventId = "broadcast-" + UUID.randomUUID();
        LocalDateTime sentAt = LocalDateTime.now();

        NotificationType type = request.type() != null ? request.type() : NotificationType.ANNOUNCEMENT;

        List<Notification> notifications = recipients.stream()
                .map(user -> Notification.builder()
                        .userId(user.getAccountId())
                        .title(title)
                        .message(message)
                        .actionUrl(null)
                        .type(type)
                        .isRead(false)
                        .build())
                .toList();

        List<NotificationDeliveryHistory> histories = recipients.stream()
                .map(user -> NotificationDeliveryHistory.builder()
                        .recipient(user.getEmail())
                        .channel(NotificationChannel.IN_APP)
                        .type(type)
                        .status(NotificationStatus.SENT)
                        .eventId(eventId)
                        .payloadSnapshot("{\"targetAudience\":\"" + targetAudience + "\"}")
                        .sentAt(sentAt)
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);
        historyRepository.saveAll(histories);

        return ApiResponse.success("Gửi thông báo hàng loạt thành công", new BroadcastResponse(
                eventId,
                recipients.size(),
                "Tạo thông báo hàng loạt thành công."
        ));
    }

    private List<UserAccount> findRecipients(String targetAudience) {
        return switch (targetAudience) {
            case "ALL" -> userAccountRepository.findAll();
            case "ADMIN" -> userAccountRepository.findByRole(Role.ADMIN);
            case "STAFF" -> userAccountRepository.findByRole(Role.STAFF);
            case "STUDENT" -> userAccountRepository.findByRole(Role.STUDENT);
            default -> throw new AppException(ErrorCode.VALIDATION_FAILED, "Đối tượng nhận không hợp lệ: " + targetAudience);
        };
    }

    public record BroadcastRequest(String title, String message, String targetAudience, NotificationType type) {}

    public record BroadcastResponse(String eventId, int recipientCount, String message) {}
}
