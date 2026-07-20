// 📄 Đường dẫn: src/main/java/com/sdms/backend/modules/room/service/CheckInService.java
package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.room.dto.response.CheckInSearchResponse;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.event.CheckInCompletedEvent;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.StudentStatus;
import com.sdms.backend.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckInService {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final DormitoryApplicationRepository applicationRepository;
    private final StudentRepository studentRepository; 
    private final com.sdms.backend.modules.room.repository.BedRepository bedRepository; 
    private final ApplicationEventPublisher eventPublisher;

    // 📄 Thay thế chính xác đoạn map DTO này trong file: src/main/java/com/sdms/backend/modules/room/service/CheckInService.java

    @Transactional(readOnly = true)
    public CheckInSearchResponse searchStudentForCheckIn(String cccd) {
        StudentHousingAssignment assignment = assignmentRepository
                .findForCheckInByCccdAndStatus(cccd.trim(), AssignmentStatus.PENDING_CHECKIN)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_ELIGIBLE, "Không tìm thấy dữ liệu xếp phòng hợp lệ, hoặc sinh viên chưa hoàn tất đóng lệ phí phòng."));

        // Lấy thực thể Floor và Building để tránh gọi chuỗi get quá dài dễ gây rối
        Floor floor = assignment.getBed().getRoom().getFloor();
        Building building = floor.getBuilding();

        return CheckInSearchResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .studentName(assignment.getStudent().getFullName())
                .studentCode(assignment.getStudent().getStudentCode())
                .cccd(assignment.getStudent().getCccd())
                .gender(assignment.getApplication() != null && assignment.getApplication().getGender() != null ? 
                        assignment.getApplication().getGender().name() : "N/A")

                // Lấy đúng avatarUrl từ entity Student
                .portraitUrl(assignment.getStudent().getAvatarUrl())

                // 🌟 FIX THEO ĐÚNG ENTITY BUILDING: Đổi sang .getName()
                .buildingName(building.getName())

                // 🌟 FIX THEO ĐÚNG ENTITY FLOOR: Chuyển Integer floorNumber sang dạng Chuỗi hiển thị (Vd: "Tầng 2")
                .floorName("Tầng " + floor.getFloorNumber())

                // Lấy mã phòng ở (Vd: "P.101") và mã giường ở (Vd: "G1") từ module Room
                .roomName(assignment.getBed().getRoom().getRoomCode())
                .bedName(assignment.getBed().getBedCode())
                .build();
    }

    @Transactional
    public void confirmCheckIn(UUID assignmentId) {
        StudentHousingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Bản ghi phân phòng không tồn tại."));

        if (assignment.getStatus() != AssignmentStatus.PENDING_CHECKIN) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Trạng thái phòng ở không hợp lệ để thực hiện thủ tục nhận phòng.");
        }

        // 1. Chuyển trạng thái phân giường sang OCCUPIED (Chính thức dọn vào ở)
        assignment.setStatus(AssignmentStatus.OCCUPIED);
        assignment.setCheckInAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
        
        // 1.1 Chuyển trạng thái giường sang OCCUPIED
        com.sdms.backend.modules.room.entity.Bed bed = assignment.getBed();
        if (bed != null) {
            bed.setStatus(com.sdms.backend.modules.room.enums.BedStatus.OCCUPIED);
            bedRepository.save(bed);
        }

        // 2. Chuyển trạng thái cư trú của Sinh viên từ PENDING_CHECKIN sang ACTIVE (Cư dân chính thức)
        Student student = assignment.getStudent();
        if (student != null) {
            // Thay bằng trạng thái hoạt động chính thức trong StudentStatus của bạn (Ví dụ: ACTIVE hoặc RESIDENT)
            student.setStatus(StudentStatus.ACTIVE);
            studentRepository.save(student);
            log.info("[CheckInService] Student {} status updated to ACTIVE.", student.getStudentCode());
        }

        // 3. Giữ nguyên trạng thái đơn là APPROVED theo đúng tập hợp đóng băng của ApplicationStatus
        DormitoryApplication application = assignment.getApplication();
        UUID applicationId = null;
        if (application != null) {
            application.setStatus(ApplicationStatus.APPROVED);
            applicationRepository.save(application);
            applicationId = application.getApplicationId();
        }

        // 4. KÍCH NỔ SỰ KIỆN VỆ TINH: Tách biệt phân hệ mở rộng
        log.info("[CheckInService] Publishing CheckInCompletedEvent for assignmentId={}", assignmentId);
        eventPublisher.publishEvent(new CheckInCompletedEvent(this, assignmentId, applicationId,
                student != null ? student.getStudentId() : null,
                student != null ? student.getEmail() : null,
                student != null ? student.getFullName() : null,
                assignment.getBed().getBedCode(),
                assignment.getBed().getRoom().getRoomCode()));
    }
}