package com.sdms.backend.modules.payment.event;

import com.sdms.backend.modules.payment.service.BillService;
import com.sdms.backend.modules.room.event.BedReservedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillGenerationListener {

    private final BillService billService;

    /**
     * Lắng nghe sự kiện một giường đã được giữ chỗ thành công (BedReservedEvent).
     * Nhiệm vụ của listener này là tạo ra một hóa đơn tiền phòng (Accommodation Fee)
     * ở trạng thái UNPAID, chờ sinh viên thanh toán.
     *
     * @param event Sự kiện chứa thông tin về việc giữ chỗ.
     */

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleBedReservedEvent(BedReservedEvent event) {
        log.info("[BillGenerationListener] Handling BedReservedEvent for assignmentId={}", event.getAssignmentId());
        try {
            // 🌟 FIX TẠI ĐÂY: Đổi số tiền đóng lần đầu thành 2.100.000 VND
            BigDecimal accommodationFee = new BigDecimal("2100000");

            billService.createAccommodationBill(
                    event.getAssignmentId(),
                    event.getApplicationId(),
                    accommodationFee
            );

            log.info("[BillGenerationListener] Successfully created accommodation bill for assignmentId={} with amount {}",
                    event.getAssignmentId(), accommodationFee);

        } catch (Exception e) {
            log.error("[BillGenerationListener] Failed to create bill for assignmentId={}. Reason: {}",
                    event.getAssignmentId(), e.getMessage(), e);
        }
    }
}
