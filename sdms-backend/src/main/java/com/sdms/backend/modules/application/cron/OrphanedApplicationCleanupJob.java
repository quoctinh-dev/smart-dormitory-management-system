package com.sdms.backend.modules.application.cron;

import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.VerificationDocument;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.VerificationDocumentRepository;
import com.sdms.backend.modules.upload.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrphanedApplicationCleanupJob {

    private final DormitoryApplicationRepository applicationRepository;
    private final VerificationDocumentRepository documentRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Chạy vào lúc 2:00 AM mỗi ngày.
     * Quét và xóa các đơn đăng ký (và file ảnh kèm theo) ở trạng thái DRAFT quá 7 ngày.
     * Giúp dọn dẹp "Rác Cloudinary" và tối ưu tài nguyên Database.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupOrphanedApplications() {
        log.info("[Cleanup Job] Bắt đầu quét các hồ sơ DRAFT quá hạn...");
        
        LocalDateTime thresholdDate = LocalDateTime.now().minusDays(7);
        List<DormitoryApplication> draftApps = applicationRepository.findByStatusAndSubmittedAtIsNullAndCreatedAtBefore(ApplicationStatus.PENDING, thresholdDate);
        
        if (draftApps.isEmpty()) {
            log.info("[Cleanup Job] Không có hồ sơ rác nào cần dọn dẹp.");
            return;
        }

        int deletedAppCount = 0;
        int deletedFileCount = 0;

        for (DormitoryApplication app : draftApps) {
            try {
                // Xóa file rác trên Cloudinary
                List<VerificationDocument> docs = documentRepository.findByApplication_ApplicationId(app.getApplicationId());
                for (VerificationDocument doc : docs) {
                    if (doc.getFileUrl() != null && !doc.getFileUrl().isEmpty()) {
                        cloudinaryService.deleteFileByUrl(doc.getFileUrl());
                        deletedFileCount++;
                    }
                }
                
                // Spring Data JPA sẽ tự động Cascade Delete docs và history (nếu có config)
                // Tuy nhiên ở đây gọi xóa trực tiếp Application, repo tự xử lý cascade.
                applicationRepository.delete(app);
                deletedAppCount++;
                
                log.info("[Cleanup Job] Đã xóa hồ sơ rác ID: {}", app.getApplicationId());
            } catch (Exception e) {
                log.error("[Cleanup Job] Lỗi khi xóa hồ sơ rác ID: {}", app.getApplicationId(), e);
            }
        }
        
        log.info("[Cleanup Job] Dọn dẹp hoàn tất. Đã xóa {} hồ sơ và {} file rác trên Cloudinary.", deletedAppCount, deletedFileCount);
    }
}
