package com.sdms.backend.modules.application.event;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.DormitoryApplicationStatusHistory;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationStatusHistoryRepository;
import com.sdms.backend.modules.application.validator.WaitingListValidator;
import com.sdms.backend.modules.room.event.BedReleasedEvent;
import com.sdms.backend.modules.room.event.BedReservationFailedEvent;
import com.sdms.backend.modules.room.event.HousingReservationExpiredEvent;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Event Listener lắng nghe các sự kiện liên quan đến đơn đăng ký KTX và giường ở.
 * <p>
 * Xử lý cập nhật trạng thái đơn tự động khi:
 * - Giữ chỗ thất bại (chuyển sang WAITING_LIST)
 * - Quá hạn thanh toán giữ chỗ (chuyển sang EXPIRED)
 * - Giải phóng giường ở (thăng hạng tự động từ WAITING_LIST lên PENDING)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationEventListener {

    private final DormitoryApplicationRepository applicationRepository;
    private final DormitoryApplicationStatusHistoryRepository statusHistoryRepository;
    private final WaitingListValidator waitingListValidator;
    private final ApplicationEventPublisher eventPublisher;


    /**
     * Lắng nghe sự kiện xếp giường thất bại (do hết giường trống phù hợp).
     * Tự động chuyển trạng thái đơn sang Danh sách chờ (WAITING_LIST) và ghi lại lịch sử.
     */
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

        // Ghi vết lịch sử thay đổi trạng thái
        DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
        history.setApplication(application);
        history.setFromStatus(oldStatus);
        history.setToStatus(ApplicationStatus.WAITING_LIST);
        history.setChangedAt(LocalDateTime.now());
        history.setNote("Hệ thống hết giường trống, tự động đưa vào danh sách chờ");
        statusHistoryRepository.save(history);

        log.info("[ApplicationEventListener] Application={} status updated to WAITING_LIST", event.getApplicationId());
    }

    /**
     * Lắng nghe sự kiện hết hạn thanh toán giữ chỗ (HousingReservationExpiredEvent).
     * Nếu hồ sơ đang ở trạng thái WAITING_PAYMENT, hệ thống sẽ tự động chuyển sang EXPIRED và hủy giữ chỗ.
     */
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

        // Ghi vết lịch sử thay đổi trạng thái
        DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
        history.setApplication(application);
        history.setFromStatus(oldStatus);
        history.setToStatus(ApplicationStatus.EXPIRED);
        history.setChangedAt(LocalDateTime.now());
        history.setNote("Quá hạn thanh toán, hệ thống tự động hủy giữ chỗ");
        statusHistoryRepository.save(history);

        log.info("[ApplicationEventListener] Application={} status updated to EXPIRED", event.getApplicationId());
    }

    /**
     * Lắng nghe sự kiện giường ở được giải phóng (BedReleasedEvent).
     * Tìm hồ sơ có điểm ưu tiên cao nhất trong WAITING_LIST cùng giới tính để thăng hạng về PENDING chờ Admin duyệt.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBedReleased(BedReleasedEvent event) {
        log.info("[ApplicationEventListener] Handling BedReleasedEvent for roomId={}, bedId={}, gender={}",
                event.getRoomId(), event.getBedId(), event.getGender());

        try {
            // Lấy danh sách ứng viên trong hàng chờ thỏa mãn điều kiện giới tính
            List<DormitoryApplication> candidates = applicationRepository.findWaitingListCandidates(
                    ApplicationStatus.WAITING_LIST,
                    event.getGender()
            );

            if (candidates.isEmpty()) {
                log.info("[ApplicationEventListener] No WAITING_LIST candidates found for gender {}", event.getGender());
                return;
            }

            DormitoryApplication candidate = candidates.get(0);

            // Khóa dòng để tránh xung đột dữ liệu khi thăng hạng
            DormitoryApplication application = applicationRepository.findByIdForUpdate(candidate.getApplicationId())
                    .orElseThrow(() -> new IllegalArgumentException("Candidate application not found: " + candidate.getApplicationId()));

            // Kiểm tra điều kiện thăng hạng của ứng viên
            waitingListValidator.validatePromotionCandidate(application);

            ApplicationStatus oldStatus = application.getStatus();
            application.setStatus(ApplicationStatus.PENDING); // Chuyển về PENDING để chờ Admin duyệt lại
            application.setWaitingListUsed(true);
            applicationRepository.save(application);

            // Ghi vết lịch sử thay đổi trạng thái
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