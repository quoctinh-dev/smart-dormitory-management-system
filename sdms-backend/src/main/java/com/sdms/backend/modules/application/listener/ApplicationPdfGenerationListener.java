package com.sdms.backend.modules.application.listener;

import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.event.ApplicationPdfGenerationEvent;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.service.ApplicationPdfService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationPdfGenerationListener {

    private final ApplicationPdfService pdfService;
    private final DormitoryApplicationRepository applicationRepository;

    @Async("taskExecutor")
    @EventListener
    @Transactional
    public void handlePdfGeneration(ApplicationPdfGenerationEvent event) {
        log.info("[Async PDF Generation] Bắt đầu sinh PDF và tải lên Cloudinary cho Application ID: {}", event.getApplicationId());
        
        try {
            DormitoryApplication application = applicationRepository.findById(event.getApplicationId())
                    .orElse(null);
                    
            if (application == null) {
                log.warn("[Async PDF Generation] Không tìm thấy Application ID: {}", event.getApplicationId());
                return;
            }

            String registrationPdf = pdfService.generateAndUploadRegistrationFormPdf(application);
            String commitmentPdf = pdfService.generateAndUploadCommitmentFormPdf(application);

            applicationRepository.updatePdfUrls(event.getApplicationId(), registrationPdf, commitmentPdf);
            
            log.info("[Async PDF Generation] Đã hoàn thành sinh PDF cho Application ID: {}", event.getApplicationId());
        } catch (Exception e) {
            log.error("[Async PDF Generation] Lỗi sinh PDF cho Application ID: {}", event.getApplicationId(), e);
        }
    }
}
