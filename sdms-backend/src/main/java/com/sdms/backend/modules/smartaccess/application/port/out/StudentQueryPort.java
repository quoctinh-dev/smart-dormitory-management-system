package com.sdms.backend.modules.smartaccess.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface StudentQueryPort {
    Optional<StudentEligibilitySnapshot> getStudentEligibility(UUID studentId);
}
