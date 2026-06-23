package com.sdms.backend.modules.smartaccess.event.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import com.sdms.backend.modules.smartaccess.application.service.AccessEvaluationService;
import com.sdms.backend.modules.smartaccess.event.IdentityVerifiedEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class IdentityVerifiedEventListener {

    private final AccessEvaluationService accessEvaluationService;

    // Triggers synchronously. The AccessEvaluationService method is annotated with @Transactional.
    // If the transaction fails, no AFTER_COMMIT events will be fired.
    @EventListener
    public void handleIdentityVerified(IdentityVerifiedEvent event) {
        log.info("Received IdentityVerifiedEvent for gate {} with eventId {}", event.getGateId(), event.getEventId());
        
        accessEvaluationService.evaluateAccess(
                event.getEventId(),
                event.getStudentId(),
                event.getGateId(),
                event.getMethod()
        );
    }
}
