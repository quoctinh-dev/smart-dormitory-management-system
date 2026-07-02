package com.sdms.backend.modules.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.DormitoryApplicationStatusHistory;
import com.sdms.backend.modules.application.entity.VerificationDocument;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.enums.VerificationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationStatusHistoryRepository;
import com.sdms.backend.modules.application.repository.VerificationDocumentRepository;
import com.sdms.backend.common.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Mục tiêu/Nghiệp vụ: Xử lý quy trình xét duyệt hồ sơ của Ban quản lý KTX (Bắt đầu duyệt, Xác thực từng tài liệu, Yêu cầu bổ sung, Từ chối, Phê duyệt).
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Áp dụng State Pattern mô phỏng để quản lý vòng đời chuyển đổi trạng thái (PENDING -> UNDER_REVIEW -> REQUEST_REVISION / WAITING_PAYMENT / REJECTED). Sử dụng Spring ApplicationEventPublisher để kích hoạt quy trình sinh hóa đơn thanh toán tiền giữ chỗ bất đồng bộ.
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích Guard Clauses ở mỗi hàm: Ở mỗi hàm như startReview, approveApplication, luôn có các lệnh IF kiểm tra trạng thái của đơn trước khi thao tác. Việc này để chặn lỗi "Race Condition" khi nhiều admin cùng click duyệt 1 đơn cùng lúc, đảm bảo tính Idempotency và vẹn toàn quy trình.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationReviewService {

    private final DormitoryApplicationRepository applicationRepository;
    private final VerificationDocumentRepository documentRepository;
    private final DormitoryApplicationStatusHistoryRepository statusHistoryRepository;
    private final ApplicationPriorityService priorityService;
    private final EmailService emailService;
    private final ApplicationEventPublisher eventPublisher;
    private final com.sdms.backend.modules.payment.service.PaymentService paymentService;

    @Value("${application.payment.deadline-days:3}")
    private int paymentDeadlineDays;

    @Transactional
    public void startReview(UUID applicationId, UUID adminUserId) {
        log.info("Starting review for application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException("Chỉ có thể chuyển sang xét duyệt đối với đơn ở trạng thái PENDING", HttpStatus.BAD_REQUEST);
        }

        updateStatusAndSaveHistory(application, ApplicationStatus.UNDER_REVIEW, adminUserId, "Bắt đầu xét duyệt hồ sơ");
    }

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

        if (doc.getDocumentType().name().startsWith("PRIORITY_")) {
            priorityService.recalculateScore(application.getApplicationId());
        }
    }

    @Transactional
    public void rejectApplication(UUID applicationId, String note, UUID adminUserId) {
        log.info("Rejecting application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException("Hồ sơ đã được xử lý xong, không thể từ chối", HttpStatus.BAD_REQUEST);
        }

        application.setReviewedByUserId(adminUserId);
        application.setReviewNote(note);
        updateStatusAndSaveHistory(application, ApplicationStatus.REJECTED, adminUserId, note);
    }

    // 📄 File: ApplicationReviewService.java

    // 🌟 Nhớ khai báo thêm repo này ở đầu class để tìm assignmentId:
    private final com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository assignmentRepository;

    @Transactional
    public void approveApplication(UUID applicationId, String note, UUID adminUserId) {
        log.info("Approving application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException("Hồ sơ đã được xử lý xong, không thể phê duyệt lại", HttpStatus.BAD_REQUEST);
        }

        // Tự động duyệt các tài liệu còn lại là VALID
        documentRepository.findByApplication_ApplicationId(applicationId).forEach(doc -> {
            if (doc.getStatus() == VerificationStatus.PENDING) {
                doc.setStatus(VerificationStatus.VALID);
                doc.setNote("Tự động duyệt theo hồ sơ");
                doc.setVerifiedAt(LocalDateTime.now());
                documentRepository.save(doc);
            }
        });

        application.setReviewedByUserId(adminUserId);
        application.setReviewNote(note);
        application.setApprovedAt(LocalDateTime.now());
        application.setPaymentDeadline(LocalDateTime.now().plusDays(paymentDeadlineDays));

        // Cập nhật trạng thái đơn sang WAITING_PAYMENT và lưu lịch sử
        updateStatusAndSaveHistory(application, ApplicationStatus.WAITING_PAYMENT, adminUserId, note);

        // 🌟 1. TRUY VẤN LẤY ASSIGNMENT ID ĐÃ ĐƯỢC TẠO DỰ KIẾN TỪ BƯỚC PENDING
        // Tìm bản ghi gán phòng đang ở trạng thái RESERVED hoặc PENDING của đơn này
        var assignment = assignmentRepository.findByApplication_ApplicationId(application.getApplicationId())
                .stream().findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy thông tin xếp phòng dự kiến từ bước nộp đơn", HttpStatus.NOT_FOUND));

        // Tự động gán Hạn lưu trú từ Đợt đăng ký vào Assignment của Tân Sinh Viên
        assignment.setExpectedCheckOutAt(application.getRegistrationPeriod().getStayEndDate());
        assignmentRepository.save(assignment);

        // 🌟 2. THAY ĐỔI NGÒI NỔ: Bắn BedReservedEvent để kích hoạt tạo hóa đơn 2tr1
        // Thao tác này sẽ đánh động sang BillGenerationListener để sinh Bill UNPAID
        eventPublisher.publishEvent(new com.sdms.backend.modules.room.event.BedReservedEvent(
                this,
                application.getApplicationId(),
                assignment.getAssignmentId() // Truyền chính xác mã phòng đã giữ chỗ sang cho module Bill
        ));

        // 🌟 3. THÔNG BÁO CHO SINH VIÊN: Bắn ApplicationApprovedEvent để gửi Notification
        eventPublisher.publishEvent(new com.sdms.backend.modules.application.event.ApplicationApprovedEvent(
                this,
                application.getApplicationId(),
                null, // studentId chưa có đối với public flow
                application.getGender().name(),
                application.getPriorityScore(),
                application.getFullName(),
                application.getEmail()
        ));

        log.info("Application {} approved. Status moved to WAITING_PAYMENT. BedReservedEvent and ApplicationApprovedEvent fired.", applicationId);
    }

    @Transactional
    public void confirmCashPayment(UUID applicationId, String note, UUID adminUserId) {
        log.info("Confirming cash payment for application={} by admin={}", applicationId, adminUserId);
        DormitoryApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.WAITING_PAYMENT) {
            throw new AppException("Chỉ có thể xác nhận thanh toán khi hồ sơ đang chờ thanh toán", HttpStatus.BAD_REQUEST);
        }

        // Tự động tìm Bill của đơn này và gọi PaymentService để hoàn tất thanh toán
        // Điều này sẽ tự động bắn ra PaymentSuccessEvent -> Kích hoạt StudentProvisioningListener sinh tài khoản
        try {
            paymentService.mockPaymentSuccess(applicationId);
        } catch (Exception e) {
            log.error("Failed to process payment for application={}. Reason: {}", applicationId, e.getMessage(), e);
            throw new AppException("Không thể xử lý hóa đơn, vui lòng kiểm tra lại", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Trạng thái đơn và phòng sẽ được tự động cập nhật sang APPROVED và PENDING_CHECKIN
        // thông qua PaymentSuccessEvent listener (onPaymentSuccess và PaymentWorkflowListener)
        
        // Cập nhật người duyệt và ghi chú
        application.setReviewedByUserId(adminUserId);
        if (note != null && !note.isBlank()) {
            application.setReviewNote(note);
            applicationRepository.save(application);
        }
    }

    @org.springframework.context.event.EventListener
    public void onPaymentSuccess(com.sdms.backend.modules.payment.event.PaymentSuccessEvent event) {
        if (event.getApplicationId() != null) {
            applicationRepository.findById(event.getApplicationId()).ifPresent(application -> {
                if (application.getStatus() != ApplicationStatus.APPROVED) {
                    log.info("[ApplicationReviewService] Auto-approving application {} due to PaymentSuccessEvent", application.getApplicationId());
                    updateStatusAndSaveHistory(application, ApplicationStatus.APPROVED, null, "Thanh toán thành công (Hệ thống tự động cập nhật)");
                }
            });
        }
    }

    @Transactional
    public void requestRevision(UUID applicationId, String note, int deadlineDays, UUID adminUserId) {
        log.info("Requesting revision for application={} by admin={}, deadlineDays={}", applicationId, adminUserId, deadlineDays);
        DormitoryApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException("Chỉ có thể yêu cầu bổ sung khi hồ sơ đang chờ duyệt", HttpStatus.BAD_REQUEST);
        }

        List<VerificationDocument> invalidDocs = documentRepository.findByApplication_ApplicationId(applicationId)
                .stream().filter(d -> d.getStatus() == VerificationStatus.INVALID).toList();

        if (invalidDocs.isEmpty()) {
            throw new AppException("Phải đánh dấu ít nhất 1 tài liệu là Không hợp lệ (INVALID) để yêu cầu bổ sung", HttpStatus.BAD_REQUEST);
        }

        application.setReviewedByUserId(adminUserId);
        application.setReviewNote(note);
        LocalDateTime deadline = LocalDateTime.now().plusDays(deadlineDays);
        application.setRevisionDeadline(deadline);

        updateStatusAndSaveHistory(application, ApplicationStatus.REQUEST_REVISION, adminUserId, note);
        sendRevisionEmail(application, note, invalidDocs, deadline);
    }

    private DormitoryApplication findApplicationOrThrow(UUID applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));
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
