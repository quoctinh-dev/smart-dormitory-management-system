package com.sdms.backend.modules.room.scheduler;

import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationExpiryJob {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final HousingAssignmentService housingAssignmentService;

    /**
     * Chạy mỗi 5 phút để quét và hủy các giữ chỗ đã quá hạn.
     */
    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    public void expireOldReservations() {
        log.info("[Scheduler] Running ExpireOldReservations job...");
        LocalDateTime expiryTime = LocalDateTime.now().minusDays(3); // Giữ chỗ quá 3 ngày sẽ bị hủy

        List<StudentHousingAssignment> expiredAssignments = assignmentRepository.findByStatusAndReservedAtBefore(AssignmentStatus.RESERVED, expiryTime);

        if (expiredAssignments.isEmpty()) {
            log.info("[Scheduler] No expired reservations found.");
            return;
        }

        log.info("[Scheduler] Found {} expired reservations to process.", expiredAssignments.size());
        for (StudentHousingAssignment assignment : expiredAssignments) {
            try {
                housingAssignmentService.expireReservation(assignment.getAssignmentId());
                log.info("[Scheduler] Successfully expired reservation for assignmentId: {}", assignment.getAssignmentId());
            } catch (Exception e) {
                log.error("[Scheduler] Failed to expire reservation for assignmentId: {}. Reason: {}",
                        assignment.getAssignmentId(), e.getMessage(), e);
            }
        }
        log.info("[Scheduler] ExpireOldReservations job finished.");
    }
}
