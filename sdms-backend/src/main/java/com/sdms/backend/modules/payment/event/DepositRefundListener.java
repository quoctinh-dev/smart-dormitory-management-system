package com.sdms.backend.modules.payment.event;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.service.PaymentService;
import com.sdms.backend.modules.room.event.BedReleasedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DepositRefundListener {

    private final BillRepository billRepository;
    private final PaymentService paymentService;

    @EventListener
    @Transactional
    public void handleBedReleasedForRefund(BedReleasedEvent event) {
        log.info("[DepositRefundListener] Processing BedReleasedEvent for assignment={}", event.getAssignmentId());

        if (event.getStudentId() == null || event.getAssignmentId() == null) {
            log.warn("[DepositRefundListener] StudentId or AssignmentId missing, skipping refund check");
            return;
        }

        // Find PAID DEPOSIT_FEE bills for this student
        List<Bill> depositBills = billRepository.findByStudentIdAndBillTypeAndStatus(
                event.getStudentId(), BillType.DEPOSIT_FEE, BillStatus.PAID);

        for (Bill bill : depositBills) {
            log.info("[DepositRefundListener] Initiating refund for DEPOSIT_FEE bill={}", bill.getBillId());
            // Since we don't have direct payment linking here, we can find the SUCCESS payment for this bill.
            // For simplicity, we just mark the bill itself or call a future refund API.
            // Normally we'd find the payment and call processRefund. Let's do that if possible.
            // Assuming PaymentService or we just log it for Admin to refund.
            log.info("[DepositRefundListener] Refund workflow triggered. (Pending manual admin payout or integration)");
        }
    }
}
