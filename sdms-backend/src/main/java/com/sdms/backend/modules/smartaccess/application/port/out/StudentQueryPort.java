package com.sdms.backend.modules.smartaccess.application.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentQueryPort {
    Optional<StudentEligibilitySnapshot> getStudentEligibility(UUID studentId);
    Optional<StudentEligibilitySnapshot> getEligibilityByRfid(String rfidCode);
    
    /**
     * Get all active RFID codes for offline caching in IoT devices.
     */
    List<String> getActiveRfidWhitelists();
}
