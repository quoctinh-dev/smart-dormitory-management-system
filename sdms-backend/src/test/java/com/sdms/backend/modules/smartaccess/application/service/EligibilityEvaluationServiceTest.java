package com.sdms.backend.modules.smartaccess.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentEligibilitySnapshot;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentQueryPort;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EligibilityEvaluationServiceTest {

    @Mock
    private StudentQueryPort port;

    @InjectMocks
    private EligibilityEvaluationService service;

    @Test
    void shouldFailClosedIfStudentSuspended() {
        UUID studentId = UUID.randomUUID();
        // Core Identity reports student is SUSPENDED
        StudentEligibilitySnapshot snapshot = StudentEligibilitySnapshot.builder().status("SUSPENDED").build();
        when(port.getStudentEligibility(studentId)).thenReturn(Optional.of(snapshot));

        // Smart Access must Fail Closed. Only 'ACTIVE' is permitted.
        assertTrue(service.evaluateEligibility(studentId).isEmpty(), "Fail closed must reject non-ACTIVE statuses");
    }
}
