package com.sdms.backend.modules.smartaccess.domain.repository;

import com.sdms.backend.modules.smartaccess.domain.entity.CurfewRequest;
import com.sdms.backend.modules.smartaccess.domain.enums.CurfewRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CurfewRequestRepository extends JpaRepository<CurfewRequest, UUID> {
    Page<CurfewRequest> findByStatus(CurfewRequestStatus status, Pageable pageable);
    Page<CurfewRequest> findByStudentStudentId(UUID studentId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM CurfewRequest c WHERE c.student.studentId = :studentId AND c.status = 'APPROVED' AND c.requestType = 'LATE_RETURN' AND c.expectedArrivalTime >= :startOfDay AND c.expectedArrivalTime <= :endOfDay")
    boolean hasApprovedRequestForDate(@org.springframework.data.repository.query.Param("studentId") UUID studentId, @org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay, @org.springframework.data.repository.query.Param("endOfDay") java.time.LocalDateTime endOfDay);
}
