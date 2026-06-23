package com.sdms.backend.modules.room.validator;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Validator kiểm tra các ràng buộc nghiệp vụ cấp Tòa nhà (Building).
 * Bảo vệ luồng dữ liệu tích hợp IoT, AI và luồng thanh toán Payment Flow 3 ngày.
 * * DESIGN NOTES:
 * Chặn đứng các thao tác làm thay đổi trạng thái hạ tầng vĩ mô khi hệ thống
 * vẫn đang ghi nhận các phiên đăng ký giường hoạt động (RESERVED hoặc OCCUPIED).
 */
@Component
@RequiredArgsConstructor
public class BuildingValidator {

    private final StudentHousingAssignmentRepository assignmentRepository;

    // Danh sách các trạng thái ràng buộc cư trú an toàn hệ thống
    private static final List<AssignmentStatus> ACTIVE_STATUSES = List.of(
            AssignmentStatus.RESERVED,
            AssignmentStatus.OCCUPIED
    );

    /**
     * RÀNG BUỘC: Không cho phép chuyển trạng thái Tòa nhà thành CLOSED nếu vẫn còn cư dân.
     * Tránh việc ngắt kết nối cấu trúc hạ tầng đột ngột khi dòng tiền hoặc sinh viên đang vận hành.
     */
    public void validateCanClose(UUID buildingId) {
        if (hasActiveResidents(buildingId)) {
            throw new AppException(
                    "Cannot close building. There are still active reservations (Payment Window) or occupied residents inside.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * RÀNG BUỘC: Không cho phép chuyển trạng thái Tòa nhà sang MAINTENANCE nếu tồn tại
     * sinh viên đang giữ chỗ (RESERVED) hoặc đang lưu trú thực tế (OCCUPIED).
     * Đảm bảo các hệ thống AI Face Access và IoT RFID Access không bị cô lập dữ liệu sai thực tế.
     */
    public void validateCanMaintenance(UUID buildingId) {
        if (hasActiveResidents(buildingId)) {
            throw new AppException(
                    "Cannot put building into maintenance. Active bookings or occupied residents currently exist.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Helper kiểm tra sự tồn tại của phiên cư trú hoạt động trong phạm vi Tòa nhà.
     */
    private boolean hasActiveResidents(UUID buildingId) {
        return assignmentRepository.existsByBed_Room_Floor_Building_BuildingIdAndStatusIn(buildingId, ACTIVE_STATUSES);
    }
}