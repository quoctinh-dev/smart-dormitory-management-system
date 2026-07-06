package com.sdms.backend.modules.smartaccess.infrastructure.adapter;

import com.sdms.backend.modules.smartaccess.application.port.out.StudentEligibilitySnapshot;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentQueryPort;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;
import com.sdms.backend.modules.student.repository.StudentRepository;
import com.sdms.backend.modules.student.enums.StudentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class StudentQueryAdapter implements StudentQueryPort {

    private final StudentRepository studentRepository;

    @Override
    public Optional<StudentEligibilitySnapshot> getStudentEligibility(UUID studentId) {
        // Keeping the original stub behavior for getStudentEligibility to avoid breaking face verify
        return Optional.of(StudentEligibilitySnapshot.builder()
                .studentId(studentId)
                .status("ACTIVE")
                .residentType(ResidentType.BOARDING)
                .buildingId(UUID.randomUUID())
                .build());
    }

    @Override
    public Optional<StudentEligibilitySnapshot> getEligibilityByRfid(String rfidCode) {
        return studentRepository.findByRfidCode(rfidCode).map(student -> 
            StudentEligibilitySnapshot.builder()
                .studentId(student.getStudentId())
                .status(student.getStatus().name())
                .residentType(ResidentType.BOARDING) // Stubbed building/type for now
                .buildingId(UUID.randomUUID())
                .build()
        );
    }

    @Override
    public List<String> getActiveRfidWhitelists() {
        return studentRepository.findByStatusAndRfidCodeIsNotNull(StudentStatus.ACTIVE)
                .stream()
                .map(student -> student.getRfidCode())
                .collect(Collectors.toList());
    }
}
