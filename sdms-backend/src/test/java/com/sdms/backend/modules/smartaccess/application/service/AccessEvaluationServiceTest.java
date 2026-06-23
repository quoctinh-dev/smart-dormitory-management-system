package com.sdms.backend.modules.smartaccess.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import com.sdms.backend.modules.smartaccess.application.strategy.CurfewResolutionStrategy;
import com.sdms.backend.modules.smartaccess.application.strategy.TimeWindowEvaluationStrategy;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccessEvaluationServiceTest {

    @Mock private IdempotencyService idempotencyService;
    @Mock private EligibilityEvaluationService eligibilityEvaluationService;
    @Mock private CurfewResolutionStrategy curfewResolutionStrategy;
    @Mock private TimeWindowEvaluationStrategy timeWindowEvaluationStrategy;
    @Mock private AccessHistoryRepository accessHistoryRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AccessEvaluationService service;

    @Test
    void shouldHaltIfDuplicateEventDetected() {
        // Simulating Kafka/Network Retry delivering the same identity event twice
        when(idempotencyService.isDuplicateOrRegister("evt-123", "FACE_MODULE")).thenReturn(true);
        
        service.evaluateAccess("evt-123", UUID.randomUUID(), UUID.randomUUID(), VerificationMethod.FACE_AI);
        
        // Ensure no processing occurs downstream (Idempotency enforcement)
        verify(eligibilityEvaluationService, never()).evaluateEligibility(any());
        verify(accessHistoryRepository, never()).save(any());
    }
}
