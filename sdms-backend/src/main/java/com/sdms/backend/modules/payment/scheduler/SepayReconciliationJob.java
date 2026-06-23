package com.sdms.backend.modules.payment.scheduler;

import com.sdms.backend.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SepayReconciliationJob {

    private final PaymentService paymentService;

    @Scheduled(cron = "0 0 * * * ?") // Hourly
    @SchedulerLock(name = "SepayReconciliationJob", lockAtLeastFor = "5m", lockAtMostFor = "15m")
    public void reconcilePayments() {
        log.info("[SepayReconciliationJob] Starting payment reconciliation...");
        
        // 1. Expire old pending payments
        paymentService.expirePendingPayments();
        
        // 2. Recover missed webhooks (Placeholder for actual API call to SePay GET /transactions)
        log.info("[SepayReconciliationJob] Recovering missed webhooks from Gateway...");
        // TODO: Call SePay API and process transactions that match pending PENDING transactionCodes
        
        log.info("[SepayReconciliationJob] Reconciliation finished.");
    }
}
