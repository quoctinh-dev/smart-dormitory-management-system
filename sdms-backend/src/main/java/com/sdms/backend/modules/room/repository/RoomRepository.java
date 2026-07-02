package com.sdms.backend.modules.room.repository;

import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.room.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
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
public interface RoomRepository extends JpaRepository<Room, UUID>, JpaSpecificationExecutor<Room> {

    Optional<Room> findByFloor_FloorIdAndRoomCode(UUID floorId, String roomCode);

    boolean existsByFloor_FloorIdAndRoomCode(UUID floorId, String roomCode);

    List<Room> findByFloor_FloorId(UUID floorId);

    List<Room> findByStatus(RoomStatus status);

    @Query("SELECT r FROM Room r WHERE r.roomId = :roomId")
    Optional<Room> findByIdForUpdate(@Param("roomId") UUID roomId);

    /**
     * BUSINESS LOGIC: Tìm danh sách phòng khả dụng dựa trên chính sách giới tính kép (Building + Floor).
     * * Tòa nhà phải cùng giới tính hoặc là MIXED.
     * * Tầng phải trùng khớp tuyệt đối với giới tính sinh viên.
     */
    @Query("""
        SELECT r FROM Room r 
        WHERE (r.floor.building.gender = :buildingGender OR r.floor.building.gender = com.sdms.backend.modules.room.enums.BuildingGender.MIXED) 
        AND r.floor.gender = :studentGender 
        AND r.status = :status 
        ORDER BY r.occupiedBeds ASC
    """)
    List<Room> findAvailableRoomsByGender(
            @Param("studentGender") Gender studentGender,
            @Param("buildingGender") com.sdms.backend.modules.room.enums.BuildingGender buildingGender,
            @Param("status") RoomStatus status
    );
}