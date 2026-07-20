package com.sdms.backend.modules.smartaccess.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentQueryPort {
    Optional<StudentEligibilitySnapshot> getStudentEligibility(UUID studentId);
    Optional<StudentEligibilitySnapshot> getEligibilityByRfid(String rfidCode);
    
    /**
     * Get eligibility by PIN code for a specific gate (room door).
     * PIN must match a student actively assigned to the room linked to this gate.
     */
    Optional<StudentEligibilitySnapshot> getEligibilityByPin(String pinCode, UUID gateId);
    
    /**
     * Get all active RFID codes for offline caching in IoT devices.
     */
    java.util.Map<java.util.UUID, List<String>> getActiveRfidWhitelistsByBuilding();
}
