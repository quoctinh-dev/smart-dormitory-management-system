package com.sdms.backend.modules.payment.scheduler;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.event.BillReminderEvent;
import com.sdms.backend.modules.payment.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BillReminderScheduler {

    private final BillRepository billRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(cron = "0 0 8 * * ?") // 8:00 AM every day
    @Transactional(readOnly = true)
    public void scanAndRemindBills() {
        log.info("Starting BillReminderScheduler to scan unpaid bills...");
        LocalDate today = LocalDate.now();
        LocalDate dueIn3Days = today.plusDays(3);
        LocalDate dueIn1Day = today.plusDays(1);
        LocalDate yesterday = today.minusDays(1);

        // Remind 3 days before
        remindBills(dueIn3Days, "DUE_SOON_3_DAYS");
        // Remind 1 day before
        remindBills(dueIn1Day, "DUE_SOON_1_DAY");
        // Remind overdue (1 day after due date)
        remindBills(yesterday, "OVERDUE");
        
        log.info("BillReminderScheduler completed scanning.");
    }

    private void remindBills(LocalDate targetDate, String reminderType) {
        try {
            List<Bill> bills = billRepository.findByStatusAndDueDate(BillStatus.UNPAID, targetDate);
            log.info("Found {} bills for reminder type {} on target date {}", bills.size(), reminderType, targetDate);
            
            for (Bill bill : bills) {
                if (bill.getStudentId() != null) {
                    eventPublisher.publishEvent(new BillReminderEvent(
                            bill.getBillId(),
                            bill.getStudentId(),
                            bill.getBillCode(),
                            bill.getBillType(),
                            bill.getAmount(),
                            bill.getDueDate(),
                            reminderType
                    ));
                }
            }
        } catch (Exception e) {
            log.error("Error processing bill reminders for type {}: {}", reminderType, e.getMessage(), e);
        }
    }
}
