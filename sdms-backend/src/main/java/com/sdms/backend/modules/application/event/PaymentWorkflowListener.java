package com.sdms.backend.modules.application.event;

import com.sdms.backend.modules.payment.event.ReservationPaymentExpiredEvent;
import com.sdms.backend.modules.application.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component("applicationPaymentWorkflowListener")
@RequiredArgsConstructor
public class PaymentWorkflowListener {

    private final ApplicationService applicationService;

    @EventListener
    public void handleReservationPaymentExpired(ReservationPaymentExpiredEvent event) {
        if (event.getApplicationId() != null) {
            log.info("[Application-PaymentWorkflowListener] Received ReservationPaymentExpiredEvent for applicationId: {}. Cancelling application.", event.getApplicationId());
            try {
                applicationService.cancelApplicationDueToPayment(event.getApplicationId());
            } catch (Exception e) {
                log.error("[Application-PaymentWorkflowListener] Failed to cancel application for applicationId: {}. Reason: {}", event.getApplicationId(), e.getMessage(), e);
            }
        }
    }
}
