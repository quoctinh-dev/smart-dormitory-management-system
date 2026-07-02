package com.sdms.backend.modules.notification.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationStatus;
import com.sdms.backend.modules.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DOMAIN ROLE: Delivery Log (NF-04)
 * Quản lý lịch sử gửi thông báo ra kênh bên ngoài (Email, SMS, Push).
 */
@Entity
@Table(name = "notification_delivery_histories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDeliveryHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient", nullable = false)
    private String recipient; // Email, Device Token, Phone number

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 50)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 50)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private NotificationStatus status;

    @Builder.Default
    @Column(name = "retry_count", nullable = false)
    private int retryCount = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "payload_snapshot", columnDefinition = "TEXT")
    private String payloadSnapshot; // JSON payload for debugging or retry

    @Column(name = "event_id")
    private String eventId;

    @Column(name = "correlation_id")
    private String correlationId;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;
}