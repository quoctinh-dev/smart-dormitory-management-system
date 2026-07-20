package com.sdms.backend.modules.notification.dto;

import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationStatus;
import com.sdms.backend.modules.notification.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDeliveryLog {
    private Long id;

    private String recipient;
    private NotificationChannel channel;
    private NotificationType type;
    private NotificationStatus status;
    
    @Builder.Default
    private int retryCount = 0;
    
    private String errorMessage;
    private String payloadSnapshot;
    private String eventId;
    private String correlationId;
    private LocalDateTime sentAt;
}