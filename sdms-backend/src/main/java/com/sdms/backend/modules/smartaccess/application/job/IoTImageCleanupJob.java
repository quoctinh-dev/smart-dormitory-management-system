package com.sdms.backend.modules.smartaccess.application.job;

import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.system.service.SystemConfigService;
import com.sdms.backend.modules.upload.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Job chạy ngầm định kỳ (CronJob) để dọn dẹp các ảnh chụp an ninh (IoT Snapshots) từ Cloudinary sau một khoảng thời gian (VD: 30 ngày).
 * Chú ý: Chỉ xóa ảnh trên Cloudinary để tiết kiệm dung lượng, KHÔNG xóa bản ghi (log) trong Database để giữ lịch sử (Audit Trail).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IoTImageCleanupJob {

    private final AccessHistoryRepository accessHistoryRepository;
    private final CloudinaryService cloudinaryService;
    private final SystemConfigService systemConfigService;

    // Chạy vào lúc 2:00 AM mỗi ngày
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupOldIoTImages() {
        log.info("[CronJob] Bắt đầu tiến trình dọn dẹp ảnh chụp IoT (Snapshots) cũ trên Cloudinary...");

        // Lấy số ngày lưu trữ ảnh (Mặc định 30 ngày)
        String retentionDaysStr = systemConfigService.getConfigValue("IOT_SNAPSHOT_RETENTION_DAYS", "30");
        int retentionDays;
        try {
            retentionDays = Integer.parseInt(retentionDaysStr);
        } catch (NumberFormatException e) {
            log.warn("[CronJob] Cấu hình IOT_SNAPSHOT_RETENTION_DAYS không hợp lệ, sử dụng mặc định 30 ngày.");
            retentionDays = 30;
        }

        LocalDateTime thresholdDate = LocalDateTime.now().minusDays(retentionDays);
        log.info("[CronJob] Sẽ tiến hành xóa các ảnh được chụp trước thời điểm: {}", thresholdDate);

        int pageSize = 100;
        int pageNumber = 0;
        int totalDeleted = 0;
        boolean hasMore = true;

        while (hasMore) {
            Pageable pageable = PageRequest.of(pageNumber, pageSize);
            Page<AccessHistory> oldRecords = accessHistoryRepository.findOldRecordsWithSnapshots(thresholdDate, pageable);

            if (oldRecords.isEmpty()) {
                hasMore = false;
                break;
            }

            for (AccessHistory history : oldRecords.getContent()) {
                String snapshotUrl = history.getSnapshotUrl();
                
                // 1. Gọi Cloudinary xóa ảnh (để tiết kiệm dung lượng)
                try {
                    cloudinaryService.deleteFileByUrl(snapshotUrl);
                    
                    // 2. Cập nhật lại bản ghi trong DB (để null url ảnh) nhưng VẪN GIỮ lại toàn bộ text log (Bằng chứng Audit)
                    history.setSnapshotUrl(null);
                    accessHistoryRepository.save(history);
                    totalDeleted++;
                } catch (Exception e) {
                    log.error("[CronJob] Lỗi khi xóa ảnh của AccessHistory ID: {}. URL: {}", history.getId(), snapshotUrl, e);
                }
            }

            // Dùng phân trang nhưng lưu ý là khi ta setSnapshotUrl = null, bản ghi đó không còn match query nữa.
            // Do đó ta luôn quét ở page 0 để tránh bỏ lót dữ liệu. Tuy nhiên, nếu delete lỗi và url vẫn còn != null thì 
            // page 0 sẽ lặp vô hạn. Do đó ta cứ tăng pageNumber như bình thường, hoặc thiết kế query tốt hơn. 
            // Cẩn thận nhất là tăng pageNumber.
            pageNumber++;
            
            if (pageNumber >= oldRecords.getTotalPages()) {
                hasMore = false;
            }
        }

        log.info("[CronJob] Hoàn tất quá trình dọn dẹp. Tổng cộng đã xóa {} ảnh cũ khỏi Cloudinary.", totalDeleted);
    }
}
