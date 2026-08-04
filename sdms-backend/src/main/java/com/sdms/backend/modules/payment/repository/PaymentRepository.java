package com.sdms.backend.modules.payment.repository;

import com.sdms.backend.modules.payment.entity.Payment;
import com.sdms.backend.modules.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByTransactionCode(String transactionCode);

    Optional<Payment> findByBill_BillIdAndStatus(UUID billId, PaymentStatus status);

    List<Payment> findByStatus(PaymentStatus status);

    @Modifying
    @Query("UPDATE Payment p SET p.status = :newStatus WHERE p.status = :oldStatus AND p.createdAt < :timeLimit")
    int updateStatusForOldPendingPayments(
            @Param("oldStatus") PaymentStatus oldStatus,
            @Param("newStatus") PaymentStatus newStatus,
            @Param("timeLimit") LocalDateTime timeLimit
    );

    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);

    List<Payment> findByBill_BillId(UUID billId);

    @Modifying
    @Query("DELETE FROM Payment p WHERE p.bill.billId IN :billIds")
    void deleteAllByBillIds(@Param("billIds") List<UUID> billIds);
}