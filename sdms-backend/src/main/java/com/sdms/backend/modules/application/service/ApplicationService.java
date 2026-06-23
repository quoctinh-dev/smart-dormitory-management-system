package com.sdms.backend.modules.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.application.dto.request.CreateApplicationRequest;
import com.sdms.backend.modules.application.dto.response.ApplicationResponse;
import com.sdms.backend.modules.application.dto.response.DocumentResponse;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.VerificationDocument;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.enums.VerificationDocumentType;
import com.sdms.backend.modules.application.enums.VerificationStatus;
import com.sdms.backend.modules.application.entity.DormitoryApplicationStatusHistory;
import com.sdms.backend.modules.application.repository.DormitoryApplicationStatusHistoryRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.repository.VerificationDocumentRepository;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.enums.RegistrationType;
import com.sdms.backend.modules.registration.repository.RegistrationEligibilityRepository;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.sdms.backend.common.response.PageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final RegistrationPeriodRepository periodRepository;
    private final RegistrationEligibilityRepository eligibilityRepository;
    private final DormitoryApplicationRepository applicationRepository;
    private final VerificationDocumentRepository documentRepository;
    private final DormitoryApplicationStatusHistoryRepository statusHistoryRepository;
    
    private final ApplicationPriorityService priorityService;
    private final ApplicationPdfService pdfService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * BUSINESS WORKFLOW - Khởi tạo Đơn đăng ký Nháp (Draft State).
     * 
     * ARCHITECTURAL NOTE ON DRAFT STATE:
     * Trạng thái "DRAFT" (Nháp) thuần túy là một trạng thái giao diện người dùng (UI State). 
     * Do trong hệ thống dữ liệu đóng băng (ApplicationStatus) không có trường DRAFT, 
     * bản ghi khi được lưu nháp trong CSDL sẽ có giá trị status mặc định là PENDING.
     * Tuy nhiên, các ràng buộc dữ liệu hồ sơ bắt buộc (hồ sơ đính kèm) và phát sự kiện Submit 
     * sẽ CHỈ được kích hoạt thực sự khi sinh viên nhấn nút gửi (submitApplication).
     */
    @Transactional
    public ApplicationResponse createDraft(CreateApplicationRequest request) {
        log.info("Creating application draft for cccd={}", request.getCccd());

        // 1. Kiểm tra Kỳ đăng ký
        RegistrationPeriod period = periodRepository.findById(request.getPeriodId())
                .orElseThrow(() -> new AppException("Kỳ đăng ký không tồn tại", HttpStatus.NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();
        if (!Boolean.TRUE.equals(period.getIsActive()) || now.isBefore(period.getStartDate()) || now.isAfter(period.getEndDate())) {
            throw new AppException("Kỳ đăng ký hiện đã đóng hoặc chưa mở", HttpStatus.BAD_REQUEST);
        }

        // 2. Kiểm tra điều kiện Eligibility (Không áp dụng cho OPEN_REGISTRATION)
        if (period.getRegistrationType() != RegistrationType.OPEN_REGISTRATION) {
            boolean eligible = eligibilityRepository.existsByRegistrationPeriod_PeriodIdAndCccd(period.getPeriodId(), request.getCccd());
            if (!eligible) {
                throw new AppException("Bạn không có trong danh sách đủ điều kiện tham gia đợt này", HttpStatus.BAD_REQUEST);
            }
        }

        // 3. Kiểm tra trùng lặp đơn đăng ký trong cùng một kỳ
        boolean alreadySubmitted = applicationRepository.existsByCccdAndRegistrationPeriod_PeriodId(request.getCccd(), period.getPeriodId());
        if (alreadySubmitted) {
            throw new AppException("Bạn đã nộp đơn đăng ký cho kỳ tuyển sinh này rồi", HttpStatus.BAD_REQUEST);
        }

        // 4. Khởi tạo thực thể DormitoryApplication
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
        application.setStatus(ApplicationStatus.PENDING); // Lưu tạm dạng PENDING trong DB
        application.setWaitingListUsed(false);

        application = applicationRepository.save(application);

        // 5. Gán diện ưu tiên nếu có
        if (request.getPriorityCategories() != null && !request.getPriorityCategories().isEmpty()) {
            priorityService.assignPriorities(application.getApplicationId(), request.getPriorityCategories());
        }

        log.info("Created draft application successfully. ID={}, Code={}", application.getApplicationId(), application.getApplicationCode());
        return mapToResponse(application);
    }

    /**
     * Tải lên tài liệu đính kèm cho đơn đăng ký.
     */
    @Transactional
    public DocumentResponse uploadDocument(UUID applicationId, VerificationDocumentType type, String fileUrl) {
        log.info("Uploading document type={} for application={}", type, applicationId);

        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Hồ sơ đăng ký không tồn tại", HttpStatus.NOT_FOUND));

        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new AppException("Không thể bổ sung tài liệu khi đơn đã được duyệt hoặc từ chối", HttpStatus.BAD_REQUEST);
        }

        VerificationDocument doc = new VerificationDocument();
        doc.setApplication(application);
        doc.setDocumentType(type);
        doc.setFileUrl(fileUrl);
        doc.setStatus(VerificationStatus.PENDING);

        doc = documentRepository.save(doc);

        return DocumentResponse.builder()
                .documentId(doc.getDocumentId())
                .documentType(doc.getDocumentType())
                .fileUrl(doc.getFileUrl())
                .status(doc.getStatus())
                .note(doc.getNote())
                .build();
    }

    /**
     * Sinh viên nộp lại tài liệu bị sai (Resubmit Document).
     */
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

        // Nếu tất cả các tài liệu INVALID đã được nộp lại, tự động chuyển hồ sơ về PENDING
        long invalidCount = documentRepository.findByApplication_ApplicationId(applicationId)
                .stream().filter(d -> d.getStatus() == VerificationStatus.INVALID).count();
        if (invalidCount == 0) {
            ApplicationStatus oldStatus = application.getStatus();
            application.setStatus(ApplicationStatus.PENDING);
            applicationRepository.save(application);

            DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
            history.setApplication(application);
            history.setFromStatus(oldStatus);
            history.setToStatus(ApplicationStatus.PENDING);
            history.setChangedAt(LocalDateTime.now());
            history.setNote("Sinh viên đã hoàn tất nộp lại tài liệu");
            statusHistoryRepository.save(history);
        }

        return DocumentResponse.builder()
                .documentId(doc.getDocumentId())
                .documentType(doc.getDocumentType())
                .fileUrl(doc.getFileUrl())
                .status(doc.getStatus())
                .note(doc.getNote())
                .build();
    }

    /**
     * Thực hiện gửi đơn đăng ký chính thức lên hệ thống xét duyệt.
     */
    @Transactional
    public ApplicationResponse submitApplication(UUID applicationId) {
        log.info("Submitting application ID={}", applicationId);

        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Hồ sơ đăng ký không tồn tại", HttpStatus.NOT_FOUND));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new AppException("Đơn đăng ký không ở trạng thái hợp lệ để gửi đi", HttpStatus.BAD_REQUEST);
        }

        // 1. Kiểm duyệt các tài liệu đính kèm bắt buộc trước khi cho phép submit
        List<VerificationDocument> docs = documentRepository.findByApplication_ApplicationId(applicationId);
        boolean hasCccdFront = docs.stream().anyMatch(d -> d.getDocumentType() == VerificationDocumentType.CCCD_FRONT);
        boolean hasCccdBack = docs.stream().anyMatch(d -> d.getDocumentType() == VerificationDocumentType.CCCD_BACK);
        boolean hasPortrait = docs.stream().anyMatch(d -> d.getDocumentType() == VerificationDocumentType.PORTRAIT_PHOTO);

        if (!hasCccdFront || !hasCccdBack || !hasPortrait) {
            throw new AppException("Thiếu tài liệu bắt buộc. Vui lòng tải lên mặt trước/sau CCCD và ảnh chân dung.", HttpStatus.BAD_REQUEST);
        }

        // 2. Cập nhật mốc thời gian nộp đơn
        application.setSubmittedAt(LocalDateTime.now());
        application = applicationRepository.save(application);

        // Lưu lịch sử trạng thái (Status History Audit)
        DormitoryApplicationStatusHistory history = new DormitoryApplicationStatusHistory();
        history.setApplication(application);
        history.setFromStatus(null);
        history.setToStatus(ApplicationStatus.PENDING);
        history.setChangedAt(LocalDateTime.now());
        history.setNote("Sinh viên nộp đơn chính thức thành công");
        statusHistoryRepository.save(history);

        // 3. Kích hoạt quy trình sinh PDF không đồng bộ (Asynchronous PDF creation)
        pdfService.generateRegistrationFormPdf(applicationId);
        pdfService.generateCommitmentFormPdf(applicationId);

        // 4. Đơn đã được nộp thành công (Dọn dẹp Dead Event)

        log.info("Application submitted successfully. Code={}", application.getApplicationCode());
        return mapToResponse(application);
    }

    /**
     * Lấy chi tiết đơn đăng ký.
     */
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationDetail(UUID applicationId) {
        log.info("Getting application detail for ID={}", applicationId);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Hồ sơ đăng ký không tồn tại", HttpStatus.NOT_FOUND));
        return mapToResponse(application);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationByCccd(String cccd) {
        DormitoryApplication application = applicationRepository.findByCccd(cccd)
                .stream().findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ đăng ký cho CCCD này", HttpStatus.NOT_FOUND));

        return mapToResponse(application);
    }

    /**
     * Lấy danh sách tất cả các đơn đăng ký có phân trang.
     */
    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getApplications(Pageable pageable) {
        log.info("Getting page of applications pageNumber={}, pageSize={}", pageable.getPageNumber(), pageable.getPageSize());
        Page<DormitoryApplication> page = applicationRepository.findAll(pageable);
        List<ApplicationResponse> list = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
        return PageResponse.<ApplicationResponse>builder()
                .content(list)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private String generateApplicationCode() {
        String code;
        do {
            code = "APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (applicationRepository.findByApplicationCode(code).isPresent());
        return code;
    }

    private ApplicationResponse mapToResponse(DormitoryApplication application) {
        java.util.List<String> priorityCategories = application.getPriorities() != null ? 
            application.getPriorities().stream()
                .map(p -> p.getPriorityCategory().name())
                .collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>();

        java.util.List<DocumentResponse> documents = application.getDocuments() != null ? 
            application.getDocuments().stream().map(d -> DocumentResponse.builder()
                .documentId(d.getDocumentId())
                .documentType(d.getDocumentType())
                .fileUrl(d.getFileUrl())
                .status(d.getStatus())
                .note(d.getNote())
                .build()).collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>();

        return ApplicationResponse.builder()
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
                .applicationPdfUrl(application.getApplicationPdfUrl())
                .submittedAt(application.getSubmittedAt())
                .revisionDeadline(application.getRevisionDeadline())
                .build();
    }
}
