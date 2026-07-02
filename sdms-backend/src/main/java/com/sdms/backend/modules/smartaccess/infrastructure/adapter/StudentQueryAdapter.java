package com.sdms.backend.modules.smartaccess.infrastructure.adapter;

import com.sdms.backend.modules.smartaccess.application.port.out.StudentEligibilitySnapshot;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentQueryPort;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class StudentQueryAdapter implements StudentQueryPort {

    @Override
    public Optional<StudentEligibilitySnapshot> getStudentEligibility(UUID studentId) {
        // For now, this acts as a stub to resolve the ApplicationContext missing bean error
        // and allow the SmartAccess module to boot up.
        return Optional.of(StudentEligibilitySnapshot.builder()
                .studentId(studentId)
                .status("ACTIVE")
                .residentType(ResidentType.BOARDING)
                .buildingId(UUID.randomUUID())
                .build());
    }
}
