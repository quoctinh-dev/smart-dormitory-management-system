package com.sdms.backend.modules.payment.event;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.room.event.HousingReservationExpiredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillEventListener {

    private final BillRepository billRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleHousingReservationExpired(HousingReservationExpiredEvent event) {
        log.info("[BillEventListener] Handling HousingReservationExpiredEvent for assignment={}", event.getAssignmentId());

        Optional<Bill> billOpt = billRepository.findByAssignmentId(event.getAssignmentId());
        if (billOpt.isEmpty()) {
            log.warn("[BillEventListener] No bill found for expired assignment={}", event.getAssignmentId());
            return;
        }

        Bill bill = billOpt.get();
        if (bill.getStatus() == BillStatus.PAID) {
            log.info("[BillEventListener] Bill={} is already PAID, ignoring expiry for assignment={}", bill.getBillId(), event.getAssignmentId());
            return;
        }

        if (bill.getStatus() == BillStatus.UNPAID || bill.getStatus() == BillStatus.PARTIALLY_PAID) {
            bill.setStatus(BillStatus.CANCELLED);
            billRepository.save(bill);
            log.info("[BillEventListener] Bill={} CANCELLED for expired assignment={}", bill.getBillId(), event.getAssignmentId());
        }
    }
}
