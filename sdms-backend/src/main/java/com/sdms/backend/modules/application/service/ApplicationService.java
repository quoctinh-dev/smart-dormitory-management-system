package com.sdms.backend.modules.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.application.dto.request.CreateApplicationRequest;
import com.sdms.backend.modules.application.dto.response.ApplicationResponse;
import com.sdms.backend.modules.application.dto.response.DocumentResponse;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.DormitoryApplicationStatusHistory;
import com.sdms.backend.modules.application.entity.VerificationDocument;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.enums.VerificationDocumentType;
import com.sdms.backend.modules.application.enums.VerificationStatus;
import com.sdms.backend.modules.application.event.ApplicationSubmittedEvent;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationStatusHistoryRepository;
import com.sdms.backend.modules.application.repository.VerificationDocumentRepository;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.enums.RegistrationType;
import com.sdms.backend.modules.registration.repository.RegistrationEligibilityRepository;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Mục tiêu/Nghiệp vụ: Quản lý vòng đời đơn đăng ký nội trú của sinh viên (Tạo nháp, nộp tài liệu, gửi đơn chính thức, tra cứu đơn, hủy đơn).
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Xây dựng theo Service Layer Pattern. Sử dụng Event-Driven Architecture (phát ApplicationSubmittedEvent) để decouple quá trình nộp đơn và quá trình xếp phòng (phân tải cho hệ thống).
 * Lưu ý Kiến thức (Dành cho phản biện): Ghi chú các bẫy trạng thái: Giải thích tại sao phải khóa chặn điều kiện trùng căn cước công dân (CCCD) trên các đơn đang hoạt động (tránh 1 sinh viên spam nhiều đơn, làm sai lệch báo cáo giường trống). Giải thích lý do lưu vết status lịch sử đơn từ riêng biệt (DormitoryApplicationStatusHistory): Đảm bảo tính minh bạch, hỗ trợ thanh tra/kiểm toán (Audit) khi sinh viên khiếu nại về quyết định duyệt/từ chối của ban quản lý.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final RegistrationPeriodRepository periodRepository;
    private final RegistrationEligibilityRepository eligibilityRepository;
    private final DormitoryApplicationRepository applicationRepository;
    private final VerificationDocumentRepository documentRepository;
    private final DormitoryApplicationStatusHistoryRepository statusHistoryRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;

    private final ApplicationPriorityService priorityService;
    private final ApplicationPdfService pdfService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ApplicationResponse createDraft(CreateApplicationRequest request) {
        log.info("Creating application draft for cccd={}", request.getCccd());

        RegistrationPeriod period = periodRepository.findById(request.getPeriodId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Kỳ đăng ký không tồn tại"));

        LocalDateTime now = LocalDateTime.now();
        if (!Boolean.TRUE.equals(period.getIsActive()) || now.isBefore(period.getStartDate()) || now.isAfter(period.getEndDate())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Kỳ đăng ký hiện đã đóng hoặc chưa mở");
        }

        if (period.getRegistrationType() != RegistrationType.CURRENT_RESIDENT && period.getRegistrationType() != RegistrationType.OPEN_REGISTRATION) {
            boolean eligible = eligibilityRepository.existsByRegistrationPeriod_PeriodIdAndEmail(period.getPeriodId(), request.getEmail());
            if (!eligible) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có trong danh sách đủ điều kiện tham gia đợt này (Email không hợp lệ)");
            }
        }

        if (request.getStudentCode() != null && !request.getStudentCode().matches("^[A-Za-z]{2}\\d{8}$")) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Mã số sinh viên không đúng định dạng của trường (VD: DH52201580)");
        }

        if (request.getStudentCode() != null && !request.getEmail().toLowerCase().startsWith(request.getStudentCode().toLowerCase())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Mã số sinh viên không khớp với Email đã xác thực");
        }

        Optional<DormitoryApplication> existingAppOpt = applicationRepository.findByEmailAndRegistrationPeriod_PeriodId(request.getEmail(), period.getPeriodId());
        DormitoryApplication application;

        if (existingAppOpt.isPresent()) {
            application = existingAppOpt.get();
            // Nếu đơn đã qua bước PENDING (nghĩa là đã nộp chính thức hoặc đang xử lý), thì mới chặn lại
            if (application.getStatus() != ApplicationStatus.PENDING) {
                throw new AppException(ErrorCode.DATA_CONFLICT, "Bạn đã nộp đơn đăng ký cho kỳ tuyển sinh này rồi");
            }
            log.info("Found existing PENDING draft for email={}, updating it", request.getEmail());
        } else {
            application = new DormitoryApplication();
            application.setRegistrationPeriod(period);
            application.setApplicationCode(generateApplicationCode());
            application.setStatus(ApplicationStatus.PENDING);
            application.setWaitingListUsed(false);
        }
        application.setFullName(request.getFullName());
        application.setStudentCode(request.getStudentCode());
        application.setDob(request.getDob());
        application.setGender(request.getGender());
        application.setCccd(request.getCccd());
        application.setIssueDate(request.getIssueDate());
        application.setIssuePlace(request.getIssuePlace());
        application.setEmail(request.getEmail());
        application.setPhone(request.getPhone());
        application.setPermanentAddress(request.getPermanentAddress());
        application.setPob(request.getPob());
        application.setEthnic(request.getEthnic());
        application.setReligion(request.getReligion());
        application.setFaculty(request.getFaculty());
        application.setCohort(request.getCohort());
        application.setContactAddress(request.getContactAddress());
        application.setFatherName(request.getFatherName());
        application.setFatherYob(request.getFatherYob());
        application.setFatherJob(request.getFatherJob());
        application.setFatherPhone(request.getFatherPhone());
        application.setMotherName(request.getMotherName());
        application.setMotherYob(request.getMotherYob());
        application.setMotherJob(request.getMotherJob());
        application.setMotherPhone(request.getMotherPhone());

        application = applicationRepository.save(application);

        // Nạp lại danh sách ưu tiên mới
        if (request.getPriorityCategories() != null && !request.getPriorityCategories().isEmpty()) {
            priorityService.assignPriorities(application.getApplicationId(), request.getPriorityCategories());
        }

        log.info("Created draft application successfully. ID={}, Code={}", application.getApplicationId(), application.getApplicationCode());
        return mapToResponse(application);
    }

    @Transactional
    public DocumentResponse uploadDocument(UUID applicationId, VerificationDocumentType type, String fileUrl) {
        log.info("Uploading document type={} for application={}", type, applicationId);

        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hồ sơ đăng ký không tồn tại"));

        // 🌟 GIỮ NGUYÊN: Cho phép upload khi PENDING (Đang hoàn thiện nháp) hoặc REQUEST_REVISION
        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.REQUEST_REVISION) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Không thể bổ sung tài liệu khi đơn đã được xử lý xong");
        }

        // Xóa tài liệu cũ cùng loại (tránh bị lặp thẻ CCCD, Ảnh chân dung khi nộp lại nhiều lần ở bản nháp)
        VerificationDocument doc = documentRepository.findByApplication_ApplicationId(applicationId)
                .stream()
                .filter(d -> d.getDocumentType() == type)
                .findFirst()
                .orElse(new VerificationDocument());

        doc.setApplication(application);
        doc.setDocumentType(type);
        doc.setFileUrl(fileUrl);
        doc.setStatus(VerificationStatus.PENDING);

        doc = documentRepository.save(doc);

        return DocumentResponse.fromEntity(doc);
    }

    @Transactional
    public DocumentResponse resubmitDocument(UUID applicationId, UUID documentId, String newFileUrl) {
        log.info("Resubmitting document={} for application={}", documentId, applicationId);

        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hồ sơ đăng ký không tồn tại"));

        if (application.getStatus() != ApplicationStatus.REQUEST_REVISION) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể nộp lại tài liệu khi hồ sơ ở trạng thái Yêu cầu bổ sung");
        }

        if (application.getRevisionDeadline() != null && LocalDateTime.now().isAfter(application.getRevisionDeadline())) {
            application.setStatus(ApplicationStatus.REJECTED);
            application.setReviewNote("Hồ sơ bị từ chối do quá hạn nộp bổ sung tài liệu");
            applicationRepository.save(application);
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Đã quá hạn nộp lại tài liệu. Hồ sơ của bạn đã bị từ chối.");
        }

        VerificationDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Tài liệu không tồn tại"));

        if (!doc.getApplication().getApplicationId().equals(applicationId)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Tài liệu không thuộc hồ sơ này");
        }

        if (doc.getStatus() != VerificationStatus.INVALID) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể nộp lại những tài liệu bị đánh dấu là Không hợp lệ");
        }

        doc.setFileUrl(newFileUrl);
        doc.setStatus(VerificationStatus.PENDING);
        doc.setNote("Đã nộp lại, chờ duyệt");
        doc = documentRepository.save(doc);

        long invalidCount = documentRepository.findByApplication_ApplicationId(applicationId)
                .stream().filter(d -> d.getStatus() == VerificationStatus.INVALID).count();
        if (invalidCount == 0) {
            ApplicationStatus oldStatus = application.getStatus();
            application.setStatus(ApplicationStatus.PENDING);
            applicationRepository.save(application);

            saveHistory(application, oldStatus, ApplicationStatus.PENDING, null, "Sinh viên đã hoàn tất nộp lại tài liệu");
        }

        return DocumentResponse.fromEntity(doc);
    }

    @Transactional
    public ApplicationResponse submitApplication(UUID applicationId) {
        log.info("Submitting application ID={}", applicationId);

        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hồ sơ đăng ký không tồn tại"));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Đơn đăng ký không ở trạng thái hợp lệ để gửi đi");
        }

        if (application.getSubmittedAt() != null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Đơn đăng ký này đã được nộp chính thức trước đó");
        }

        List<VerificationDocument> docs = documentRepository.findByApplication_ApplicationId(applicationId);
        boolean hasCccdFront = docs.stream().anyMatch(d -> d.getDocumentType() == VerificationDocumentType.CCCD_FRONT);
        boolean hasCccdBack = docs.stream().anyMatch(d -> d.getDocumentType() == VerificationDocumentType.CCCD_BACK);

        if (!hasCccdFront || !hasCccdBack) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hệ thống yêu cầu ảnh CCCD mặt trước/sau để xác thực (OCR) và đối chiếu. Vui lòng tải lên tài liệu bắt buộc.");
        }

        application.setSubmittedAt(LocalDateTime.now());
        DormitoryApplication savedApplication = applicationRepository.save(application);

        saveHistory(savedApplication, null, ApplicationStatus.PENDING, null, "Sinh viên nộp đơn chính thức thành công");

        String registrationPdf = pdfService.generateAndUploadRegistrationFormPdf(savedApplication);
        String commitmentPdf = pdfService.generateAndUploadCommitmentFormPdf(savedApplication);
        
        savedApplication.setRegistrationFormPdfUrl(registrationPdf);
        savedApplication.setCommitmentFormPdfUrl(commitmentPdf);
        savedApplication = applicationRepository.save(savedApplication);

        // KÍCH HOẠT VIỆC XẾP PHÒNG Ở ĐÂY
        eventPublisher.publishEvent(new ApplicationSubmittedEvent(
                this,
                savedApplication.getApplicationId(),
                null,
                savedApplication.getGender().name(),
                savedApplication.getPriorityScore(),
                savedApplication.getFullName(),
                savedApplication.getEmail()
        ));

        log.info("Application submitted successfully. Code={}", savedApplication.getApplicationCode());
        return mapToResponse(savedApplication);
    }
    @Transactional
    public void cancelApplicationDueToPayment(UUID applicationId) {
        log.info("Cancelling application ID={} due to payment expiration", applicationId);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hồ sơ đăng ký không tồn tại"));

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.REJECTED);
        application.setReviewNote("Hồ sơ bị từ chối do quá hạn nộp phí giữ chỗ");
        applicationRepository.save(application);

        saveHistory(application, oldStatus, ApplicationStatus.REJECTED, null, "Hủy đơn do quá hạn thanh toán hóa đơn giữ chỗ");
    }

    // =========================================================================
    // 🌟 FIX HIỆU NĂNG & THỜI GIAN: Thêm @Transactional(readOnly = true) an toàn
    // =========================================================================

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationDetail(UUID applicationId) {
        log.info("Getting application detail for ID={}", applicationId);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hồ sơ đăng ký không tồn tại"));
        return mapToResponse(application);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationByStudentCode(String studentCode) {
        log.info("Tra cứu hồ sơ theo MSSV công khai: {}", studentCode);

        // 1. Tìm tất cả đơn của MSSV này từ Database dưới dạng danh sách List
        List<DormitoryApplication> applications = applicationRepository.findByStudentCode(studentCode);

        if (applications.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ đăng ký cho MSSV này trên hệ thống");
        }

        // 2. Sử dụng Java Stream tối ưu để tìm ra đơn đăng ký mới nhất dựa trên thời gian
        // Đã xóa bỏ hoàn toàn lệnh .Wood() lỗi gõ phím và ép kiểu tường minh dữ liệu Lambda
        DormitoryApplication latestApplication = applications.stream()
                .max((DormitoryApplication app1, DormitoryApplication app2) -> {
                    LocalDateTime time1 = app1.getSubmittedAt() != null ? app1.getSubmittedAt() : app1.getCreatedAt();
                    LocalDateTime time2 = app2.getSubmittedAt() != null ? app2.getSubmittedAt() : app2.getCreatedAt();
                    return time1.compareTo(time2);
                })
                .orElse(applications.get(0));

        log.info("Tìm thấy hồ sơ mới nhất cho MSSV={}, Mã đơn={}, Trạng thái={}",
                studentCode, latestApplication.getApplicationCode(), latestApplication.getStatus());

        // 3. Quy đổi dữ liệu Entity sang DTO Response để trả về cho Frontend hiển thị
        return mapToResponse(latestApplication);
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getApplications(ApplicationStatus status, String search, Pageable pageable) {
        log.info("Getting page of applications pageNumber={}, pageSize={}, status={}, search={}", pageable.getPageNumber(), pageable.getPageSize(), status, search);
        Page<DormitoryApplication> page = applicationRepository.findAllWithFilters(status, search, pageable);
        List<ApplicationResponse> list = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.fromPage(page, list);
    }

    private String generateApplicationCode() {
        String code;
        do {
            code = "APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (applicationRepository.findByApplicationCode(code).isPresent());
        return code;
    }

    private ApplicationResponse mapToResponse(DormitoryApplication application) {
        List<String> priorityCategories = application.getPriorities() != null ?
                application.getPriorities().stream()
                        .map(p -> p.getPriorityCategory().name())
                        .collect(Collectors.toList()) : List.of();

        List<DocumentResponse> documents = application.getDocuments() != null ?
                application.getDocuments().stream().map(DocumentResponse::fromEntity).collect(Collectors.toList()) : List.of();

        ApplicationResponse.ApplicationResponseBuilder builder = ApplicationResponse.builder()
                .applicationId(application.getApplicationId())
                .applicationCode(application.getApplicationCode())
                .fullName(application.getFullName())
                .cccd(application.getCccd())
                .studentCode(application.getStudentCode())
                .email(application.getEmail())
                .phone(application.getPhone())
                .dob(application.getDob() != null ? application.getDob().toString() : null)
                .gender(application.getGender() != null ? application.getGender().name() : null)
                .cohort(application.getCohort())
                .permanentAddress(application.getPermanentAddress())
                .contactAddress(application.getContactAddress())
                .priorityCategories(priorityCategories)
                .documents(documents)
                .status(application.getStatus())
                .reviewNote(application.getReviewNote())
                .priorityScore(application.getPriorityScore())
                .registrationFormPdfUrl(application.getRegistrationFormPdfUrl())
                .commitmentFormPdfUrl(application.getCommitmentFormPdfUrl())
                .submittedAt(application.getSubmittedAt())
                .revisionDeadline(application.getRevisionDeadline());

        Optional<StudentHousingAssignment> assignmentOpt = assignmentRepository
                .findByApplication_ApplicationIdAndStatusIn(application.getApplicationId(), EnumSet.of(AssignmentStatus.RESERVED, AssignmentStatus.PENDING_CHECKIN));

        assignmentOpt.ifPresent(assignment -> {
            ApplicationResponse.AssignmentInfo assignmentInfo = ApplicationResponse.AssignmentInfo.builder()
                    .buildingName(assignment.getBed().getRoom().getFloor().getBuilding().getName())
                    .floorName(String.valueOf(assignment.getBed().getRoom().getFloor().getFloorNumber()))
                    .roomName(assignment.getBed().getRoom().getRoomCode())
                    .bedName(assignment.getBed().getBedCode())
                    .build();
            builder.assignment(assignmentInfo);
        });

        return builder.build();
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