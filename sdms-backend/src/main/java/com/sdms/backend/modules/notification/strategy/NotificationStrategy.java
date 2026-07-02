package com.sdms.backend.modules.notification.strategy;

import com.sdms.backend.modules.notification.core.payload.NotificationPayload;
import com.sdms.backend.modules.notification.enums.NotificationChannel;

public interface NotificationStrategy {
    NotificationChannel getChannel();
    void send(NotificationPayload payload);
}
