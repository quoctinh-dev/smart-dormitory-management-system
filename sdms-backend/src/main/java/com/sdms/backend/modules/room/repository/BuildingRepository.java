package com.sdms.backend.modules.room.repository;

import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.enums.BuildingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository cho Building (Aggregate Root của Room Module).
 * Sử dụng UUID làm khóa chính theo chuẩn SDMS.
 */
@Repository
public interface BuildingRepository extends JpaRepository<Building, UUID> {

    /**
     * Tìm tòa nhà dựa trên mã (ví dụ: A, B, C).
     * Được sử dụng cho các API lookup nhanh.
     */
    Optional<Building> findByCode(String code);

    /**
     * Kiểm tra sự tồn tại của mã tòa nhà trước khi tạo mới.
     * Hỗ trợ logic validate cho Service Layer.
     */
    boolean existsByCode(String code);

    /**
     * Lọc danh sách tòa nhà theo trạng thái (ACTIVE, MAINTENANCE, CLOSED).
     * Hỗ trợ nhu cầu quản trị của Admin.
     */
    List<Building> findByStatus(BuildingStatus status);
}