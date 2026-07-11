package com.sdms.backend.modules.notification.controller;

import com.sdms.backend.common.exception.AppException;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
public class AdminNotificationController {

    private final NotificationDeliveryHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final UserAccountRepository userAccountRepository;

    @GetMapping("/delivery-logs")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDeliveryHistory>>> getDeliveryLogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) Boolean isBroadcast,
            @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC)
            Pageable pageable) {
        Page<NotificationDeliveryHistory> page = historyRepository.findAll(
                com.sdms.backend.modules.notification.repository.NotificationHistorySpecification.filter(keyword, type, isBroadcast), 
                pageable
        );
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }

    @PostMapping("/broadcast")
    @Transactional
    public ResponseEntity<ApiResponse<BroadcastResponse>> broadcastNotification(@RequestBody BroadcastRequest request) {
        String title = request.title() == null ? "" : request.title().trim();
        String message = request.message() == null ? "" : request.message().trim();
        String targetAudience = request.targetAudience() == null ? "ALL" : request.targetAudience().trim().toUpperCase();

        if (title.isEmpty() || message.isEmpty()) {
            throw new AppException("Broadcast title and message must not be blank", HttpStatus.BAD_REQUEST);
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

        return ResponseEntity.ok(
                ApiResponse.success(new BroadcastResponse(
                        eventId,
                        recipients.size(),
                        "Broadcast notification created successfully."
                ))
        );
    }

    private List<UserAccount> findRecipients(String targetAudience) {
        return switch (targetAudience) {
            case "ALL" -> userAccountRepository.findAll();
            case "ADMIN" -> userAccountRepository.findByRole(Role.ADMIN);
            case "STAFF" -> userAccountRepository.findByRole(Role.STAFF);
            case "STUDENT" -> userAccountRepository.findByRole(Role.STUDENT);
            default -> throw new AppException("Unsupported target audience: " + targetAudience, HttpStatus.BAD_REQUEST);
        };
    }

    public record BroadcastRequest(String title, String message, String targetAudience, NotificationType type) {}

    public record BroadcastResponse(String eventId, int recipientCount, String message) {}
}
