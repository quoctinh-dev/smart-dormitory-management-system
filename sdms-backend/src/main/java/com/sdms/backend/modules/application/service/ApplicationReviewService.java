package com.sdms.backend.modules.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.service.EmailService;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.DormitoryApplicationStatusHistory;
import com.sdms.backend.modules.application.entity.VerificationDocument;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.enums.VerificationStatus;
import com.sdms.backend.modules.application.event.ApplicationApprovedEvent;
import com.sdms.backend.modules.application.event.ApplicationRejectedEvent;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationStatusHistoryRepository;
import com.sdms.backend.modules.application.repository.VerificationDocumentRepository;
import com.sdms.backend.modules.payment.event.PaymentSuccessEvent;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.event.BedReservedEvent;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import com.sdms.backend.modules.system.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * <h2>ApplicationReviewService</h2>
 *
 * <h3>1. Mục tiêu Nghiệp vụ</h3>
 * Xử lý toàn bộ quy trình xét duyệt hồ sơ đăng ký KTX của Ban Quản Lý (BQL):
 * <ul>
 *   <li>Bắt đầu thẩm định đơn (PENDING &rarr; UNDER_REVIEW)</li>
 *   <li>Xác thực từng giấy tờ/minh chứng đính kèm (VALID / INVALID)</li>
 *   <li>Yêu cầu sinh viên sửa đổi/bổ sung hồ sơ (REQUEST_REVISION)</li>
 *   <li>Từ chối hồ sơ (REJECTED) & giải phóng giường dự kiến</li>
 *   <li>Phê duyệt hồ sơ (WAITING_PAYMENT) & kích hoạt luồng tạo hóa đơn thanh toán giữ chỗ</li>
 * </ul>
 *
 * <h3>2. Kiến trúc & Mẫu thiết kế (Design Pattern)</h3>
 * <ul>
 *   <li><b>State Machine Pattern (Mô phỏng):</b> Quản lý vòng đời trạng thái của {@link ApplicationStatus}.</li>
 *   <li><b>Event-Driven Architecture (EDA):</b> Sử dụng {@link ApplicationEventPublisher} để bắn sự kiện
 *       bất đồng bộ ({@link BedReservedEvent}, {@link ApplicationApprovedEvent}, {@link ApplicationRejectedEvent}), giúp giảm độ phụ thuộc (decoupling) giữa các module.</li>
 *   <li><b>Chống Optimistic Locking Conflict:</b> Gom nhóm toàn bộ cập nhật field (bao gồm sinh URL PDF) trước khi save database 1 lần duy nhất, tránh lỗi {@code ObjectOptimisticLockingFailureException}.</li>
 * </ul>
 *
 * <h3>3. Cơ chế Chống Race Condition (Guard Clauses)</h3>
 * Mọi hàm xử lý đều có Guard Clauses kiểm tra trạng thái trước khi thực thi nhằm đảm bảo tính <i>Idempotency</i>
 * và ngăn chặn xung đột dữ liệu khi nhiều Admin cùng thao tác trên một hồ sơ đồng thời.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationReviewService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final DormitoryApplicationRepository applicationRepository;
    private final VerificationDocumentRepository documentRepository;
    private final DormitoryApplicationStatusHistoryRepository statusHistoryRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;

    private final ApplicationPriorityService priorityService;
    private final HousingAssignmentService housingAssignmentService;
    private final SystemConfigService systemConfigService;
    private final ApplicationPdfService pdfService;
    private final EmailService emailService;

    private final ApplicationEventPublisher eventPublisher;

    /**
     * Bắt đầu xét duyệt hồ sơ, chuyển trạng thái từ PENDING sang UNDER_REVIEW.
     *
     * @param applicationId ID của hồ sơ
     * @param adminUserId   ID cán bộ BQL thực hiện
     */
    @Transactional
    public void startReview(UUID applicationId, UUID adminUserId) {
        log.info("Starting review for application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể chuyển sang xét duyệt đối với đơn ở trạng thái PENDING");
        }

        updateStatusAndSaveHistory(application, ApplicationStatus.UNDER_REVIEW, adminUserId, "Bắt đầu xét duyệt hồ sơ");
    }

    /**
     * Xác thực trạng thái của một tài liệu đính kèm (VALID / INVALID).
     *
     * @param documentId  ID của tài liệu
     * @param status      Trạng thái xác thực mới
     * @param note        Ghi chú lý do
     * @param adminUserId ID cán bộ BQL thực hiện
     */
    @Transactional
    public void verifyDocument(UUID documentId, VerificationStatus status, String note, UUID adminUserId) {
        log.info("Verifying document={} status={} by admin={}", documentId, status, adminUserId);
        VerificationDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Tài liệu không tồn tại"));

        DormitoryApplication application = doc.getApplication();
        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hồ sơ đã hoàn thành xử lý, không thể thay đổi trạng thái tài liệu");
        }

        doc.setStatus(status);
        doc.setNote(note);
        doc.setVerifiedAt(LocalDateTime.now());
        documentRepository.save(doc);

        // Đánh giá lại điểm ưu tiên nếu tài liệu thuộc danh mục ưu tiên
        if (doc.getDocumentType().name().startsWith("PRIORITY_")) {
            priorityService.recalculateScore(application.getApplicationId());
        }
    }

    /**
     * Từ chối hồ sơ đăng ký & hủy giữ chỗ giường dự kiến (nếu có).
     *
     * @param applicationId ID của hồ sơ
     * @param note          Lý do từ chối
     * @param adminUserId   ID cán bộ BQL thực hiện
     */
    @Transactional
    public void rejectApplication(UUID applicationId, String note, UUID adminUserId) {
        log.info("Rejecting application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING &&
                application.getStatus() != ApplicationStatus.UNDER_REVIEW &&
                application.getStatus() != ApplicationStatus.REQUEST_REVISION &&
                application.getStatus() != ApplicationStatus.WAITING_LIST) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hồ sơ đã được xử lý xong, không thể từ chối");
        }

        application.setReviewedByUserId(adminUserId);
        application.setReviewNote(note);
        updateStatusAndSaveHistory(application, ApplicationStatus.REJECTED, adminUserId, note);

        // Hủy giường dự kiến (nếu có) để giải phóng tài nguyên
        try {
            assignmentRepository.findByApplication_ApplicationId(applicationId)
                    .stream()
                    .filter(a -> a.getStatus() == AssignmentStatus.RESERVED)
                    .findFirst()
                    .ifPresent(assignment -> {
                        log.info("Canceling provisional assignment={} due to application rejection", assignment.getAssignmentId());
                        housingAssignmentService.cancelReservation(assignment.getAssignmentId());
                    });
        } catch (Exception e) {
            log.error("Failed to cancel assignment for rejected application={}", applicationId, e);
        }

        // Phát sự kiện thông báo từ chối
        eventPublisher.publishEvent(new ApplicationRejectedEvent(
                this,
                applicationId,
                application.getEmail(),
                application.getFullName(),
                note
        ));
    }

    /**
     * Phê duyệt hồ sơ đăng ký.
     * Chuyển đơn sang trạng thái WAITING_PAYMENT, sinh file PDF đăng ký và kích hoạt tạo hóa đơn giữ chỗ.
     *
     * @param applicationId ID của hồ sơ
     * @param note          Ghi chú phê duyệt
     * @param adminUserId   ID cán bộ BQL thực hiện
     */
    @Transactional
    public void approveApplication(UUID applicationId, String note, UUID adminUserId) {
        log.info("Approving application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hồ sơ đã được xử lý xong, không thể phê duyệt lại");
        }

        // 1. Tự động duyệt các tài liệu còn ở trạng thái PENDING thành VALID
        documentRepository.findByApplication_ApplicationId(applicationId).forEach(doc -> {
            if (doc.getStatus() == VerificationStatus.PENDING) {
                doc.setStatus(VerificationStatus.VALID);
                doc.setNote("Tự động duyệt theo hồ sơ");
                doc.setVerifiedAt(LocalDateTime.now());
                documentRepository.save(doc);
            }
        });

        // 2. Thiết lập thông tin duyệt & Thời hạn thanh toán
        application.setReviewedByUserId(adminUserId);
        application.setReviewNote(note);
        application.setApprovedAt(LocalDateTime.now());
        int paymentDeadlineDays = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_DEADLINE_DAYS", "3"));
        application.setPaymentDeadline(LocalDateTime.now().plusDays(paymentDeadlineDays));

        // 3. Sinh PDF đăng ký trước khi lưu DB để tránh xung đột Optimistic Locking
        String newRegistrationPdf = pdfService.generateAndUploadRegistrationFormPdf(application);
        application.setRegistrationFormPdfUrl(newRegistrationPdf);

        // 4. Lưu trạng thái WAITING_PAYMENT & Lịch sử trong cùng một thao tác flush
        updateStatusAndSaveHistory(application, ApplicationStatus.WAITING_PAYMENT, adminUserId, note);

        // 5. Cập nhật ngày dự kiến trả phòng cho Assignment đã tạo ở bước PENDING
        var assignment = assignmentRepository.findByApplication_ApplicationId(application.getApplicationId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin xếp phòng dự kiến từ bước nộp đơn"));

        assignment.setExpectedCheckOutAt(application.getRegistrationPeriod().getStayEndDate());
        assignmentRepository.save(assignment);

        // 6. Phát sự kiện BedReservedEvent để kích hoạt module Payment sinh Hóa đơn UNPAID
        eventPublisher.publishEvent(new BedReservedEvent(
                this,
                application.getApplicationId(),
                assignment.getAssignmentId()
        ));

        // 7. Phát sự kiện ApplicationApprovedEvent để gửi Notification cho sinh viên
        eventPublisher.publishEvent(new ApplicationApprovedEvent(
                this,
                application.getApplicationId(),
                null, // studentId chưa khởi tạo đối với luồng đăng ký công khai
                application.getGender().name(),
                application.getPriorityScore(),
                application.getFullName(),
                application.getEmail()
        ));

        log.info("Application {} approved. Status moved to WAITING_PAYMENT. BedReservedEvent and ApplicationApprovedEvent fired.", applicationId);
    }

    /**
     * Lắng nghe sự kiện thanh toán thành công để tự động phê duyệt chính thức (APPROVED) hồ sơ.
     *
     * @param event Sự kiện thanh toán thành công
     */
    @EventListener
    @Transactional
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        if (event.getApplicationId() != null) {
            applicationRepository.findById(event.getApplicationId()).ifPresent(application -> {
                if (application.getStatus() != ApplicationStatus.APPROVED) {
                    log.info("[ApplicationReviewService] Auto-approving application {} due to PaymentSuccessEvent", application.getApplicationId());
                    updateStatusAndSaveHistory(application, ApplicationStatus.APPROVED, null, "Thanh toán thành công (Hệ thống tự động cập nhật)");
                }
            });
        }
    }

    /**
     * Yêu cầu sinh viên bổ sung/chỉnh sửa hồ sơ khi có ít nhất 1 tài liệu ở trạng thái INVALID.
     *
     * @param applicationId ID của hồ sơ
     * @param note          Nội dung ghi chú gửi cho sinh viên
     * @param deadlineDays  Số ngày hạn chót bổ sung
     * @param adminUserId   ID cán bộ BQL thực hiện
     */
    @Transactional
    public void requestRevision(UUID applicationId, String note, int deadlineDays, UUID adminUserId) {
        log.info("Requesting revision for application={} by admin={}, deadlineDays={}", applicationId, adminUserId, deadlineDays);
        DormitoryApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể yêu cầu bổ sung khi hồ sơ đang chờ duyệt");
        }

        List<VerificationDocument> invalidDocs = documentRepository.findByApplication_ApplicationId(applicationId)
                .stream()
                .filter(d -> d.getStatus() == VerificationStatus.INVALID)
                .toList();

        if (invalidDocs.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Phải đánh dấu ít nhất 1 tài liệu là Không hợp lệ (INVALID) để yêu cầu bổ sung");
        }

        application.setReviewedByUserId(adminUserId);
        application.setReviewNote(note);
        LocalDateTime deadline = LocalDateTime.now().plusDays(deadlineDays);
        application.setRevisionDeadline(deadline);

        updateStatusAndSaveHistory(application, ApplicationStatus.REQUEST_REVISION, adminUserId, note);
        sendRevisionEmail(application, note, invalidDocs, deadline);
    }

    // ==========================================
    // PRIVATE HELPER METHODS
    // ==========================================

    private DormitoryApplication findApplicationOrThrow(UUID applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hồ sơ không tồn tại"));
    }

    private void updateStatusAndSaveHistory(DormitoryApplication application, ApplicationStatus newStatus, UUID userId, String note) {
        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(newStatus);
        applicationRepository.save(application);
        saveHistory(application, oldStatus, newStatus, userId, note);
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

    private void sendRevisionEmail(DormitoryApplication application, String note, List<VerificationDocument> invalidDocs, LocalDateTime deadline) {
        if (application.getEmail() == null) return;

        StringBuilder invalidDocsStr = new StringBuilder("<ul>");
        for (VerificationDocument doc : invalidDocs) {
            invalidDocsStr.append("<li><b>").append(doc.getDocumentType().name()).append("</b>: ")
                    .append(doc.getNote() != null ? doc.getNote() : "Không hợp lệ").append("</li>");
        }
        invalidDocsStr.append("</ul>");

        String emailHtml = String.format(
                "<h3>Kính gửi sinh viên %s,</h3>" +
                        "<p>Hồ sơ đăng ký KTX của bạn (Mã: <b>%s</b>) cần được bổ sung/cập nhật lại một số giấy tờ sau:</p>" +
                        "%s" +
                        "<p><b>Ghi chú từ Ban Quản Lý:</b> %s</p>" +
                        "<p>Vui lòng đăng nhập hệ thống và cập nhật lại tài liệu bị sai trước hạn chót: <b>%s</b>.</p>" +
                        "<p>Sau thời hạn này, nếu bạn không bổ sung, hồ sơ sẽ bị tự động từ chối.</p>",
                application.getFullName(),
                application.getApplicationCode(),
                invalidDocsStr.toString(),
                note != null ? note : "Không có",
                deadline.format(DATE_TIME_FORMATTER)
        );
        emailService.sendNotificationEmail(application.getEmail(), "[STU Dormitory] Yêu cầu bổ sung hồ sơ KTX", emailHtml);
    }
}