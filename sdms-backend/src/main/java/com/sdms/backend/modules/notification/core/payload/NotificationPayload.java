package com.sdms.backend.modules.notification.core.payload;

import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class NotificationPayload {
    private String eventId; // For correlation/tracking
    private NotificationType type;
    private Set<NotificationChannel> channels;
    
    // Recipient Info
    private UUID studentId; // Nullable if student doesn't exist yet
    private String email;
    private String recipientName;
    
    // Content Data
    private String title;
    private String inAppMessage;
    private String emailTemplateName;
    private Map<String, Object> templateData;
    private String actionUrl;
}
