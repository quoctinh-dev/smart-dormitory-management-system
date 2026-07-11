package com.sdms.backend.modules.payment.repository;

import com.sdms.backend.modules.payment.entity.UtilityType;
import com.sdms.backend.modules.payment.entity.UtilityUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface UtilityUsageRepository extends JpaRepository<UtilityUsage, UUID> {
    Optional<UtilityUsage> findTopByRoomIdAndUtilityTypeOrderByYearDescMonthDesc(UUID roomId, UtilityType utilityType);
    Optional<UtilityUsage> findByRoomIdAndUtilityTypeAndMonthAndYear(UUID roomId, UtilityType utilityType, Integer month, Integer year);
}
