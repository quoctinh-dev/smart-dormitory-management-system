package com.sdms.backend.modules.student.repository;

import com.sdms.backend.modules.student.entity.CheckoutRequest;
import com.sdms.backend.modules.student.enums.CheckoutStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface CheckoutRequestRepository extends JpaRepository<CheckoutRequest, UUID> {
    
    Optional<CheckoutRequest> findByStudent_StudentCodeAndStatus(String studentCode, CheckoutStatus status);
    
    boolean existsByStudent_StudentIdAndStatus(UUID studentId, CheckoutStatus status);
    
    List<CheckoutRequest> findAllByStudent_StudentIdOrderByCreatedAtDesc(UUID studentId);

    Page<CheckoutRequest> findByStatus(CheckoutStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM CheckoutRequest c WHERE " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(CAST(:startDate AS timestamp) IS NULL OR c.createdAt >= :startDate) AND " +
            "(CAST(:endDate AS timestamp) IS NULL OR c.createdAt <= :endDate)")
    Page<CheckoutRequest> findByFilters(
            @org.springframework.data.repository.query.Param("status") CheckoutStatus status,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate,
            Pageable pageable);
}
