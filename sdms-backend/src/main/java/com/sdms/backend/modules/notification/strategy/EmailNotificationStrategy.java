package com.sdms.backend.modules.notification.strategy;

import com.sdms.backend.common.service.EmailService;
import com.sdms.backend.modules.notification.core.payload.NotificationPayload;
import com.sdms.backend.modules.notification.entity.Notification;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationStatus;
import com.sdms.backend.modules.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationStrategy implements NotificationStrategy {

    private final EmailService emailService;
    private final NotificationRepository notificationRepository;
    private final TemplateEngine templateEngine;

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.EMAIL;
    }

    @Override
    public void send(NotificationPayload payload) {
        if (payload.getEmail() == null || payload.getEmailTemplateName() == null) {
            log.warn("EmailNotificationStrategy: Missing email or template name for event {}", payload.getEventId());
            return;
        }

        Notification history = Notification.builder()
                .recipient(payload.getEmail())
                .channel(NotificationChannel.EMAIL)
                .type(payload.getType())
                .status(NotificationStatus.PENDING)
                .eventId(payload.getEventId())
                .title(payload.getTitle() != null ? payload.getTitle() : "Email Notification")
                .message("Email sent using template: " + payload.getEmailTemplateName())
                .build();

        try {
            Context context = new Context();
            if (payload.getTemplateData() != null) {
                context.setVariables(payload.getTemplateData());
            }

            String htmlContent = templateEngine.process("notification/" + payload.getEmailTemplateName(), context);

            // Assuming emailService.sendNotificationEmail handles asynchronous sending correctly
            emailService.sendNotificationEmail(payload.getEmail(), payload.getTitle(), htmlContent);

            history.setStatus(NotificationStatus.SENT);
            history.setSentAt(LocalDateTime.now());
            log.info("EmailNotificationStrategy: Successfully pushed email task for event {}", payload.getEventId());
        } catch (Exception e) {
            history.setStatus(NotificationStatus.FAILED);
            history.setErrorMessage(e.getMessage());
            log.error("EmailNotificationStrategy: Failed to send email for event {}", payload.getEventId(), e);
        } finally {
            try {
                notificationRepository.save(history);
            } catch (Exception dbEx) {
                log.error("EmailNotificationStrategy: Failed to save delivery history", dbEx);
            }
        }
    }
}
