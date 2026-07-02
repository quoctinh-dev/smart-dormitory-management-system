package com.sdms.backend.modules.notification.core;

import com.sdms.backend.modules.notification.core.payload.NotificationPayload;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.strategy.NotificationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
public class NotificationRouter {

    private final Map<NotificationChannel, NotificationStrategy> strategyMap;

    public NotificationRouter(List<NotificationStrategy> strategies) {
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(NotificationStrategy::getChannel, s -> s));
    }

    public void route(NotificationPayload payload) {
        log.info("Routing notification event {} to channels: {}", payload.getEventId(), payload.getChannels());

        if (payload.getChannels() == null || payload.getChannels().isEmpty()) {
            log.warn("No channels specified for notification event {}", payload.getEventId());
            return;
        }

        for (NotificationChannel channel : payload.getChannels()) {
            NotificationStrategy strategy = strategyMap.get(channel);
            if (strategy != null) {
                try {
                    strategy.send(payload);
                } catch (Exception e) {
                    log.error("Failed to execute strategy for channel {}: {}", channel, e.getMessage(), e);
                }
            } else {
                log.warn("No strategy implementation found for channel {}", channel);
            }
        }
    }
}
