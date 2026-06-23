package com.sdms.backend.modules.payment.event;

import com.sdms.backend.modules.payment.service.BillService;
import com.sdms.backend.modules.room.event.BedReservedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventListener {

    private final BillService billService;

    /**
     * Lắng nghe sự kiện xếp giường thành công (BedReservedEvent).
     * Tự động tạo hóa đơn tiền phòng cho sinh viên.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleBedReserved(BedReservedEvent event) {
        log.info("[PaymentEventListener] Handling BedReservedEvent for assignment={}", event.getAssignmentId());
        
        // Mức giá mặc định mẫu của hệ thống: 500,000 VND / tháng
        BigDecimal amount = BigDecimal.valueOf(500000.00);
        
        billService.createAccommodationBill(event.getAssignmentId(), event.getApplicationId(), amount);
        log.info("[PaymentEventListener] Created accommodation bill successfully for assignment={}", event.getAssignmentId());
    }
}
