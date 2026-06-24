package com.sdms.backend.modules.student.event;

import com.sdms.backend.modules.room.event.CheckInCompletedEvent;
import com.sdms.backend.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudentEventListener {

    private final StudentRepository studentRepository;

    /**
     * [DEPRECATED & DISABLED]
     * This logic is now fully handled by AccountProvisioningListener, which creates
     * the Student entity with an ACTIVE status from the beginning.
     * This listener is kept for historical reference but is functionally disabled
     * to prevent duplicate processing and compilation errors.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCheckInCompleted(CheckInCompletedEvent event) {
        log.warn("[StudentEventListener] This listener is deprecated and disabled. Student creation and activation are now handled by AccountProvisioningListener.");
        // The logic has been moved to AccountProvisioningListener.
        // This method is intentionally left blank to resolve compilation errors and avoid redundant logic.
    }
}
