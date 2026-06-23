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

    @org.springframework.beans.factory.annotation.Value("${application.payment.deadline-days:3}")
    private int deadlineDays;

    /**
     * Xử lý sự kiện giữ giường thành công (BedReservedEvent).
     * Cập nhật trạng thái đơn sang WAITING_PAYMENT và thiết lập hạn thanh toán 3 ngày.
     * Chạy trong giao dịch mới độc lập để cô lập ranh giới Bounded Context.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBedReserved(BedReservedEvent event) {
        log.info("[ApplicationEventListener] Handling BedReservedEvent for application={}", event.getApplicationId());
        
        DormitoryApplication application = applicationRepository.findById(event.getApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + event.getApplicationId()));

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.WAITING_PAYMENT);
        application.setPaymentDeadline(LocalDateTime.now().plusDays(deadlineDays));
        applicationRepository.save(application);
        
        // Ghi lại lịch sử trạng thái
        DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
        history.setApplication(application);
        history.setFromStatus(oldStatus);
        history.setToStatus(ApplicationStatus.WAITING_PAYMENT);
        history.setChangedAt(LocalDateTime.now());
        history.setNote("Hệ thống tự động xếp giường thành công, đang chờ thanh toán");
        statusHistoryRepository.save(history);
        
        log.info("[ApplicationEventListener] Application={} status updated to WAITING_PAYMENT with 3 days deadline", event.getApplicationId());
    }

    /**
     * Xử lý sự kiện giữ giường thất bại do cạn kiệt phòng trống (BedReservationFailedEvent).
     * Cập nhật trạng thái đơn sang WAITING_LIST.
     * Chạy trong giao dịch mới độc lập.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBedReservationFailed(BedReservationFailedEvent event) {
        log.info("[ApplicationEventListener] Handling BedReservationFailedEvent for application={}", event.getApplicationId());

        DormitoryApplication application = applicationRepository.findById(event.getApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + event.getApplicationId()));

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.WAITING_LIST);
        application.setPaymentDeadline(null);
        applicationRepository.save(application);

        // Ghi lại lịch sử trạng thái
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
     * Xử lý sự kiện hết hạn giữ chỗ (HousingReservationExpiredEvent).
     * Cập nhật trạng thái đơn sang EXPIRED.
     * Chạy trong giao dịch mới độc lập.
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

        // Ghi lại lịch sử trạng thái
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
     * Lắng nghe sự kiện giường được giải phóng (BedReleasedEvent).
     * Tự động thăng hạng ứng viên tiếp theo trong danh sách chờ có giới tính phù hợp.
     * Chạy trong giao dịch mới độc lập sau khi Bed/Assignment commit thành công.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBedReleased(BedReleasedEvent event) {
        log.info("[ApplicationEventListener] Handling BedReleasedEvent for roomId={}, bedId={}, gender={}", 
                event.getRoomId(), event.getBedId(), event.getGender());
        
        try {
            // 1. Quét tìm ứng viên có điểm ưu tiên cao nhất đang trong trạng thái WAITING_LIST và cùng giới tính
            List<DormitoryApplication> candidates = applicationRepository.findWaitingListCandidates(
                    ApplicationStatus.WAITING_LIST,
                    event.getGender()
            );

            if (candidates.isEmpty()) {
                log.info("[ApplicationEventListener] No WAITING_LIST candidates found for gender {}", event.getGender());
                return;
            }

            // Chọn ứng viên đầu tiên (đầu hàng đợi theo waiting list ranking)
            DormitoryApplication candidate = candidates.get(0);
            
            // 2. Nạp và khóa bi quan ứng viên để tránh race condition
            DormitoryApplication application = applicationRepository.findByIdForUpdate(candidate.getApplicationId())
                    .orElseThrow(() -> new IllegalArgumentException("Candidate application not found: " + candidate.getApplicationId()));

            // 3. Kiểm tra tính hợp lệ và chặn vòng lặp vô hạn
            waitingListValidator.validatePromotionCandidate(application);

            // 4. Cập nhật trạng thái sang APPROVED và đánh dấu đã sử dụng hàng đợi thăng hạng
            ApplicationStatus oldStatus = application.getStatus();
            application.setStatus(ApplicationStatus.APPROVED);
            application.setWaitingListUsed(true); // Đánh dấu đã thăng hạng để chống lặp vòng vô hạn
            applicationRepository.save(application);

            // Ghi lịch sử trạng thái
            DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
            history.setApplication(application);
            history.setFromStatus(oldStatus);
            history.setToStatus(ApplicationStatus.APPROVED);
            history.setChangedAt(LocalDateTime.now());
            history.setNote("Tự động thăng hạng từ danh sách chờ sau khi giải phóng giường");
            statusHistoryRepository.save(history);

            log.info("[ApplicationEventListener] Successfully promoted application={} from WAITING_LIST to APPROVED. Publishing ApplicationApprovedEvent...", 
                    application.getApplicationId());

            // 5. Phát sự kiện ApplicationApprovedEvent để Room Module tự động giữ giường
            eventPublisher.publishEvent(new ApplicationApprovedEvent(
                    this,
                    application.getApplicationId(),
                    application.getGender().name(),
                    application.getPriorityScore()
            ));

        } catch (Exception e) {
            log.error("[ApplicationEventListener] Failed to process BedReleasedEvent for waiting list promotion", e);
        }
    }
}
