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
 * Validator kiểm tra các ràng buộc nghiệp vụ cấp Giường (Bed).
 */
@Component
@RequiredArgsConstructor
public class BedValidator {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final List<AssignmentStatus> activeStatuses = List.of(AssignmentStatus.RESERVED, AssignmentStatus.OCCUPIED);

    /**
     * RÀNG BUỘC: Không được đưa giường đi bảo trì (MAINTENANCE) nếu giường đó đã được khóa
     * bởi luồng Payment (RESERVED) hoặc đang được sinh viên sử dụng thực tế (OCCUPIED).
     */
    public void validateCanMaintenance(UUID bedId) {
        boolean isBedLocked = assignmentRepository
                .existsByBed_BedIdAndStatusIn(bedId, activeStatuses);

        if (isBedLocked) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Cannot put bed into maintenance. It is currently bound to an active reservation or occupied status.");
        }
    }
}