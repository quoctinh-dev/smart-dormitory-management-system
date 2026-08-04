package com.sdms.backend.modules.notification.dto;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    /**
     * Dùng Boolean (wrapper) + @JsonProperty để đảm bảo Jackson serialize
     * đúng key "isRead" thay vì "read" (do Lombok @Data sinh getter isRead()).
     */
    @JsonProperty("isRead")
    private Boolean isRead;

    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
