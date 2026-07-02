package com.sdms.backend.modules.room.scheduler;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.event.ReservationPaymentExpiredEvent;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Mục tiêu/Nghiệp vụ: Tự động quét và phát hiện các hóa đơn giữ chỗ (Accommodation Fee) chưa thanh toán nhưng đã quá hạn. Phát sự kiện để hủy đơn, nhả giường (giải phóng tài nguyên) và xóa hóa đơn rác.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Sử dụng cơ chế lập lịch `@Scheduled` của Spring với biểu thức Cron (Cron Task) để chạy định kỳ. Sử dụng Event-Driven để phát sự kiện `ReservationPaymentExpiredEvent` (Publisher-Subscriber Pattern).
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích tại sao chỉ phát Event mà không xóa/cập nhật trực tiếp DB tại đây: Do Job Scheduler chạy nền, nếu gọi hàm update chéo nhiều module (Room, Bill, Application) sẽ dính phải "Distributed Transaction" rủi ro cao. Bắn Event giúp phân tán nghiệp vụ về các Domain tự xử lý độc lập (Choreography Saga Pattern). Biểu thức cron được thiết lập giúp job chạy mỗi 5 phút.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationExpiryJob {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final HousingAssignmentService housingAssignmentService;
    private final BillRepository billRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Chạy mỗi 5 phút để quét và báo quá hạn các Bill giữ chỗ.
     */
    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    public void expireOldReservations() {
        log.info("[Scheduler] Running ExpireOldReservations job from Bills...");
        LocalDate today = LocalDate.now();

        List<Bill> expiredBills = billRepository.findByStatusAndDueDateBefore(BillStatus.UNPAID, today);

        if (expiredBills.isEmpty()) {
            log.info("[Scheduler] No expired unpaid bills found.");
            return;
        }

        log.info("[Scheduler] Found {} expired unpaid bills to process.", expiredBills.size());
        for (Bill bill : expiredBills) {
            try {
                if (bill.getBillType() == BillType.ACCOMMODATION_FEE || bill.getBillType() == BillType.DEPOSIT_FEE) { // assuming these are the reservation types
                    Optional<StudentHousingAssignment> assignmentOpt = assignmentRepository.findById(bill.getAssignmentId());
                    if (assignmentOpt.isPresent() && assignmentOpt.get().getStatus() == AssignmentStatus.RESERVED) {
                        StudentHousingAssignment assignment = assignmentOpt.get();
                        eventPublisher.publishEvent(new ReservationPaymentExpiredEvent(
                                this,
                                bill.getBillId(),
                                assignment.getAssignmentId(),
                                assignment.getApplication().getApplicationId(),
                                assignment.getBed().getBedId(),
                                assignment.getStudent() != null ? assignment.getStudent().getStudentId() : null
                        ));
                        log.info("[Scheduler] Emitted ReservationPaymentExpiredEvent for assignmentId: {}", assignment.getAssignmentId());
                    }
                }
            } catch (Exception e) {
                log.error("[Scheduler] Failed to emit expiry event for billId: {}. Reason: {}",
                        bill.getBillId(), e.getMessage(), e);
            }
        }
        log.info("[Scheduler] ExpireOldReservations job finished.");
    }
}
