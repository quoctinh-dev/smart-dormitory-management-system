package com.sdms.backend.modules.room.repository;

import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

/**
 * Repository trung tâm cho nghiệp vụ lưu trú (Housing Assignment).
 * * * DESIGN NOTES:
 * 1. Application-Centric: Mọi query giai đoạn 'RESERVED' (Waiting Payment) 
 * phải sử dụng application_id để truy vấn.
 * 2. Student-Centric: Các query về định danh cư dân sau khi 'Payment Success' 
 * (trạng thái OCCUPIED) sẽ sử dụng student_id.
 * 3. Business Integrity: Sử dụng 'existsByApplication_ApplicationIdAndStatusIn' 
 * để chặn logic phân bổ trùng lặp trên cùng một hồ sơ.
 * 4. Infrastructure Protection (ROOM-04): Cung cấp các chốt chặn validation phạm vi (scoped queries)
 * từ cấp Building đến cấp Bed để ngăn chặn việc phá hủy cấu trúc dữ liệu lưu trú realtime.
 */
@Repository
public interface StudentHousingAssignmentRepository
        extends JpaRepository<StudentHousingAssignment, UUID> {

    // ========================================================================
    // 1. DASHBOARD & REPORTING
    // ========================================================================

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT a FROM StudentHousingAssignment a WHERE a.assignmentId = :id")
    Optional<StudentHousingAssignment> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);

    /**
     * Dashboard: Truy xuất danh sách theo trạng thái (RESERVED, OCCUPIED, CHECKED_OUT, CANCELLED).
     */
    List<StudentHousingAssignment> findByStatus(AssignmentStatus status);

    /**
     * Dashboard KPI: Đếm tổng số lượng Assignment trên toàn bộ hệ thống theo một trạng thái cụ thể.
     */
    long countByStatus(AssignmentStatus status);

    /**
     * ROOM-04 FIX (Capacity Validation): Đếm số lượng cư dân đang OCCUPIED thực tế tại RIÊNG MỘT PHÒNG cụ thể.
     */
    long countByBed_Room_RoomIdAndStatus(UUID roomId, AssignmentStatus status);

    // ========================================================================
    // 2. APPLICATION & PAYMENT FLOW (RESERVED PHASE)
    // ========================================================================

    /**
     * Dùng trong luồng Payment/Waiting List: Truy xuất Assignment bằng Application ID.
     */
    Optional<StudentHousingAssignment> findByApplication_ApplicationIdAndStatus(
            UUID applicationId,
            AssignmentStatus status
    );

    List<StudentHousingAssignment> findByApplication_ApplicationId(UUID applicationId);

    /**
     * Tìm kiếm các Assignment có trạng thái RESERVED được tạo trước một mốc thời gian cụ thể (quá hạn thanh toán).
     */
    List<StudentHousingAssignment> findByStatusAndReservedAtBefore(
            AssignmentStatus status,
            LocalDateTime reservedAt
    );

    /**
     * Kiểm tra tính duy nhất: Đảm bảo 1 hồ sơ không được gán nhiều giường cùng lúc.
     */
    boolean existsByApplication_ApplicationIdAndStatusIn(
            UUID applicationId,
            List<AssignmentStatus> statuses
    );

    // ========================================================================
    // 3. INFRASTRUCTURE & SAFETY VALIDATION (ROOM-04 LAYER)
    // ========================================================================

    /**
     * Kiểm tra ràng buộc Bed: Xác định giường có đang được sử dụng trong Assignment ACTIVE không.
     * Dùng cho logic validate trước khi đưa giường đi bảo trì (validateCanMaintenance).
     * Đồng thời phục vụ cho AssignmentValidator.validateBedIsAvailable() bảo vệ tính nguyên tử 1 Giường = 1 Sinh viên.
     */
    boolean existsByBed_BedIdAndStatusIn(UUID bedId, List<AssignmentStatus> statuses);

    /**
     * Truy vấn Assignment đang hoạt động của một giường cụ thể.
     */
    Optional<StudentHousingAssignment> findByBed_BedIdAndStatusIn(UUID bedId, List<AssignmentStatus> statuses);

    /**
     * Kiểm tra sự tồn tại Assignment tại cấp Room (Chặn đóng cửa phòng / đưa phòng vào trạng thái bảo trì).
     */
    boolean existsByBed_Room_RoomIdAndStatusIn(UUID roomId, List<AssignmentStatus> statuses);

    /**
     * Kiểm tra sự tồn tại Assignment tại cấp Floor (Chặn thay đổi chính sách giới tính/đóng tầng).
     */
    boolean existsByBed_Room_Floor_FloorIdAndStatusIn(UUID floorId, List<AssignmentStatus> statuses);

    /**
     * Kiểm tra sự tồn tại Assignment tại cấp Building (Chặn đóng cửa / bảo trì toàn bộ tòa nhà).
     */
    boolean existsByBed_Room_Floor_Building_BuildingIdAndStatusIn(UUID buildingId, List<AssignmentStatus> statuses);

    // ========================================================================
    // 4. STUDENT & IOT INTEGRATION & LIFECYCLE CONSISTENCY (ROOM-04 STEP 04)
    // ========================================================================

    /**
     * Truy xuất Assignment theo Student (dùng cho AI, IoT, Student App sau khi thanh toán).
     */
    Optional<StudentHousingAssignment> findByStudent_StudentIdAndStatus(
            UUID studentId,
            AssignmentStatus status
    );

    /**
     * Truy xuất Assignment thông qua CCCD của sinh viên (phục vụ chức năng Check-in của Admin).
     */
    Optional<StudentHousingAssignment> findByStudent_CccdAndStatus(
            String cccd,
            AssignmentStatus status
    );

    /**
     * Lịch sử cư trú: Xem lại toàn bộ quá trình ở của sinh viên.
     */
    List<StudentHousingAssignment> findByStudent_StudentIdOrderByCheckInAtDesc(
            UUID studentId
    );

    /**
     * Hỗ trợ hệ thống IoT (ESP32/Cửa từ): Truy vấn ngược để biết giường này hiện
     * đang được phân bổ cho Assignment nào, từ đó xác định danh tính cư dân.
     */
    Optional<StudentHousingAssignment> findByBed_BedIdAndStatus(
            UUID bedId,
            AssignmentStatus status
    );

    /**
     * ROOM-04 STEP 04 ADD: Ràng buộc nguyên tử 1 Sinh viên = 1 Active Assignment.
     * Chặn đứng lỗ hổng dữ liệu một sinh viên có thể vừa giữ chỗ vừa ở thực tế tại 2 phòng khác nhau.
     */
    boolean existsByStudent_StudentIdAndStatusIn(UUID studentId, List<AssignmentStatus> statuses);
}