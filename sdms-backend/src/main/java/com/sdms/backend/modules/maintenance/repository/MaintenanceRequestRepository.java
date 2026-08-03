package com.sdms.backend.modules.maintenance.repository;

import com.sdms.backend.modules.maintenance.entity.MaintenanceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, UUID> {
    Page<MaintenanceRequest> findByStudentIdOrderByCreatedAtDesc(UUID studentId, Pageable pageable);
    Page<MaintenanceRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
