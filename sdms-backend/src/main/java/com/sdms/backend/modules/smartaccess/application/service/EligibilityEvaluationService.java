package com.sdms.backend.modules.smartaccess.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentEligibilitySnapshot;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentQueryPort;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class EligibilityEvaluationService {

    private final StudentQueryPort studentQueryPort;

    public Optional<StudentEligibilitySnapshot> evaluateEligibility(UUID studentId) {
        Optional<StudentEligibilitySnapshot> snapshotOpt = studentQueryPort.getStudentEligibility(studentId);
        
        if (snapshotOpt.isEmpty()) {
            return Optional.empty(); // Fail Closed: Not found
        }

        StudentEligibilitySnapshot snapshot = snapshotOpt.get();
        // Relaxed ACL constraint: Allow if they have an OCCUPIED room, unless explicitly INACTIVE/revoked
        if ("INACTIVE".equals(snapshot.getStatus())) {
            return Optional.empty(); 
        }

        return Optional.of(snapshot);
    }

    public Optional<StudentEligibilitySnapshot> evaluateEligibilityByRfid(String rfidCode) {
        Optional<StudentEligibilitySnapshot> snapshotOpt = studentQueryPort.getEligibilityByRfid(rfidCode);
        
        if (snapshotOpt.isEmpty()) {
            return Optional.empty();
        }

        StudentEligibilitySnapshot snapshot = snapshotOpt.get();
        if ("INACTIVE".equals(snapshot.getStatus())) {
            return Optional.empty(); 
        }

        return Optional.of(snapshot);
    }

    public Optional<StudentEligibilitySnapshot> evaluateEligibilityByPin(String pinCode, UUID gateId) {
        Optional<StudentEligibilitySnapshot> snapshotOpt = studentQueryPort.getEligibilityByPin(pinCode, gateId);

        if (snapshotOpt.isEmpty()) {
            return Optional.empty();
        }

        StudentEligibilitySnapshot snapshot = snapshotOpt.get();
        if ("INACTIVE".equals(snapshot.getStatus())) {
            return Optional.empty();
        }

        return Optional.of(snapshot);
    }

    public java.util.Map<java.util.UUID, java.util.List<String>> getActiveRfidWhitelistsByBuilding() {
        return studentQueryPort.getActiveRfidWhitelistsByBuilding();
    }
}
