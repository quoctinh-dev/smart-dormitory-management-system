package com.sdms.backend.modules.registration.scheduler;

import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.DormitoryApplicationStatusHistory;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationStatusHistoryRepository;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Mục tiêu/Nghiệp vụ: Xử lý tự động đóng đợt đăng ký và giải phóng hồ sơ tồn đọng.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Sử dụng Spring @Scheduled (Cron Job) chạy hàng ngày.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RegistrationPeriodClosureJob {

    private final RegistrationPeriodRepository periodRepository;
    private final DormitoryApplicationRepository applicationRepository;
    private final com.sdms.backend.modules.application.service.ApplicationReviewService applicationReviewService;

    /**
     * Chạy mỗi ngày vào lúc 00:05.
     * Tìm các kỳ đăng ký đã qua ngày kết thúc (endDate < now) nhưng vẫn đang isActive = true.
     * Tự động tắt đợt đăng ký và từ chối tất cả hồ sơ đang ở danh sách chờ (WAITING_LIST) hoặc chưa duyệt (PENDING, UNDER_REVIEW).
     */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void closeExpiredPeriodsAndRejectWaitingList() {
        log.info("[RegistrationPeriodClosureJob] Starting job to check expired registration periods...");
        LocalDateTime now = LocalDateTime.now();

        List<RegistrationPeriod> periods = periodRepository.findAll();
        
        for (RegistrationPeriod period : periods) {
            if (Boolean.TRUE.equals(period.getIsActive()) && period.getEndDate().isBefore(now)) {
                log.info("Found expired active period: {}. Proceeding to close and reject waiting list.", period.getPeriodName());
                
                // 1. Vô hiệu hóa đợt đăng ký
                period.setIsActive(false);
                periodRepository.save(period);
                
                // 2. Tìm tất cả hồ sơ đang chờ trong đợt này (PENDING, UNDER_REVIEW, WAITING_LIST)
                List<DormitoryApplication> pendingApps = applicationRepository.findByRegistrationPeriod_PeriodIdAndStatusIn(
                        period.getPeriodId(), 
                        List.of(ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.WAITING_LIST)
                );
                
                if (!pendingApps.isEmpty()) {
                    log.info("Found {} applications to reject for period: {}", pendingApps.size(), period.getPeriodName());
                    for (DormitoryApplication app : pendingApps) {
                        try {
                            applicationReviewService.rejectApplication(
                                app.getApplicationId(),
                                "Đợt đăng ký đã kết thúc nhưng Ký túc xá vẫn không có phòng trống. Mong bạn thông cảm tìm trọ ngoài.",
                                null // Auto by system
                            );
                        } catch (Exception e) {
                            log.error("Failed to reject application={} upon period closure: {}", app.getApplicationId(), e.getMessage());
                        }
                    }
                }
            }
        }
        log.info("[RegistrationPeriodClosureJob] Job completed.");
    }
}
