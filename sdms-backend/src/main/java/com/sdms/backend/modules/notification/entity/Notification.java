package com.sdms.backend.modules.notification.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationStatus;
import com.sdms.backend.modules.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DOMAIN ROLE: In-App Notification (NF-04)
 * Quản lý thông báo hiển thị trên chuông/app của người dùng (Student/Admin).
 */
@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notification_user_id", columnList = "user_id"),
                @Index(name = "idx_notification_is_read", columnList = "is_read")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id") // Made optional to support external email/SMS
    private UUID userId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "action_url")
    private String actionUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 50)
    private NotificationType type;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Delivery History fields
    @Column(name = "recipient")
    private String recipient;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 50)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private NotificationStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "event_id")
    private String eventId;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;
}
