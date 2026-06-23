package com.sdms.backend.modules.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.DormitoryApplicationStatusHistory;
import com.sdms.backend.modules.application.entity.VerificationDocument;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.enums.VerificationStatus;
import com.sdms.backend.modules.application.event.ApplicationApprovedEvent;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationStatusHistoryRepository;
import com.sdms.backend.modules.application.repository.VerificationDocumentRepository;
import com.sdms.backend.common.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationReviewService {

    private final DormitoryApplicationRepository applicationRepository;
    private final VerificationDocumentRepository documentRepository;
    private final DormitoryApplicationStatusHistoryRepository statusHistoryRepository;
    
    private final ApplicationPriorityService priorityService;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailService emailService;

    /**
     * Bắt đầu quá trình xem xét hồ sơ (Chuyển sang UNDER_REVIEW).
     */
    @Transactional
    public void startReview(UUID applicationId, UUID adminUserId) {
        log.info("Starting review for application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException("Chỉ có thể chuyển sang xét duyệt đối với đơn ở trạng thái PENDING", HttpStatus.BAD_REQUEST);
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.UNDER_REVIEW);
        applicationRepository.save(application);

        saveHistory(application, oldStatus, ApplicationStatus.UNDER_REVIEW, adminUserId, "Bắt đầu xét duyệt hồ sơ");
    }

    /**
     * Xác thực và duyệt từng tài liệu minh chứng trong hồ sơ.
     */
    @Transactional
    public void verifyDocument(UUID documentId, VerificationStatus status, String note, UUID adminUserId) {
        log.info("Verifying document={} status={} by admin={}", documentId, status, adminUserId);
        VerificationDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException("Tài liệu không tồn tại", HttpStatus.NOT_FOUND));

        DormitoryApplication application = doc.getApplication();
        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException("Hồ sơ đã hoàn thành xử lý, không thể thay đổi trạng thái tài liệu", HttpStatus.BAD_REQUEST);
        }

        doc.setStatus(status);
        doc.setNote(note);
        doc.setVerifiedAt(LocalDateTime.now());
        documentRepository.save(doc);

        // Nếu là tài liệu minh chứng ưu tiên, thực hiện tính toán lại điểm ưu tiên của hồ sơ
        if (doc.getDocumentType().name().startsWith("PRIORITY_")) {
            priorityService.recalculateScore(application.getApplicationId());
        }
    }

    /**
     * Từ chối đơn đăng ký.
     */
    @Transactional
    public void rejectApplication(UUID applicationId, String note, UUID adminUserId) {
        log.info("Rejecting application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException("Hồ sơ đã được xử lý xong, không thể từ chối", HttpStatus.BAD_REQUEST);
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.REJECTED);
        application.setReviewedByUserId(adminUserId);
        application.setReviewNote(note);
        applicationRepository.save(application);

        saveHistory(application, oldStatus, ApplicationStatus.REJECTED, adminUserId, note);
    }

    /**
     * Phê duyệt đơn đăng ký.
     * Phát sự kiện ApplicationApprovedEvent sau khi giao dịch lưu trạng thái thành công.
     */
    @Transactional
    public void approveApplication(UUID applicationId, String note, UUID adminUserId) {
        log.info("Approving application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException("Hồ sơ đã được xử lý xong, không thể phê duyệt lại", HttpStatus.BAD_REQUEST);
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.APPROVED);
        application.setReviewedByUserId(adminUserId);
        application.setReviewNote(note);
        application.setApprovedAt(LocalDateTime.now());
        applicationRepository.save(application);

        // Tự động duyệt tất cả các tài liệu đính kèm nếu chưa được duyệt
        java.util.List<VerificationDocument> documents = documentRepository.findByApplication_ApplicationId(applicationId);
        for (VerificationDocument doc : documents) {
            if (doc.getStatus() == VerificationStatus.PENDING) {
                doc.setStatus(VerificationStatus.VALID);
                doc.setNote("Tự động duyệt theo hồ sơ");
                doc.setVerifiedAt(LocalDateTime.now());
                documentRepository.save(doc);
            }
        }

        saveHistory(application, oldStatus, ApplicationStatus.APPROVED, adminUserId, note);

        // Phát sự kiện phê duyệt hồ sơ (Decoupled Integration Event)
        eventPublisher.publishEvent(new ApplicationApprovedEvent(
                this,
                applicationId,
                application.getGender().name(),
                application.getPriorityScore()
        ));
    }

    /**
     * Yêu cầu sinh viên nộp lại minh chứng sai.
     */
    @Transactional
    public void requestRevision(UUID applicationId, String note, int deadlineDays, UUID adminUserId) {
        log.info("Requesting revision for application={} by admin={}, deadlineDays={}", applicationId, adminUserId, deadlineDays);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException("Chỉ có thể yêu cầu bổ sung khi hồ sơ đang chờ duyệt", HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra xem có tài liệu nào bị đánh dấu INVALID không
        List<VerificationDocument> invalidDocs = documentRepository.findByApplication_ApplicationId(applicationId)
                .stream().filter(d -> d.getStatus() == VerificationStatus.INVALID).toList();

        if (invalidDocs.isEmpty()) {
            throw new AppException("Phải đánh dấu ít nhất 1 tài liệu là Không hợp lệ (INVALID) để yêu cầu bổ sung", HttpStatus.BAD_REQUEST);
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.REQUEST_REVISION);
        application.setReviewedByUserId(adminUserId);
        application.setReviewNote(note);
        LocalDateTime deadline = LocalDateTime.now().plusDays(deadlineDays);
        application.setRevisionDeadline(deadline);
        applicationRepository.save(application);

        saveHistory(application, oldStatus, ApplicationStatus.REQUEST_REVISION, adminUserId, note);

        // Gửi email
        if (application.getEmail() != null) {
            StringBuilder invalidDocsStr = new StringBuilder("<ul>");
            for (VerificationDocument doc : invalidDocs) {
                invalidDocsStr.append("<li><b>").append(doc.getDocumentType().name()).append("</b>: ").append(doc.getNote() != null ? doc.getNote() : "Không hợp lệ").append("</li>");
            }
            invalidDocsStr.append("</ul>");

            String emailHtml = String.format(
                    "<h3>Kính gửi sinh viên %s,</h3>" +
                    "<p>Hồ sơ đăng ký KTX của bạn (Mã: <b>%s</b>) cần được bổ sung/cập nhật lại một số giấy tờ sau:</p>" +
                    "%s" +
                    "<p><b>Ghi chú từ Ban Quản Lý:</b> %s</p>" +
                    "<p>Vui lòng đăng nhập hệ thống và cập nhật lại tài liệu bị sai trước hạn chót: <b>%s</b>.</p>" +
                    "<p>Sau thời hạn này, nếu bạn không bổ sung, hồ sơ sẽ bị tự động từ chối.</p>",
                    application.getFullName(), application.getApplicationCode(), invalidDocsStr.toString(),
                    note != null ? note : "Không có",
                    deadline.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            );
            emailService.sendNotificationEmail(application.getEmail(), "[STU Dormitory] Yêu cầu bổ sung hồ sơ KTX", emailHtml);
        }
    }

    private void saveHistory(DormitoryApplication application, ApplicationStatus from, ApplicationStatus to, UUID userId, String note) {
        DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
        history.setApplication(application);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setChangedByUserId(userId);
        history.setChangedAt(LocalDateTime.now());
        history.setNote(note);
        statusHistoryRepository.save(history);
    }
}
