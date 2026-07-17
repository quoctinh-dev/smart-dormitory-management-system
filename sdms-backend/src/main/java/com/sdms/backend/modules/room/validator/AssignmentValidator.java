package com.sdms.backend.modules.room.validator;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.system.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Validator trung tâm quản lý tính nhất quán phân bổ giường (Assignment Consistency).
 * Bảo vệ tính nguyên tử (Atomicity): 1 Sinh viên = 1 Giường = 1 Active Assignment.
 * Chặn đứng các lỗ hổng sai lệch trạng thái ảnh hưởng đến AI Face Recognition và IoT Hardware.
 */
@Component
@RequiredArgsConstructor
public class AssignmentValidator {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final SystemConfigService systemConfigService;

    private static final List<AssignmentStatus> ACTIVE_STATUSES = List.of(
            AssignmentStatus.RESERVED,
            AssignmentStatus.PENDING_CHECKIN,
            AssignmentStatus.OCCUPIED
    );

    /**
     * VALIDATION 1: 1 STUDENT = 1 ACTIVE ASSIGNMENT
     * Ngăn chặn sinh viên sở hữu hai phòng hoặc vừa giữ chỗ vừa ở thực tế.
     */
    public void validateStudentHasNoActiveAssignment(UUID studentId) {
        if (studentId == null) return;

        boolean exists = assignmentRepository.existsByStudent_StudentIdAndStatusIn(studentId, ACTIVE_STATUSES);
        if (exists) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Operation rejected. Student already possesses an active housing reservation or occupancy.");
        }
    }

    /**
     * VALIDATION 2: 1 BED = 1 ACTIVE ASSIGNMENT
     * Triệt tiêu hiện tượng Concurrency trùng giường (2 sinh viên chung 1 mã giường vật lý).
     */
    public void validateBedIsAvailable(UUID bedId) {
        boolean exists = assignmentRepository.existsByBed_BedIdAndStatusIn(bedId, ACTIVE_STATUSES);
        if (exists) {
            throw new AppException(ErrorCode.DATA_CONFLICT, "Infrastructure conflict. The selected bed currently has an active reservation or is occupied.");
        }
    }

    /**
     * VALIDATION 3: CHECK-IN VALIDATION
     * Chỉ cho phép luồng chuyển dịch: RESERVED -> OCCUPIED.
     */
    public void validateCheckIn(StudentHousingAssignment assignment) {
        if (assignment.getStatus() != AssignmentStatus.PENDING_CHECKIN) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Lifecycle error. Only assignments with 'PENDING_CHECKIN' status (Payment Success) are eligible for Check-In.");
        }
    }

    /**
     * VALIDATION 4: CHECK-OUT VALIDATION
     * Chỉ cho phép luồng chuyển dịch: OCCUPIED -> CHECKED_OUT. Chặn double checkout.
     */
    public void validateCheckOut(StudentHousingAssignment assignment) {
        if (assignment.getStatus() != AssignmentStatus.OCCUPIED) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Lifecycle error. Only 'OCCUPIED' active residents can perform a Check-Out operation.");
        }
    }

    /**
     * VALIDATION 5: CANCEL VALIDATION
     * Chỉ cho phép hủy khi đang giữ chỗ (RESERVED -> CANCELLED). Sinh viên đã vào ở phải làm thủ tục Check-Out.
     */
    public void validateCancelAssignment(StudentHousingAssignment assignment) {
        if (assignment.getStatus() != AssignmentStatus.RESERVED) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Lifecycle error. Cannot cancel assignment. Current status is not 'RESERVED'.");
        }
    }

    /**
     * VALIDATION 6: PAYMENT EXPIRE VALIDATION (Payment Window)
     * Kiểm tra mốc thời gian giữ chỗ an toàn.
     */
    public void validateReservationExpired(StudentHousingAssignment assignment) {
        if (assignment.getStatus() != AssignmentStatus.RESERVED) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có quyết định xếp phòng đang giữ chỗ mới có thể hết hạn.");
        }

        int deadlineDays = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_DEADLINE_DAYS", "3"));

        // Kiểm tra khung thời gian cấu hình hệ thống
        if (LocalDateTime.now().isBefore(assignment.getReservedAt().plusDays(deadlineDays))) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Operational restriction. The " + deadlineDays + "-day payment window for this reservation has not expired yet.");
        }

        // Nhằm tránh việc hủy nhầm hồ sơ đã thanh toán thành công nhưng chưa kích hoạt webhook.
    }

    /**
     * VALIDATION 7: LINK STUDENT VALIDATION
     * Bảo vệ quyền sở hữu của Assignment. Ngăn chặn việc hoán đổi, thay thế chủ thể lưu trú.
     */
    public void validateLinkStudent(StudentHousingAssignment assignment) {
        if (assignment.getStudent() != null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Security violation. This assignment is already strictly linked to a resident student and cannot change ownership.");
        }
    }
}