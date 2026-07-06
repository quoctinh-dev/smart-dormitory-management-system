package com.sdms.backend.modules.application.scheduler;

import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.service.ApplicationReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mục tiêu/Nghiệp vụ: Quét các hồ sơ đang ở trạng thái REQUEST_REVISION (Yêu cầu bổ sung tài liệu) nhưng đã quá hạn (revisionDeadline < now).
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Cron Job chạy định kỳ hàng giờ để từ chối các đơn vi phạm thời hạn bổ sung, nhả giường dự kiến để nhường cho sinh viên khác.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RevisionDeadlineExpiryJob {

    private final DormitoryApplicationRepository applicationRepository;
    private final ApplicationReviewService applicationReviewService;

    /**
     * Chạy mỗi giờ một lần ở phút số 0.
     * Quét tất cả các đơn REQUEST_REVISION đã quá revisionDeadline và tự động từ chối.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void expireMissedRevisionDeadlines() {
        log.info("[RevisionDeadlineExpiryJob] Starting job to check for expired revision deadlines...");
        LocalDateTime now = LocalDateTime.now();

        // Retrieve all applications in REQUEST_REVISION status
        List<DormitoryApplication> apps = applicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == ApplicationStatus.REQUEST_REVISION)
                .filter(a -> a.getRevisionDeadline() != null && a.getRevisionDeadline().isBefore(now))
                .collect(Collectors.toList());

        if (apps.isEmpty()) {
            log.info("[RevisionDeadlineExpiryJob] No expired revision deadlines found.");
            return;
        }

        log.info("[RevisionDeadlineExpiryJob] Found {} applications that missed their revision deadline.", apps.size());

        for (DormitoryApplication app : apps) {
            try {
                log.info("Rejecting application={} due to missed revision deadline.", app.getApplicationId());
                
                applicationReviewService.rejectApplication(
                        app.getApplicationId(),
                        "Hồ sơ bị từ chối tự động do sinh viên không bổ sung tài liệu đúng thời hạn yêu cầu.",
                        null // Hệ thống tự động
                );
            } catch (Exception e) {
                log.error("[RevisionDeadlineExpiryJob] Failed to reject application={}. Reason: {}", app.getApplicationId(), e.getMessage());
            }
        }

        log.info("[RevisionDeadlineExpiryJob] Job finished.");
    }
}
