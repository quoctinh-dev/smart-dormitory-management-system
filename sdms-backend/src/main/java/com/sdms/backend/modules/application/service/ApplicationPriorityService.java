package com.sdms.backend.modules.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service quản lý danh mục và tính toán điểm ưu tiên cho hồ sơ đăng ký KTX.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationPriorityService {

    private final ApplicationPriorityRepository priorityRepository;
    private final DormitoryApplicationRepository applicationRepository;
    private final VerificationDocumentRepository documentRepository;
    private final com.sdms.backend.modules.registration.repository.RegistrationEligibilityRepository eligibilityRepository;

    /**
     * Gán danh sách các diện ưu tiên được chọn cho đơn đăng ký KTX.
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @param categories Danh sách các diện ưu tiên sinh viên chọn
     */
    @Transactional
    public void assignPriorities(UUID applicationId, List<PriorityCategory> categories) {
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hồ sơ không tồn tại"));

        // Xóa các diện ưu tiên cũ trước khi gán mới
        List<ApplicationPriority> oldPriorities = priorityRepository.findByApplication_ApplicationId(applicationId);
        priorityRepository.deleteAll(oldPriorities);

        // Lưu các diện ưu tiên mới
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
        // Tính toán lại điểm tổng hợp sau khi gán
        recalculateScore(applicationId);
    }

    /**
     * Tính toán lại điểm ưu tiên tổng hợp dựa trên các tài liệu chứng minh đã được phê duyệt hợp lệ (VALID).
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @return Điểm ưu tiên cao nhất được công nhận từ các giấy tờ hợp lệ
     */
    @Transactional
    public int recalculateScore(UUID applicationId) {
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hồ sơ không tồn tại"));

        List<ApplicationPriority> priorities = priorityRepository.findByApplication_ApplicationId(applicationId);
        List<VerificationDocument> documents = documentRepository.findByApplication_ApplicationId(applicationId);

        int maxScore = 0;

        // Duyệt qua từng diện ưu tiên đã khai báo
        for (ApplicationPriority priority : priorities) {
            PriorityCategory category = priority.getPriorityCategory();
            VerificationDocumentType requiredType = getRequiredDocumentType(category);

            if (requiredType != null) {
                // Kiểm tra xem có tài liệu minh chứng hợp lệ (VALID) đính kèm tương ứng không
                boolean hasValidProof = documents.stream()
                        .anyMatch(doc -> doc.getDocumentType() == requiredType && doc.getStatus() == VerificationStatus.VALID);

                // Nếu có minh chứng hợp lệ, chọn ra điểm ưu tiên cao nhất
                if (hasValidProof) {
                    if (category.getScore() > maxScore) {
                        maxScore = category.getScore();
                    }
                }
            }
        }

        application.setPriorityScore(maxScore);

        // Đợt tự do (OPEN_REGISTRATION): Ưu tiên Tân Sinh Viên thông qua danh sách Eligible
        if (application.getRegistrationPeriod().getRegistrationType() == com.sdms.backend.modules.registration.enums.RegistrationType.OPEN_REGISTRATION) {
            // Kiểm tra xem sinh viên này có nằm trong danh sách ưu tiên (Tân sinh viên do nhà trường cung cấp) không
            boolean isEligibleFreshman = eligibilityRepository
                    .findByRegistrationPeriod_PeriodIdAndEmail(application.getRegistrationPeriod().getPeriodId(), application.getEmail())
                    .isPresent();

            if (isEligibleFreshman) {
                // Cộng thêm 1000 điểm ưu tiên để Tân sinh viên luôn đứng đầu danh sách đợt tự do
                application.setPriorityScore(maxScore + 1000);
                log.info("Cộng 1000 điểm ưu tiên cho Tân sinh viên (thuộc danh sách Eligible) trong Đợt tự do: {}", applicationId);
            }
        }

        applicationRepository.save(application);
        log.info("Recalculated priority score for application={}: {}", applicationId, application.getPriorityScore());

        return maxScore;
    }

    /**
     * Ánh xạ diện ưu tiên sang loại tài liệu minh chứng tương ứng cần kiểm tra.
     */
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