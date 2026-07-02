package com.sdms.backend.modules.room.repository;

import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.common.enums.Gender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository cho thực thể Floor (Tầng).
 * Quản lý logic truy vấn tầng thuộc tòa nhà và chính sách cư trú.
 */
@Repository
public interface FloorRepository extends JpaRepository<Floor, UUID> {

    /**
     * Lấy danh sách tất cả các tầng thuộc một tòa nhà cụ thể.
     * Sử dụng naming convention của Spring Data để join qua buildingId.
     */
    List<Floor> findByBuilding_BuildingId(UUID buildingId);

    /**
     * Lọc các tầng theo chính sách cư trú (ví dụ: MALE, FEMALE).
     * Phục vụ nhu cầu quản trị và báo cáo của Admin.
     */
    List<Floor> findByGender(Gender gender);

    /**
     * Kiểm tra tính duy nhất của floor_number trong cùng một tòa nhà.
     * Được dùng trong Service Layer để ngăn chặn lỗi trùng lặp khi tạo tầng mới.
     */
    boolean existsByBuilding_BuildingIdAndFloorNumber(UUID buildingId, Integer floorNumber);
}