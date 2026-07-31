package com.sdms.backend.modules.notification.strategy;

import com.sdms.backend.modules.notification.core.payload.NotificationPayload;
import com.sdms.backend.modules.notification.entity.Notification;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationStatus;
import com.sdms.backend.modules.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InAppNotificationStrategy implements NotificationStrategy {

    private final NotificationRepository notificationRepository;
    private final com.sdms.backend.modules.user.repository.UserAccountRepository userAccountRepository;

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.IN_APP;
    }

    @Override
    public void send(NotificationPayload payload) {
        if (payload.getStudentId() == null) {
            log.warn("InAppNotificationStrategy: studentId is null, cannot save in-app notification for event {}", payload.getEventId());
            return;
        }

        try {
            // Cố gắng tìm email hoặc tên người nhận thay vì hiển thị UUID
            String displayRecipient = payload.getEmail();
            if (displayRecipient == null && payload.getRecipientName() != null) {
                displayRecipient = payload.getRecipientName();
            }
            if (displayRecipient == null) {
                displayRecipient = userAccountRepository.findById(payload.getStudentId())
                        .map(com.sdms.backend.modules.user.entity.UserAccount::getEmail)
                        .orElse(payload.getStudentId().toString());
            }

            Notification notification = Notification.builder()
                    .userId(payload.getStudentId())
                    .title(payload.getTitle())
                    .message(payload.getInAppMessage())
                    .actionUrl(payload.getActionUrl())
                    .type(payload.getType())
                    .isRead(false)
                    .recipient(displayRecipient)
                    .channel(NotificationChannel.IN_APP)
                    .status(NotificationStatus.SENT)
                    .eventId(payload.getEventId())
                    .sentAt(java.time.LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);
            
            
            log.info("InAppNotificationStrategy: Saved in-app notification for user {}", payload.getStudentId());
        } catch (Exception e) {
            log.error("InAppNotificationStrategy: Failed to save in-app notification for event {}", payload.getEventId(), e);
        }
    }
}
