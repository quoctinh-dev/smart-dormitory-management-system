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

/**
 * Mục tiêu/Nghiệp vụ: Cung cấp dữ liệu sinh viên (trạng thái, phòng, thẻ RFID) cho module Smart Access.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Áp dụng Adapter Pattern thuộc lớp Infrastructure trong Hexagonal Architecture. 
 * Lưu ý Kiến thức (Dành cho phản biện): 
 * - Đây là một Adapter thực thi Port (StudentQueryPort) được định nghĩa ở tầng Application.
 * - Nhờ kiến trúc này, module Smart Access hoàn toàn mù (không phụ thuộc trực tiếp) vào module Student. Nếu sau này hệ thống thay đổi cơ sở dữ liệu hoặc cấu trúc của module Student, chỉ cần sửa file Adapter này, không làm vỡ logic của Smart Access.
 */
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
                .stream()
                .sorted((a1, a2) -> {
                    // Ưu tiên ROOM_LEADER > DEPUTY_LEADER > MEMBER
                    if (a1.getRoomRole() == com.sdms.backend.modules.room.enums.RoomRole.ROOM_LEADER) return -1;
                    if (a2.getRoomRole() == com.sdms.backend.modules.room.enums.RoomRole.ROOM_LEADER) return 1;
                    if (a1.getRoomRole() == com.sdms.backend.modules.room.enums.RoomRole.DEPUTY_LEADER) return -1;
                    if (a2.getRoomRole() == com.sdms.backend.modules.room.enums.RoomRole.DEPUTY_LEADER) return 1;
                    return 0;
                })
                .findFirst()
                .map(this::mapToSnapshot);
    }

    @Override
    public java.util.Map<java.util.UUID, List<String>> getActiveRfidWhitelistsByBuilding() {
        List<Object[]> results = assignmentRepository.findActiveRfidsGroupedByBuilding(com.sdms.backend.modules.room.enums.AssignmentStatus.OCCUPIED);
        java.util.Map<java.util.UUID, List<String>> map = new java.util.HashMap<>();
        for (Object[] row : results) {
            java.util.UUID buildingId = (java.util.UUID) row[0];
            String rfid = (String) row[1];
            map.computeIfAbsent(buildingId, k -> new java.util.ArrayList<>()).add(rfid);
        }
        return map;
    }
}
