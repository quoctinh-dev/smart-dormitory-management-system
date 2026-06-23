package com.sdms.backend.modules.smartaccess.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sdms.backend.modules.smartaccess.domain.entity.CurfewPolicy;

import java.util.List;
import java.util.UUID;

@Repository
public interface CurfewPolicyRepository extends JpaRepository<CurfewPolicy, UUID> {
    
    // Retrieves all active curfew policies for a specific building.
    // Used by CurfewResolutionStrategy to resolve overlaps based on priority.
    List<CurfewPolicy> findByBuildingIdAndIsActiveTrue(UUID buildingId);
}
