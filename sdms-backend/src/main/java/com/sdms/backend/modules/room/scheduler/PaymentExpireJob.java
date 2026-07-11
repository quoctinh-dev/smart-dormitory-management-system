package com.sdms.backend.modules.room.scheduler;

import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import com.sdms.backend.modules.system.service.SystemConfigService;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentExpireJob {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final HousingAssignmentService housingAssignmentService;
    private final SystemConfigService systemConfigService;

    public void execute() {
        log.info("[PaymentExpireJob] Starting job to scan and expire assignments exceeding payment deadline...");
        
        try {
            int deadlineDays = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_DEADLINE_DAYS", "3"));
            LocalDateTime threshold = LocalDateTime.now().minusDays(deadlineDays);
            List<StudentHousingAssignment> expiredAssignments = assignmentRepository.findByStatusAndReservedAtBefore(
                    AssignmentStatus.RESERVED, 
                    threshold
            );

            if (expiredAssignments.isEmpty()) {
                log.info("[PaymentExpireJob] No expired assignments found at {}", LocalDateTime.now());
                return;
            }

            log.info("[PaymentExpireJob] Found {} expired assignments. Commencing batch expiration...", expiredAssignments.size());

            int successCount = 0;
            int failureCount = 0;

            for (StudentHousingAssignment assignment : expiredAssignments) {
                try {
                    // RULE 03: Mỗi đơn xử lý trong transaction độc lập (REQUIRES_NEW)
                    housingAssignmentService.expireReservation(assignment.getAssignmentId());
                    successCount++;
                    log.debug("[PaymentExpireJob] Successfully expired assignment with ID: {}", assignment.getAssignmentId());
                } catch (Exception e) {
                    // RULE 04: Một đơn lỗi không được phá hỏng toàn bộ job
                    failureCount++;
                    log.error("[PaymentExpireJob] Failed to expire assignment with ID: {}", assignment.getAssignmentId(), e);
                }
            }

            log.info("[PaymentExpireJob] Execution completed. Success: {}/{} | Failures: {}/{}", 
                    successCount, expiredAssignments.size(), failureCount, expiredAssignments.size());

        } catch (Exception e) {
            log.error("[PaymentExpireJob] Critical failure scanning for expired assignments", e);
        }
    }
}
