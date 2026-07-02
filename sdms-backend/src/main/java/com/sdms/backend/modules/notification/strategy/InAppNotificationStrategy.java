package com.sdms.backend.modules.notification.strategy;

import com.sdms.backend.modules.notification.core.payload.NotificationPayload;
import com.sdms.backend.modules.notification.entity.Notification;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InAppNotificationStrategy implements NotificationStrategy {

    private final NotificationRepository notificationRepository;

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
            Notification notification = Notification.builder()
                    .userId(payload.getStudentId())
                    .title(payload.getTitle())
                    .message(payload.getInAppMessage())
                    .actionUrl(payload.getActionUrl())
                    .type(payload.getType())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
            
            
            log.info("InAppNotificationStrategy: Saved in-app notification for user {}", payload.getStudentId());
        } catch (Exception e) {
            log.error("InAppNotificationStrategy: Failed to save in-app notification for event {}", payload.getEventId(), e);
        }
    }
}
