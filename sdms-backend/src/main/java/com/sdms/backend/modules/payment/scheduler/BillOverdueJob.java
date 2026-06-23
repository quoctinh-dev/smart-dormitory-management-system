package com.sdms.backend.modules.payment.scheduler;

import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillOverdueJob {

    private final BillRepository billRepository;

    @Scheduled(cron = "0 0 0 * * ?")
    @SchedulerLock(name = "BillOverdueJob", lockAtLeastFor = "5m", lockAtMostFor = "15m")
    @Transactional
    public void markOverdueBills() {
        log.info("[BillOverdueJob] Starting job to mark unpaid bills as overdue...");
        int updatedCount = billRepository.updateOverdueBills(
                List.of(BillStatus.UNPAID, BillStatus.PARTIALLY_PAID),
                BillStatus.OVERDUE,
                LocalDate.now()
        );
        log.info("[BillOverdueJob] Successfully marked {} bills as OVERDUE.", updatedCount);
    }
}
