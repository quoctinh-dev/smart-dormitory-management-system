package com.sdms.backend.modules.payment.scheduler;

import com.sdms.backend.modules.payment.entity.Bill;
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

import com.sdms.backend.modules.payment.service.BillService;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillOverdueJob {

    private final BillRepository billRepository;
    private final BillService billService;

    @Scheduled(cron = "0 0 0 * * ?")
    @SchedulerLock(name = "BillOverdueJob", lockAtLeastFor = "5m", lockAtMostFor = "15m")
    @Transactional
    public void markOverdueBills() {
        processOverdueBills();
    }

    public void processOverdueBills() {
        log.info("[BillOverdueJob] Starting job to mark unpaid bills as overdue...");
        List<Bill> billsToMark = billRepository.findBillsToMarkOverdue(
                List.of(BillStatus.UNPAID, BillStatus.PARTIALLY_PAID),
                LocalDate.now()
        );
        
        int updatedCount = 0;
        for (Bill bill : billsToMark) {
            bill.setStatus(BillStatus.OVERDUE);
            billRepository.save(bill);
            updatedCount++;

        }
        
        log.info("[BillOverdueJob] Successfully marked {} bills as OVERDUE.", updatedCount);
    }
}
