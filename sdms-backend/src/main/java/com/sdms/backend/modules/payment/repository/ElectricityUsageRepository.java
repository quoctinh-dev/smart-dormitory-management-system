package com.sdms.backend.modules.payment.repository;

import com.sdms.backend.modules.payment.entity.ElectricityUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ElectricityUsageRepository extends JpaRepository<ElectricityUsage, UUID> {
    Optional<ElectricityUsage> findTopByRoomIdOrderByYearDescMonthDesc(UUID roomId);
}
