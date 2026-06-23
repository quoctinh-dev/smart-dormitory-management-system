package com.sdms.backend.modules.room.repository;

import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.OccupancyPolicy;
import com.sdms.backend.modules.room.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository quản lý dữ liệu Phòng (Room).
 * * BUSINESS RULE:
 * - Mã phòng (roomCode) là duy nhất trong phạm vi một tầng (floor_id).
 * - Trạng thái phòng (status) quyết định khả năng phân bổ chỗ ở (reserve).
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    Optional<Room> findByFloor_FloorIdAndRoomCode(UUID floorId, String roomCode);

    boolean existsByFloor_FloorIdAndRoomCode(UUID floorId, String roomCode);

    List<Room> findByFloor_FloorId(UUID floorId);

    List<Room> findByStatus(RoomStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.roomId = :roomId")
    Optional<Room> findByIdForUpdate(@Param("roomId") UUID roomId);

    /**
     * BUSINESS LOGIC: Tìm danh sách phòng khả dụng dựa trên chính sách giới tính của tầng.
     * * ORDERING: Sắp xếp theo số lượng giường đã chiếm (occupiedBeds) tăng dần
     * để ưu tiên lấp đầy phòng có ít người trước (tối ưu hóa phân bổ).
     * * FIXED DÒNG 41: Sửa @Param("roomStatus") thành @Param("status") để khớp hoàn toàn với JPQL :status.
     */
    @Query("""
        SELECT r FROM Room r 
        WHERE r.floor.occupancyPolicy = :policy 
        AND r.status = :status 
        ORDER BY r.occupiedBeds ASC
    """)
    List<Room> findAvailableRoomsByPolicy(
            @Param("policy") OccupancyPolicy policy,
            @Param("status") RoomStatus status
    );
}