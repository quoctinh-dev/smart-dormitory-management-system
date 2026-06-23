package com.sdms.backend.modules.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.application.entity.ApplicationPriority;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.VerificationDocument;
import com.sdms.backend.modules.application.enums.PriorityCategory;
import com.sdms.backend.modules.application.enums.VerificationDocumentType;
import com.sdms.backend.modules.application.enums.VerificationStatus;
import com.sdms.backend.modules.application.repository.ApplicationPriorityRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.VerificationDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationPriorityService {

    private final ApplicationPriorityRepository priorityRepository;
    private final DormitoryApplicationRepository applicationRepository;
    private final VerificationDocumentRepository documentRepository;

    /**
     * Gán các diện ưu tiên cho đơn đăng ký.
     */
    @Transactional
    public void assignPriorities(UUID applicationId, List<PriorityCategory> categories) {
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        // Xóa các diện ưu tiên cũ trước khi gán mới
        List<ApplicationPriority> oldPriorities = priorityRepository.findByApplication_ApplicationId(applicationId);
        priorityRepository.deleteAll(oldPriorities);

        if (categories != null) {
            for (PriorityCategory category : categories) {
                if (category == PriorityCategory.NONE) continue;

                ApplicationPriority priority = new ApplicationPriority();
                priority.setApplication(application);
                priority.setPriorityCategory(category);
                priority.setPriorityScore(category.getScore());
                priorityRepository.save(priority);
            }
        }
        recalculateScore(applicationId);
    }

    /**
     * Tính toán lại điểm ưu tiên tổng hợp dựa trên các tài liệu chứng minh đã được phê duyệt hợp lệ.
     */
    @Transactional
    public int recalculateScore(UUID applicationId) {
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        List<ApplicationPriority> priorities = priorityRepository.findByApplication_ApplicationId(applicationId);
        List<VerificationDocument> documents = documentRepository.findByApplication_ApplicationId(applicationId);

        int maxScore = 0;

        for (ApplicationPriority priority : priorities) {
            PriorityCategory category = priority.getPriorityCategory();
            VerificationDocumentType requiredType = getRequiredDocumentType(category);

            if (requiredType != null) {
                // Kiểm tra xem có tài liệu minh chứng hợp lệ nào không
                boolean hasValidProof = documents.stream()
                        .anyMatch(doc -> doc.getDocumentType() == requiredType && doc.getStatus() == VerificationStatus.VALID);

                if (hasValidProof) {
                    if (category.getScore() > maxScore) {
                        maxScore = category.getScore();
                    }
                }
            }
        }

        application.setPriorityScore(maxScore);
        applicationRepository.save(application);
        log.info("Recalculated priority score for application={}: {}", applicationId, maxScore);

        return maxScore;
    }

    private VerificationDocumentType getRequiredDocumentType(PriorityCategory category) {
        return switch (category) {
            case PRIORITY_01 -> VerificationDocumentType.PRIORITY_01_PROOF;
            case PRIORITY_02 -> VerificationDocumentType.PRIORITY_02_PROOF;
            case PRIORITY_03 -> VerificationDocumentType.PRIORITY_03_PROOF;
            case PRIORITY_04 -> VerificationDocumentType.PRIORITY_04_PROOF;
            case PRIORITY_05 -> VerificationDocumentType.PRIORITY_05_PROOF;
            case PRIORITY_06 -> VerificationDocumentType.PRIORITY_06_PROOF;
            case PRIORITY_07 -> VerificationDocumentType.PRIORITY_07_PROOF;
            default -> null;
        };
    }
}
