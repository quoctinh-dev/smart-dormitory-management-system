package com.sdms.backend.modules.room.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class HousingJobScheduler {

    private final PaymentExpireJob paymentExpireJob;
    private final RoomOccupancyReconciliationJob roomOccupancyReconciliationJob;

    /**
     * Tác vụ quét dọn đơn hàng quá hạn thanh toán.
     * Chạy định kỳ mỗi 5 phút. Khóa tối đa 4 phút, tối thiểu 2 phút để tránh lặp.
     */
    @Scheduled(cron = "0 */5 * * * *")
    @SchedulerLock(name = "paymentExpireJobLock", lockAtMostFor = "4m", lockAtLeastFor = "2m")
    public void runPaymentExpireJob() {
        log.info("Starting paymentExpireJob via scheduler...");
        paymentExpireJob.execute();
        log.info("Finished paymentExpireJob.");
    }

    /**
     * Tác vụ đối soát và tự phục hồi dữ liệu phòng.
     * Chạy định kỳ vào 02:00 AM hàng ngày. Khóa tối đa 50 phút, tối thiểu 10 phút.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @SchedulerLock(name = "roomReconciliationJobLock", lockAtMostFor = "50m", lockAtLeastFor = "10m")
    public void runRoomReconciliationJob() {
        log.info("Starting roomReconciliationJob via scheduler...");
        roomOccupancyReconciliationJob.execute();
        log.info("Finished roomReconciliationJob.");
    }
}
