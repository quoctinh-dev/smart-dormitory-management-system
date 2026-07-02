package com.sdms.backend.modules.notification.dto;

import com.sdms.backend.modules.notification.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String actionUrl;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
