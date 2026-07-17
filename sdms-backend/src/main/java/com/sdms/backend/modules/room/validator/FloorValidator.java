package com.sdms.backend.modules.room.validator;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Validator kiểm tra các ràng buộc nghiệp vụ cấp Tầng (Floor).
 */
@Component
@RequiredArgsConstructor
public class FloorValidator {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final List<AssignmentStatus> activeStatuses = List.of(AssignmentStatus.RESERVED, AssignmentStatus.OCCUPIED);

    /**
     * RÀNG BUỘC: Không được thay đổi chính sách giới tính (MALE / FEMALE) của Tầng
     * khi tầng đó đang chịu ràng buộc bởi các lệnh đặt phòng hoạt động.
     */
    public void validatePolicyChange(UUID floorId) {
        boolean hasActiveResidents = assignmentRepository
                .existsByBed_Room_Floor_FloorIdAndStatusIn(floorId, activeStatuses);

        if (hasActiveResidents) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Cannot alter floor gender policy. Active reservations or residents exist on this floor.");
        }
    }
}