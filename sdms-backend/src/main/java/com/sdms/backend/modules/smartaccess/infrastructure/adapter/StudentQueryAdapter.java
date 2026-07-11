package com.sdms.backend.modules.smartaccess.infrastructure.adapter;

import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
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
    private final StudentHousingAssignmentRepository assignmentRepository;

    @Override
    public Optional<StudentEligibilitySnapshot> getStudentEligibility(UUID studentId) {
        return assignmentRepository.findByStudentIdAndStatusOptimized(studentId, AssignmentStatus.OCCUPIED)
                .map(this::mapToSnapshot);
    }

    @Override
    public Optional<StudentEligibilitySnapshot> getEligibilityByRfid(String rfidCode) {
        return assignmentRepository.findByStudentRfidAndStatusOptimized(rfidCode, AssignmentStatus.OCCUPIED)
                .map(this::mapToSnapshot);
    }

    private StudentEligibilitySnapshot mapToSnapshot(StudentHousingAssignment assignment) {
        return StudentEligibilitySnapshot.builder()
                .studentId(assignment.getStudent().getStudentId())
                .status(assignment.getStudent().getStatus().name())
                .residentType(ResidentType.BOARDING)
                .buildingId(assignment.getBed().getRoom().getFloor().getBuilding().getBuildingId())
                .roomId(assignment.getBed().getRoom().getRoomId())
                .build();
    }

    @Override
    public Optional<StudentEligibilitySnapshot> getEligibilityByPin(String pinCode, UUID gateId) {
        return assignmentRepository.findByPinCodeAndGateIdAndStatus(pinCode, gateId, AssignmentStatus.OCCUPIED)
                .map(this::mapToSnapshot);
    }

    @Override
    public List<String> getActiveRfidWhitelists() {
        return studentRepository.findByStatusAndRfidCodeIsNotNull(StudentStatus.ACTIVE)
                .stream()
                .map(student -> student.getRfidCode())
                .collect(Collectors.toList());
    }
}
