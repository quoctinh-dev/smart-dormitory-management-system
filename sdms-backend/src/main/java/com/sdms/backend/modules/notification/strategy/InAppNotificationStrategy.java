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
            // Fix UUID mismatch: Notification.userId must be UserAccount.accountId, not Student.studentId
            java.util.UUID finalUserId = payload.getStudentId();
            String displayRecipient = payload.getEmail();
            
            if (displayRecipient == null && payload.getRecipientName() != null) {
                displayRecipient = payload.getRecipientName();
            }

            // Attempt to resolve UserAccount from StudentId
            var userAccountOpt = userAccountRepository.findByStudent_StudentId(payload.getStudentId());
            if (userAccountOpt.isPresent()) {
                finalUserId = userAccountOpt.get().getAccountId();
                if (displayRecipient == null) {
                    displayRecipient = userAccountOpt.get().getEmail();
                }
            } else {
                // If not found by studentId, maybe it's already an accountId? Try finding it directly
                var directAccountOpt = userAccountRepository.findById(payload.getStudentId());
                if (directAccountOpt.isPresent()) {
                    finalUserId = directAccountOpt.get().getAccountId();
                    if (displayRecipient == null) {
                        displayRecipient = directAccountOpt.get().getEmail();
                    }
                }
            }
            
            if (displayRecipient == null) {
                displayRecipient = finalUserId.toString();
            }

            Notification notification = Notification.builder()
                    .userId(finalUserId)
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
