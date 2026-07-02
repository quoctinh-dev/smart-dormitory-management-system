package com.sdms.backend.modules.payment.event;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.room.event.HousingReservationExpiredEvent;
import com.sdms.backend.modules.room.event.AssignmentCancelledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Optional;

/**
 * Mục tiêu/Nghiệp vụ: Dọn dẹp các hóa đơn (Bill) rác khi có sự kiện hủy phòng hoặc quá hạn giữ chỗ. Đảm bảo hệ thống tài chính không bị treo các khoản nợ ảo.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Sử dụng cơ chế Listener `@TransactionalEventListener` kết hợp với `@Transactional(propagation = Propagation.REQUIRES_NEW)`.
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích tại sao phải dùng `phase = TransactionPhase.AFTER_COMMIT` và `REQUIRES_NEW`: Tránh bẫy giao dịch (Transaction Risks). Khi module Room hủy phòng, nó phát ra Event. Nếu ta bắt Event bằng `@EventListener` thường, nó sẽ nhảy vào cùng một Transaction của Room. Nếu cập nhật Bill lỗi, nó sẽ kéo theo Room bị Rollback (hủy phòng thất bại). Việc dùng `AFTER_COMMIT` đảm bảo Room đã lưu trạng thái hủy thành công vào DB rồi thì Bill mới bắt đầu hủy. `REQUIRES_NEW` ép Spring mở một Transaction mới hoàn toàn độc lập.
 */
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

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleAssignmentCancelledEvent(AssignmentCancelledEvent event) {
        log.info("[BillEventListener] Handling AssignmentCancelledEvent for assignment={}, reason={}", event.getAssignmentId(), event.getReason());

        Optional<Bill> billOpt = billRepository.findByAssignmentId(event.getAssignmentId());
        if (billOpt.isEmpty()) {
            return;
        }

        Bill bill = billOpt.get();
        if (bill.getStatus() == BillStatus.PAID) {
            return;
        }

        if (bill.getStatus() == BillStatus.UNPAID || bill.getStatus() == BillStatus.PARTIALLY_PAID) {
            bill.setStatus(BillStatus.CANCELLED);
            billRepository.save(bill);
            log.info("[BillEventListener] Bill={} CANCELLED due to AssignmentCancelledEvent", bill.getBillId());
        }
    }
}
