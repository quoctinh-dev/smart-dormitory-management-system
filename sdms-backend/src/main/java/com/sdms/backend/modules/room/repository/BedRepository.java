package com.sdms.backend.modules.room.repository;

import com.sdms.backend.modules.room.entity.Bed;
import com.sdms.backend.modules.room.enums.BedStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

/**
 * Repository quản lý thực thể Giường (Bed).
 * * * DESIGN NOTES:
 * 1. Atomic Unit: Bed là đơn vị nhỏ nhất trong cấu trúc hạ tầng KTX (Building -> Floor -> Room -> Bed).
 * 2. Concurrency Control: Sử dụng Pessimistic Locking trong Assignment Engine để đảm bảo
 * tính toàn vẹn khi nhiều request phân bổ giường xảy ra đồng thời.
 * 3. Reporting: Cung cấp các hàm đếm (count) hỗ trợ Dashboard thống kê và bảo vệ dữ liệu cấu hình hạ tầng.
 */
@Repository
public interface BedRepository extends JpaRepository<Bed, UUID> {

    // ========================================================================
    // 1. DATA LOOKUP & UNIQUE CHECK
    // ========================================================================

    /**
     * Tìm kiếm giường theo mã code duy nhất (thường dùng để xác thực nhanh trên hệ thống IoT/Dashboard).
     */
    Optional<Bed> findByBedCode(String bedCode);

    /**
     * BUSINESS RULE: Mã giường (bedCode) phải là duy nhất trong phạm vi một phòng (room_id).
     * Dùng để validate trùng lặp khi tạo hoặc cập nhật thông tin giường.
     */
    boolean existsByRoom_RoomIdAndBedCode(UUID roomId, String bedCode);

    // ========================================================================
    // 2. CAPACITY & CAPACITY PROTECTION VALIDATION (ROOM-04 STEP 03)
    // ========================================================================

    /**
     * Hỗ trợ nghiệp vụ tính toán sức chứa: Đếm tổng số giường vật lý hiện có trong một phòng cụ thể.
     * Dùng cho RoomValidator.validateBedCount() và validateCanGenerateBeds() nhằm chặn đứng
     * lỗi dữ liệu khi số lượng giường sinh ra vượt quá thiết kế sức chứa của phòng.
     */
    long countByRoom_RoomId(UUID roomId);

    // ========================================================================
    // 3. DASHBOARD, METRICS & SCOPED FILTERING
    // ========================================================================

    /**
     * DASHBOARD: Đếm số lượng giường theo trạng thái cụ thể trên toàn hệ thống.
     * Dùng cho RoomDashboardService để thống kê KPI (AVAILABLE, MAINTENANCE, ...).
     */
    long countByStatus(BedStatus status);

    /**
     * Truy xuất danh sách giường theo trạng thái (Dùng cho báo cáo hoặc lọc Dashboard).
     */
    List<Bed> findByStatus(BedStatus status);

    /**
     * Truy xuất toàn bộ danh sách giường thuộc một phòng cụ thể.
     */
    List<Bed> findByRoom_RoomId(UUID roomId);

    // ========================================================================
    // 4. CORE ENGINE CONCURRENCY OPERATION
    // ========================================================================

    /**
     * ASSIGNMENT ENGINE: Tìm các giường khả dụng trong một phòng để thực hiện phân bổ.
     * * * LOCKING: Sử dụng PESSIMISTIC_WRITE để khóa các bản ghi được trả về,
     * ngăn chặn hoàn toàn Race Condition khi hệ thống đang xử lý nhiều lượt đăng ký
     * vào cùng một phòng trong tích tắc.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT b FROM Bed b 
        WHERE b.room.roomId = :roomId 
        AND b.status = :status 
        ORDER BY b.bedCode ASC
    """)
    List<Bed> findAvailableBeds(
            @Param("roomId") UUID roomId,
            @Param("status") BedStatus status
    );
}