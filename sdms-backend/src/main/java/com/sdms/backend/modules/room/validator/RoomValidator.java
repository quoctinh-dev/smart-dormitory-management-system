package com.sdms.backend.modules.room.validator;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Validator kiểm tra các ràng buộc nghiệp vụ cấp Phòng (Room).
 * Bảo vệ và đảm bảo tính toàn vẹn dữ liệu đồng bộ cho các phân hệ tích hợp AI Face Recognition,
 * IoT Access Control (ESP32 cửa từ) và luồng giữ chỗ thanh toán (Payment Window).
 */
@Component
@RequiredArgsConstructor
public class RoomValidator {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final BedRepository bedRepository;

    // Tập hợp trạng thái cư trú ràng buộc an toàn, ngăn chặn việc can thiệp hạ tầng kỹ thuật vĩ mô
    private static final List<AssignmentStatus> ACTIVE_STATUSES = List.of(
            AssignmentStatus.RESERVED,
            AssignmentStatus.OCCUPIED
    );

    // ========================================================================
    // 1. INFRASTRUCTURE STATUS VALIDATION (ROOM-04 STEP 02)
    // ========================================================================

    /**
     * RÀNG BUỘC 1: Không được ĐÓNG phòng (CLOSED) khi có sinh viên lưu trú hoặc đang trong thời gian giữ chỗ thanh toán.
     */
    public void validateCanClose(UUID roomId) {
        if (hasActiveAssignments(roomId)) {
            throw new AppException(
                    "Cannot close room. Active room assignments or ongoing payment flows still exist.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * RÀNG BUỘC 2: Không cho phép chuyển trạng thái Phòng sang MAINTENANCE nếu phòng đó có sinh viên đang hoạt động,
     * tránh việc ngắt hoặc khóa lệnh truy cập của thiết bị phần cứng (ESP32/Cửa từ) sai thực tế khi sinh viên còn bên trong.
     */
    public void validateCanMaintenance(UUID roomId) {
        if (hasActiveAssignments(roomId)) {
            throw new AppException(
                    "Cannot put room into maintenance status while it contains active assignments.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * KIỂM TRA CHUYỂN ĐỔI TRẠNG THÁI: Điểm tập trung điều hướng các rule khi Admin thay đổi trạng thái phòng.
     * Chặn đứng rủi ro khi phòng từ bất kỳ trạng thái nào (kể cả AVAILABLE hay phòng đang FULL) cố tình chuyển sang CLOSED/MAINTENANCE.
     */
    public void validateStatusTransition(UUID roomId, RoomStatus targetStatus) {
        if (targetStatus == RoomStatus.MAINTENANCE) {
            validateCanMaintenance(roomId);
        } else if (targetStatus == RoomStatus.CLOSED) {
            validateCanClose(roomId);
        }
    }

    // ========================================================================
    // 2. CAPACITY & PHYSICAL BED VALIDATION (ROOM-04 STEP 03)
    // ========================================================================

    /**
     * RÀNG BUỘC THAY ĐỔI SỨC CHỨA (STEP 03.2):
     * Sức chứa cấu hình mới thiết lập không được nhỏ hơn số giường đang sử dụng thực tế của RIÊNG PHÒNG ĐÓ.
     * Khắc phục hoàn toàn lỗi đếm global (toàn hệ thống) cũ.
     */
    public void validateCapacity(UUID roomId, int newCapacity) {
        // Đếm chính xác số lượng cư dân OCCUPIED của riêng phòng này qua scoped query
        long currentRoomOccupied = assignmentRepository
                .countByBed_Room_RoomIdAndStatus(roomId, AssignmentStatus.OCCUPIED);

        if (newCapacity < currentRoomOccupied) {
            throw new AppException(
                    "Operation failed. New capacity (" + newCapacity + ") cannot be lower than current occupied beds in this room (" + currentRoomOccupied + ").",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * RÀNG BUỘC SỐ LƯỢNG GIƯỜNG VẬT LÝ (STEP 03.3):
     * Đảm bảo tổng số lượng giường thực tế đã tạo không vượt quá giới hạn thiết kế sức chứa của phòng.
     */
    public void validateBedCount(Room room) {
        long bedCount = bedRepository.countByRoom_RoomId(room.getRoomId());

        if (bedCount > room.getCapacity()) {
            throw new AppException(
                    "Data inconsistency detected. Physical bed count (" + bedCount + ") exceeds the room design capacity (" + room.getCapacity() + ").",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * RÀNG BUỘC SINH GIƯỜNG HÀNG LOẠT (STEP 03.4 BULK GENERATION):
     * Kiểm tra tính khả thi trước khi tiến hành Bulk tạo giường tự động.
     * Tổng số giường hiện tại cộng với số lượng muốn sinh thêm không được phép tràn bể chứa (Capacity).
     */
    public void validateCanGenerateBeds(Room room, int quantity) {
        long currentBedCount = bedRepository.countByRoom_RoomId(room.getRoomId());

        if ((currentBedCount + quantity) > room.getCapacity()) {
            throw new AppException(
                    "Cannot generate beds. Requested quantity (" + quantity + ") plus current beds (" + currentBedCount + ") would exceed room capacity limit (" + room.getCapacity() + ").",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    /**
     * Helper kiểm tra sự tồn tại của phiên gán phòng hoạt động (RESERVED/OCCUPIED) trong phạm vi Phòng.
     */
    private boolean hasActiveAssignments(UUID roomId) {
        return assignmentRepository.existsByBed_Room_RoomIdAndStatusIn(roomId, ACTIVE_STATUSES);
    }
}