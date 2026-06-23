package com.sdms.backend.modules.room.event;

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.application.event.ApplicationApprovedEvent;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomEventListener {

    private final HousingAssignmentService assignmentService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Lắng nghe sự kiện hồ sơ được duyệt (ApplicationApprovedEvent).
     * Thực hiện tự động xếp giường trống cho sinh viên.
     * Chạy trong transaction độc lập sau khi transaction duyệt đơn đã commit thành công.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleApplicationApproved(ApplicationApprovedEvent event) {
        log.info("[RoomEventListener] Handling ApplicationApprovedEvent for application={}", event.getApplicationId());
        try {
            Gender gender = Gender.valueOf(event.getGender());
            StudentHousingAssignment assignment = assignmentService.reserveBed(event.getApplicationId(), gender);
            log.info("[RoomEventListener] Successfully reserved bed for application={}, assignment={}", 
                    event.getApplicationId(), assignment.getAssignmentId());
            
            // Phát sự kiện giữ chỗ thành công
            eventPublisher.publishEvent(new BedReservedEvent(this, event.getApplicationId(), assignment.getAssignmentId()));
        } catch (Exception e) {
            log.error("[RoomEventListener] Failed to reserve bed for application={}. Transitioning to waiting list.", 
                    event.getApplicationId(), e);
            
            // Phát sự kiện giữ chỗ thất bại
            eventPublisher.publishEvent(new BedReservationFailedEvent(this, event.getApplicationId()));
        }
    }
}
