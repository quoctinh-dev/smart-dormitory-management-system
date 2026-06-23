package com.sdms.backend.modules.room.event;

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.application.event.ApplicationApprovedEvent;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomAllocationListener {

    private final HousingAssignmentService assignmentService;
    private final ApplicationEventPublisher eventPublisher;
    private final com.sdms.backend.modules.application.repository.DormitoryApplicationRepository applicationRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleApplicationApproved(ApplicationApprovedEvent event) {
        log.info("Received ApplicationApprovedEvent for Application ID: {}", event.getApplicationId());
        try {
            // Thực hiện cấp giường (Phase 3)
            Gender gender = Gender.valueOf(event.getGender());
            StudentHousingAssignment assignment = assignmentService.reserveBed(event.getApplicationId(), gender);

            log.info("Successfully reserved bed {} for application {}", assignment.getBed().getBedId(), event.getApplicationId());

            // Sau khi cấp giường thành công, phát BedReservedEvent (Phase 3 -> Phase 4)
            eventPublisher.publishEvent(new BedReservedEvent(
                    this,
                    event.getApplicationId(),
                    assignment.getAssignmentId()
            ));
        } catch (Exception e) {
            log.error("Failed to reserve bed for application {}: {}", event.getApplicationId(), e.getMessage());
            // Cập nhật trạng thái thành WAITING_LIST do hết chỗ
            try {
                com.sdms.backend.modules.application.entity.DormitoryApplication app = 
                    applicationRepository.findById(event.getApplicationId()).orElse(null);
                if (app != null) {
                    app.setStatus(com.sdms.backend.modules.application.enums.ApplicationStatus.WAITING_LIST);
                    applicationRepository.save(app);
                    log.info("Application {} updated to WAITING_LIST due to no available beds.", event.getApplicationId());
                }
            } catch (Exception ex) {
                log.error("Failed to update application {} to WAITING_LIST: {}", event.getApplicationId(), ex.getMessage());
            }
        }
    }
}
