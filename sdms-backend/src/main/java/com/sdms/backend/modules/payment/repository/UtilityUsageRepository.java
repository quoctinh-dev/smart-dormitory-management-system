package com.sdms.backend.modules.payment.repository;

import com.sdms.backend.modules.payment.entity.UtilityUsage;
import com.sdms.backend.modules.payment.enums.UtilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UtilityUsageRepository extends JpaRepository<UtilityUsage, UUID> {

    // Tìm bản ghi chốt số điện mới nhất của phòng
    Optional<UtilityUsage> findTopByRoomIdAndUtilityTypeOrderByYearDescMonthDesc(UUID roomId, UtilityType utilityType);

    // Tìm bản ghi chốt số điện theo tháng và năm cụ thể
    Optional<UtilityUsage> findByRoomIdAndUtilityTypeAndMonthAndYear(
            UUID roomId,
            UtilityType utilityType,
            Integer month,
            Integer year
    );

    // Lấy toàn bộ lịch sử ghi điện nước của 1 phòng, xếp mới nhất lên đầu
    java.util.List<UtilityUsage> findByRoomIdOrderByYearDescMonthDesc(UUID roomId);
}