package com.sdms.backend.modules.room.event;

import com.sdms.backend.modules.payment.event.PaymentSuccessEvent;
import com.sdms.backend.modules.payment.event.ReservationPaymentExpiredEvent;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.enums.ApplicationStatus;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentWorkflowListener {

    private final HousingAssignmentService housingAssignmentService;
    private final DormitoryApplicationRepository applicationRepository;

    @EventListener
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        if (event.getAssignmentId() != null) {
            log.info("[PaymentWorkflowListener] Received PaymentSuccessEvent for assignmentId: {}. Updating assignment to PENDING_CHECKIN.", event.getAssignmentId());
            try {
                housingAssignmentService.confirmReserved(event.getAssignmentId());
            } catch (Exception e) {
                log.error("[PaymentWorkflowListener] Failed to update assignment for assignmentId: {}. Reason: {}", event.getAssignmentId(), e.getMessage(), e);
            }
        }
    }

    @EventListener
    public void handleReservationPaymentExpired(ReservationPaymentExpiredEvent event) {
        if (event.getAssignmentId() != null) {
            log.info("[PaymentWorkflowListener] Received ReservationPaymentExpiredEvent for assignmentId: {}. Expiring reservation.", event.getAssignmentId());
            try {
                housingAssignmentService.expireReservation(event.getAssignmentId());
            } catch (Exception e) {
                log.error("[PaymentWorkflowListener] Failed to expire reservation for assignmentId: {}. Reason: {}", event.getAssignmentId(), e.getMessage(), e);
            }
        }
    }
}
