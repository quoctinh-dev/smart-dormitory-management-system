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
}
