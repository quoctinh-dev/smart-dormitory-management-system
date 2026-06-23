package com.sdms.backend.modules.smartaccess.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sdms.backend.modules.smartaccess.domain.entity.TimeWindowPolicy;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;

import java.util.List;
import java.util.UUID;

@Repository
public interface TimeWindowPolicyRepository extends JpaRepository<TimeWindowPolicy, UUID> {
    
    // Retrieves active time window policies for specific boarding/non-boarding resident types.
    // Used by TimeWindowEvaluationStrategy.
    List<TimeWindowPolicy> findByBuildingIdAndResidentTypeAndIsActiveTrue(UUID buildingId, ResidentType residentType);
}
