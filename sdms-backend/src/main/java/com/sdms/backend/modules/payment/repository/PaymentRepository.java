package com.sdms.backend.modules.payment.repository;

import com.sdms.backend.modules.payment.entity.Payment;
import com.sdms.backend.modules.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByTransactionCode(String transactionCode);

    List<Payment> findByStatus(PaymentStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Payment p SET p.status = :newStatus WHERE p.status = :oldStatus AND p.createdAt < :timeLimit")
    int updateStatusForOldPendingPayments(
            @org.springframework.data.repository.query.Param("oldStatus") PaymentStatus oldStatus,
            @org.springframework.data.repository.query.Param("newStatus") PaymentStatus newStatus,
            @org.springframework.data.repository.query.Param("timeLimit") java.time.LocalDateTime timeLimit);
    
    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
}