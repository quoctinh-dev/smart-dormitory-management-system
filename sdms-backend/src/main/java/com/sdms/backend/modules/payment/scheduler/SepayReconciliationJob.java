package com.sdms.backend.modules.payment.scheduler;

import com.sdms.backend.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Job chạy định kỳ thực hiện đối soát và dọn dẹp các giao dịch thanh toán qua SePay.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SepayReconciliationJob {

    private final PaymentService paymentService;

    /**
     * Tác vụ đối soát tự động kích hoạt mỗi giờ một lần.
     *
     * @Scheduled(cron = "0 0 * * * ?"): Chạy vào phút thứ 0 của mỗi giờ (ví dụ: 1:00, 2:00, 3:00...).
     * @SchedulerLock: Đảm bảo chỉ 1 instance duy nhất được chạy tác vụ này khi triển khai đa máy chủ (Multi-node).
     *  - lockAtLeastFor = "5m": Khóa tối thiểu 5 phút để tránh chạy trùng lặp do lệch giờ giữa các server.
     *  - lockAtMostFor = "15m": Khóa tối đa 15 phút, tự giải phóng nếu server đang xử lý bị crash giữa chừng.
     */
    @Scheduled(cron = "0 0 * * * ?") // Hourly
    @SchedulerLock(name = "SepayReconciliationJob", lockAtLeastFor = "5m", lockAtMostFor = "15m")
    public void reconcilePayments() {
        log.info("[SepayReconciliationJob] Starting payment reconciliation...");

        // 1. Quét và chuyển trạng thái EXPIRED cho các đơn hàng PENDING đã quá thời hạn thanh toán
        paymentService.expirePendingPayments();

        // 2. Tự động kiểm tra và xử lý lại các giao dịch thành công bị bỏ sót do lỗi Webhook từ phía SePay
        log.info("[SepayReconciliationJob] Recovering missed webhooks from Gateway...");

        log.info("[SepayReconciliationJob] Reconciliation finished.");
    }
}