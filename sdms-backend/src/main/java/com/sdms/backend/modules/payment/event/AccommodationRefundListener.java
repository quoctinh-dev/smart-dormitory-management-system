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
public class AccommodationRefundListener {

    private final BillRepository billRepository;
    private final PaymentService paymentService;

    @EventListener
    @Transactional
    public void handleBedReleasedForRefund(BedReleasedEvent event) {
        log.info("[AccommodationRefundListener] Processing BedReleasedEvent for assignment={}", event.getAssignmentId());

        if (event.getStudentId() == null || event.getAssignmentId() == null) {
            log.warn("[AccommodationRefundListener] StudentId or AssignmentId missing, skipping refund check");
            return;
        }

        // Tìm các hóa đơn tiền phòng (ACCOMMODATION_FEE) đã đóng
        List<Bill> accommodationBills = billRepository.findByStudentIdAndBillTypeAndStatus(
                event.getStudentId(), BillType.ACCOMMODATION_FEE, BillStatus.PAID);

        // Lọc ra các hóa đơn thuộc về chính assignment này
        List<Bill> assignmentBills = accommodationBills.stream()
                .filter(bill -> event.getAssignmentId().equals(bill.getAssignmentId()))
                .toList();

        if (!assignmentBills.isEmpty()) {
            log.info("[AccommodationRefundListener] Found {} PAID accommodation bills. Initiating calculation for unused months refund.", assignmentBills.size());
            // Kích hoạt luồng hoàn tiền phòng dư cho kế toán xử lý
            log.info("[AccommodationRefundListener] Refund workflow triggered. (Pending manual admin payout or integration)");
        }
    }
}
