package com.sdms.backend.modules.smartaccess.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;
import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;

import java.util.UUID;

@org.springframework.stereotype.Repository
public interface AccessHistoryRepository extends Repository<AccessHistory, UUID> {
    
    // APPEND-ONLY COMPLIANCE: Exposes ONLY the save method.
    // No delete(), deleteAll(), or update methods are exposed, cementing DB immutability.
    AccessHistory save(AccessHistory entity);

    // PAGINATION COMPLIANCE: Strict enforcement of Spring Data Pageable
    // Prevents Heap Out-Of-Memory (OOM) under massive physical access log volumes.
    Page<AccessHistory> findByStudentId(UUID studentId, Pageable pageable);

    Page<AccessHistory> findByGateId(UUID gateId, Pageable pageable);
    
    Page<AccessHistory> findByBuildingId(UUID buildingId, Pageable pageable);

    Page<AccessHistory> findAll(Pageable pageable);
}
