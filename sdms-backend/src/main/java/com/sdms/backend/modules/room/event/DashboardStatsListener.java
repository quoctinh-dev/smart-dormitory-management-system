package com.sdms.backend.modules.room.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DashboardStatsListener {

    private final StringRedisTemplate redisTemplate;
    
    // Redis Key Constants
    private static final String OCCUPIED_BEDS_KEY = "dashboard:metrics:occupied_beds";

    @Async
    @EventListener
    public void handleCheckInCompleted(CheckInCompletedEvent event) {
        log.info("Cập nhật dashboard async cho Check-in thành công");
        try {
            redisTemplate.opsForValue().increment(OCCUPIED_BEDS_KEY);
        } catch (Exception e) {
            log.warn("Không thể cập nhật Redis cho Dashboard: {}", e.getMessage());
        }
    }

    @Async
    @EventListener
    public void handleBedReleased(BedReleasedEvent event) {
        log.info("Cập nhật dashboard async khi giải phóng giường: {}", event.getBedId());
        try {
            redisTemplate.opsForValue().decrement(OCCUPIED_BEDS_KEY);
        } catch (Exception e) {
            log.warn("Không thể cập nhật Redis cho Dashboard: {}", e.getMessage());
        }
    }
}
