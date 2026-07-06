package com.sdms.backend.modules.application.event;

import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.DormitoryApplicationStatusHistory;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationStatusHistoryRepository;
import com.sdms.backend.modules.application.validator.WaitingListValidator;
import com.sdms.backend.modules.room.event.BedReleasedEvent;
import com.sdms.backend.modules.room.event.BedReservationFailedEvent;
import com.sdms.backend.modules.room.event.BedReservedEvent;
import com.sdms.backend.modules.room.event.HousingReservationExpiredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationEventListener {

    private final DormitoryApplicationRepository applicationRepository;
    private final DormitoryApplicationStatusHistoryRepository statusHistoryRepository;
    private final WaitingListValidator waitingListValidator;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * [DEPRECATED & DISABLED]
     * This logic is now handled by ApplicationReviewService (Phase 2)
     * and BillGenerationListener.
     * This listener is kept for historical and architectural reference but is functionally disabled.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBedReserved(BedReservedEvent event) {
        log.info("[ApplicationEventListener] handleBedReserved is disabled as of new workflow. Assignment {} will remain PENDING until reviewed.", event.getApplicationId());
        // The logic to move to WAITING_PAYMENT is now manually triggered by an Admin
        // in ApplicationReviewService.approveApplication.
        // The logic to create a bill is handled by BillGenerationListener.
        // This method is intentionally left blank.
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @org.springframework.context.event.EventListener
    public void handleBedReservationFailed(BedReservationFailedEvent event) {
        log.info("[ApplicationEventListener] Handling BedReservationFailedEvent for application={}", event.getApplicationId());

        DormitoryApplication application = applicationRepository.findById(event.getApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + event.getApplicationId()));

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.WAITING_LIST);
        application.setPaymentDeadline(null);
        applicationRepository.save(application);

        DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
        history.setApplication(application);
        history.setFromStatus(oldStatus);
        history.setToStatus(ApplicationStatus.WAITING_LIST);
        history.setChangedAt(LocalDateTime.now());
        history.setNote("Hệ thống hết giường trống, tự động đưa vào danh sách chờ");
        statusHistoryRepository.save(history);

        log.info("[ApplicationEventListener] Application={} status updated to WAITING_LIST", event.getApplicationId());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleHousingReservationExpired(HousingReservationExpiredEvent event) {
        log.info("[ApplicationEventListener] Handling HousingReservationExpiredEvent for application={}", event.getApplicationId());

        DormitoryApplication application = applicationRepository.findById(event.getApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + event.getApplicationId()));

        if (application.getStatus() != ApplicationStatus.WAITING_PAYMENT) {
            log.info("[ApplicationEventListener] Application={} is not in WAITING_PAYMENT status, skipping expiration", event.getApplicationId());
            return;
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.EXPIRED);
        applicationRepository.save(application);

        DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
        history.setApplication(application);
        history.setFromStatus(oldStatus);
        history.setToStatus(ApplicationStatus.EXPIRED);
        history.setChangedAt(LocalDateTime.now());
        history.setNote("Quá hạn thanh toán, hệ thống tự động hủy giữ chỗ");
        statusHistoryRepository.save(history);

        log.info("[ApplicationEventListener] Application={} status updated to EXPIRED", event.getApplicationId());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBedReleased(BedReleasedEvent event) {
        log.info("[ApplicationEventListener] Handling BedReleasedEvent for roomId={}, bedId={}, gender={}",
                event.getRoomId(), event.getBedId(), event.getGender());

        try {
            List<DormitoryApplication> candidates = applicationRepository.findWaitingListCandidates(
                    ApplicationStatus.WAITING_LIST,
                    event.getGender()
            );

            if (candidates.isEmpty()) {
                log.info("[ApplicationEventListener] No WAITING_LIST candidates found for gender {}", event.getGender());
                return;
            }

            DormitoryApplication candidate = candidates.get(0);

            DormitoryApplication application = applicationRepository.findByIdForUpdate(candidate.getApplicationId())
                    .orElseThrow(() -> new IllegalArgumentException("Candidate application not found: " + candidate.getApplicationId()));

            waitingListValidator.validatePromotionCandidate(application);

            ApplicationStatus oldStatus = application.getStatus();
            application.setStatus(ApplicationStatus.PENDING); // Chuyển về PENDING để chờ Admin duyệt lại
            application.setWaitingListUsed(true);
            applicationRepository.save(application);

            DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
            history.setApplication(application);
            history.setFromStatus(oldStatus);
            history.setToStatus(ApplicationStatus.PENDING);
            history.setChangedAt(LocalDateTime.now());
            history.setNote("Tự động thăng hạng từ danh sách chờ. Chờ Admin duyệt lại.");
            statusHistoryRepository.save(history);

            log.info("[ApplicationEventListener] Successfully promoted application={} from WAITING_LIST to PENDING. Waiting for Admin re-approval.",
                    application.getApplicationId());

        } catch (Exception e) {
            log.error("[ApplicationEventListener] Failed to process BedReleasedEvent for waiting list promotion", e);
        }
    }
}
