package com.sdms.backend.modules.application.service;

import com.sdms.backend.common.exception.AppException;
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
                .orElseThrow(() -> new AppException("Kỳ đăng ký không tồn tại", HttpStatus.NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        if (!Boolean.TRUE.equals(period.getIsActive()) || now.isBefore(period.getStartDate()) || now.isAfter(period.getEndDate())) {
            throw new AppException("Kỳ đăng ký hiện đã đóng hoặc chưa mở", HttpStatus.BAD_REQUEST);
        }

        if (period.getRegistrationType() != RegistrationType.OPEN_REGISTRATION) {
            boolean eligible = eligibilityRepository.existsByRegistrationPeriod_PeriodIdAndCccd(period.getPeriodId(), request.getCccd());
            if (!eligible) {
                throw new AppException("Bạn không có trong danh sách đủ điều kiện tham gia đợt này", HttpStatus.FORBIDDEN);
            }
        }

        boolean alreadySubmitted = applicationRepository.existsByCccdAndRegistrationPeriod_PeriodId(request.getCccd(), period.getPeriodId());
        if (alreadySubmitted) {
            throw new AppException("Bạn đã nộp đơn đăng ký cho kỳ tuyển sinh này rồi", HttpStatus.CONFLICT);
        }

        DormitoryApplication application = new DormitoryApplication();
        application.setRegistrationPeriod(period);
        application.setFullName(request.getFullName());
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
        application.setContactAddress(request.getContactAddress());
        application.setFatherName(request.getFatherName());
        application.setFatherYob(request.getFatherYob());
        application.setFatherJob(request.getFatherJob());
        application.setFatherPhone(request.getFatherPhone());
        application.setMotherName(request.getMotherName());
        application.setMotherYob(request.getMotherYob());
        application.setMotherJob(request.getMotherJob());
        application.setMotherPhone(request.getMotherPhone());
        application.setFamilyContact(request.getFamilyContact());
        application.setEmergencyContact(request.getEmergencyContact());

        application.setApplicationCode(generateApplicationCode());

        // 🌟 GIỮ NGUYÊN: Trạng thái ban đầu bắt buộc là PENDING theo đặc tả V1
        application.setStatus(ApplicationStatus.PENDING);
        application.setWaitingListUsed(false);

        application = applicationRepository.save(application);

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
                .orElseThrow(() -> new AppException("Hồ sơ đăng ký không tồn tại", HttpStatus.NOT_FOUND));

        // 🌟 GIỮ NGUYÊN: Cho phép upload khi PENDING (Đang hoàn thiện nháp) hoặc REQUEST_REVISION
        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.REQUEST_REVISION) {
            throw new AppException("Không thể bổ sung tài liệu khi đơn đã được xử lý xong", HttpStatus.BAD_REQUEST);
        }

        VerificationDocument doc = new VerificationDocument();
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
                .orElseThrow(() -> new AppException("Hồ sơ đăng ký không tồn tại", HttpStatus.NOT_FOUND));

        if (application.getStatus() != ApplicationStatus.REQUEST_REVISION) {
            throw new AppException("Chỉ có thể nộp lại tài liệu khi hồ sơ ở trạng thái Yêu cầu bổ sung", HttpStatus.BAD_REQUEST);
        }

        if (application.getRevisionDeadline() != null && LocalDateTime.now().isAfter(application.getRevisionDeadline())) {
            application.setStatus(ApplicationStatus.REJECTED);
            application.setReviewNote("Hồ sơ bị từ chối do quá hạn nộp bổ sung tài liệu");
            applicationRepository.save(application);
            throw new AppException("Đã quá hạn nộp lại tài liệu. Hồ sơ của bạn đã bị từ chối.", HttpStatus.BAD_REQUEST);
        }

        VerificationDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException("Tài liệu không tồn tại", HttpStatus.NOT_FOUND));

        if (!doc.getApplication().getApplicationId().equals(applicationId)) {
            throw new AppException("Tài liệu không thuộc hồ sơ này", HttpStatus.BAD_REQUEST);
        }

        if (doc.getStatus() != VerificationStatus.INVALID) {
            throw new AppException("Chỉ có thể nộp lại những tài liệu bị đánh dấu là Không hợp lệ", HttpStatus.BAD_REQUEST);
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
                .orElseThrow(() -> new AppException("Hồ sơ đăng ký không tồn tại", HttpStatus.NOT_FOUND));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException("Đơn đăng ký không ở trạng thái hợp lệ để gửi đi", HttpStatus.BAD_REQUEST);
        }

        if (application.getSubmittedAt() != null) {
            throw new AppException("Đơn đăng ký này đã được nộp chính thức trước đó", HttpStatus.BAD_REQUEST);
        }

        List<VerificationDocument> docs = documentRepository.findByApplication_ApplicationId(applicationId);
        boolean hasCccdFront = docs.stream().anyMatch(d -> d.getDocumentType() == VerificationDocumentType.CCCD_FRONT);
        boolean hasCccdBack = docs.stream().anyMatch(d -> d.getDocumentType() == VerificationDocumentType.CCCD_BACK);
        boolean hasPortrait = docs.stream().anyMatch(d -> d.getDocumentType() == VerificationDocumentType.PORTRAIT_PHOTO);

        if (!hasCccdFront || !hasCccdBack || !hasPortrait) {
            throw new AppException("Thiếu tài liệu bắt buộc. Vui lòng tải lên mặt trước/sau CCCD và ảnh chân dung.", HttpStatus.BAD_REQUEST);
        }

        application.setSubmittedAt(LocalDateTime.now());
        DormitoryApplication savedApplication = applicationRepository.save(application);

        saveHistory(savedApplication, null, ApplicationStatus.PENDING, null, "Sinh viên nộp đơn chính thức thành công");

        pdfService.generateAndUploadRegistrationFormPdf(savedApplication);
        pdfService.generateAndUploadCommitmentFormPdf(savedApplication);

        // 🌟 KÍCH HOẠT DUY NHẤT NGÒI NỔ XẾP PHÒNG DỰ KIẾN TẠI ĐÂY
        eventPublisher.publishEvent(new ApplicationSubmittedEvent(
                this,
                savedApplication.getApplicationId(),
                savedApplication.getGender().name(),
                savedApplication.getPriorityScore()
        ));

        log.info("Application submitted successfully. Code={}", savedApplication.getApplicationCode());
        return mapToResponse(savedApplication);
    }
    // =========================================================================
    // 🌟 FIX HIỆU NĂNG & THỜI GIAN: Thêm @Transactional(readOnly = true) an toàn
    // =========================================================================

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationDetail(UUID applicationId) {
        log.info("Getting application detail for ID={}", applicationId);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Hồ sơ đăng ký không tồn tại", HttpStatus.NOT_FOUND));
        return mapToResponse(application);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationByCccd(String cccd) {
        log.info("Tra cứu hồ sơ theo CCCD công khai: {}", cccd);

        // 1. Tìm tất cả đơn của CCCD này từ Database dưới dạng danh sách List
        List<DormitoryApplication> applications = applicationRepository.findByCccd(cccd);

        if (applications.isEmpty()) {
            throw new AppException("Không tìm thấy hồ sơ đăng ký cho CCCD này trên hệ thống", HttpStatus.NOT_FOUND);
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

        log.info("Tìm thấy hồ sơ mới nhất cho CCCD={}, Mã đơn={}, Trạng thái={}",
                cccd, latestApplication.getApplicationCode(), latestApplication.getStatus());

        // 3. Quy đổi dữ liệu Entity sang DTO Response để trả về cho Frontend hiển thị
        return mapToResponse(latestApplication);
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getApplications(Pageable pageable) {
        log.info("Getting page of applications pageNumber={}, pageSize={}", pageable.getPageNumber(), pageable.getPageSize());
        Page<DormitoryApplication> page = applicationRepository.findAll(pageable);
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
                .email(application.getEmail())
                .phone(application.getPhone())
                .dob(application.getDob() != null ? application.getDob().toString() : null)
                .gender(application.getGender() != null ? application.getGender().name() : null)
                .permanentAddress(application.getPermanentAddress())
                .contactAddress(application.getContactAddress())
                .priorityCategories(priorityCategories)
                .documents(documents)
                .status(application.getStatus())
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