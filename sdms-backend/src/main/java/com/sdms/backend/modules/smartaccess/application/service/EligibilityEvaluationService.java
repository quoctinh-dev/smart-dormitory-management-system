package com.sdms.backend.modules.smartaccess.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentEligibilitySnapshot;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentQueryPort;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EligibilityEvaluationService {

    private final StudentQueryPort studentQueryPort;

    public Optional<StudentEligibilitySnapshot> evaluateEligibility(UUID studentId) {
        Optional<StudentEligibilitySnapshot> snapshotOpt = studentQueryPort.getStudentEligibility(studentId);
        
        if (snapshotOpt.isEmpty()) {
            return Optional.empty(); // Fail Closed: Not found
        }

        StudentEligibilitySnapshot snapshot = snapshotOpt.get();
        // Strict ACL constraint: Student must be specifically "ACTIVE"
        if (!"ACTIVE".equals(snapshot.getStatus())) {
            return Optional.empty(); 
        }

        return Optional.of(snapshot);
    }
}
