package com.sdms.backend.modules.utility.repository;

import com.sdms.backend.modules.utility.entity.ElectricityUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ElectricityUsageRepository extends JpaRepository<ElectricityUsage, UUID> {
    Optional<ElectricityUsage> findTopByRoomIdOrderByYearDescMonthDesc(UUID roomId);
}
