package com.sdms.backend.modules.student.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.registration.enums.RegistrationType;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.student.dto.request.StayExtensionRequest;
import com.sdms.backend.modules.student.dto.response.StayExtensionResponse;
import com.sdms.backend.modules.student.entity.StayExtension;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.ExtensionStatus;
import com.sdms.backend.modules.student.repository.StayExtensionRepository;
import com.sdms.backend.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import com.sdms.backend.modules.application.service.ApplicationPdfService;
import com.sdms.backend.modules.student.dto.request.StayExtensionReviewRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import com.sdms.backend.modules.student.event.ExtensionApprovedEvent;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import com.sdms.backend.common.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.enums.BillStatus;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class StayExtensionService {

    private final StayExtensionRepository stayExtensionRepository;
    private final RegistrationPeriodRepository registrationPeriodRepository;
    private final StudentRepository studentRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final UserAccountRepository userAccountRepository;
    private final BillRepository billRepository;
    private final ApplicationPdfService pdfService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public StayExtensionResponse submitExtension(String username, StayExtensionRequest request) {
        // 1. Kiểm tra xem có Đợt đăng ký Gia hạn lưu trú đang mở không
        RegistrationPeriod activeWave = registrationPeriodRepository.findAll()
                .stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()) && p.getRegistrationType() == RegistrationType.CURRENT_RESIDENT)
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Hiện tại KTX không trong đợt tiếp nhận đơn gia hạn"));

        // 2. Tìm kiếm sinh viên từ UserAccount
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản người dùng"));
        
        Student student = userAccount.getStudent();
        if (student == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Tài khoản không liên kết với bất kỳ hồ sơ sinh viên nào");
        }

        if (student.getStatus() != com.sdms.backend.modules.student.enums.StudentStatus.ACTIVE) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ sinh viên đang cư trú (ACTIVE) mới được phép nộp đơn gia hạn");
        }

        // 3. Kiểm tra xem sinh viên đã nộp đơn gia hạn TRONG ĐỢT NÀY chưa
        // gia hạn ở đợt mới sau khi đã gia hạn đợt cũ.
        if (stayExtensionRepository.existsByStudent_StudentIdAndRegistrationPeriod_PeriodId(
                student.getStudentId(), activeWave.getPeriodId())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Sinh viên đã nộp đơn xin gia hạn trong đợt đăng ký này");
        }

        // 3.5. KIỂM TRA NỢ ĐỌNG: Luật luận văn chặt chẽ
        boolean hasDebts = billRepository.existsByStudentIdAndStatusIn(student.getStudentId(), Arrays.asList(BillStatus.UNPAID, BillStatus.OVERDUE));
        if (hasDebts) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Không thể gia hạn: Bạn đang có hóa đơn tiền phòng hoặc điện nước chưa thanh toán. Vui lòng hoàn tất nghĩa vụ tài chính trước.");
        }

        // 4. Lấy thông tin phòng/giường hiện tại của sinh viên
        StudentHousingAssignment activeAssignment = assignmentRepository
                .findByStudent_StudentIdAndStatus(student.getStudentId(), AssignmentStatus.OCCUPIED)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Sinh viên hiện không lưu trú tại KTX"));

        // 5. Tạo đơn gia hạn mới — link với đợt đăng ký đang active
        StayExtension extension = new StayExtension();
        extension.setStudent(student);
        extension.setRegistrationPeriod(activeWave);
        extension.setReason(request.getReason());
        extension.setDescription(request.getDescription());
        extension.setCurrentBed(activeAssignment.getBed());
        extension.setStatus(ExtensionStatus.PENDING);
        extension.setOldExpectedCheckOutAt(activeAssignment.getExpectedCheckOutAt());
        extension.setNewExpectedCheckOutAt(activeWave.getStayEndDate());

        // Tự động gia hạn (Auto-Approve) nếu là Trưởng phòng hoặc Phó phòng
        if (activeAssignment.getRoomRole() == com.sdms.backend.modules.room.enums.RoomRole.ROOM_LEADER ||
            activeAssignment.getRoomRole() == com.sdms.backend.modules.room.enums.RoomRole.DEPUTY_LEADER) {
            
            extension.setStatus(ExtensionStatus.APPROVED);
            StayExtension savedExtension = stayExtensionRepository.save(extension);
            
            activeAssignment.setExpectedCheckOutAt(extension.getNewExpectedCheckOutAt());
            assignmentRepository.save(activeAssignment);
            
            // Tính thời gian gia hạn để quyết định có sinh PDF hay không (Hè <= 3 tháng thì không sinh)
            int startYear = extension.getRegistrationPeriod().getStayStartDate().getYear();
            int startMonth = extension.getRegistrationPeriod().getStayStartDate().getMonthValue();
            int endYear = extension.getRegistrationPeriod().getStayEndDate().getYear();
            int endMonth = extension.getRegistrationPeriod().getStayEndDate().getMonthValue();
            int totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

            if (totalMonths > 3) {
                String[] pdfUrls = pdfService.generateExtensionPdfs(savedExtension, "Hệ thống tự động");
                savedExtension.setContractPdfUrl(pdfUrls[0]);
                savedExtension.setCommitmentPdfUrl(pdfUrls[1]);
            }
            stayExtensionRepository.save(savedExtension);

            eventPublisher.publishEvent(new ExtensionApprovedEvent(
                    this,
                    savedExtension.getExtensionId(),
                    savedExtension.getStudent().getStudentId(),
                    activeAssignment.getAssignmentId(),
                    savedExtension.getStudent().getFullName(),
                    savedExtension.getStudent().getEmail()
            ));
            return buildResponse(savedExtension);
        } else {
            extension.setStatus(ExtensionStatus.PENDING);
            StayExtension savedExtension = stayExtensionRepository.save(extension);
            return buildResponse(savedExtension);
        }
    }

    @Transactional(readOnly = true)
    public StayExtensionResponse getMyExtension(String username) {
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản người dùng"));

        Student student = userAccount.getStudent();
        if (student == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Tài khoản không liên kết với bất kỳ hồ sơ sinh viên nào");
        }

        // [BUG FIX] Phải tìm theo đợt đang active, không dùng findByStudentCode toàn cục.
        // Lý do: Nếu sinh viên đã gia hạn ở đợt cũ, findByStudentCode sẽ trả về nhiều kết quả
        // → IncorrectResultSizeDataAccessException tại runtime.
        RegistrationPeriod activeWave = registrationPeriodRepository.findAll()
                .stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()) && p.getRegistrationType() == RegistrationType.CURRENT_RESIDENT)
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Hiện tại không có đợt gia hạn nào đang mở"));

        StayExtension extension = stayExtensionRepository
                .findByStudent_StudentIdAndRegistrationPeriod_PeriodId(
                        student.getStudentId(), activeWave.getPeriodId())
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Bạn chưa nộp đơn gia hạn trong đợt này"));

        return buildResponse(extension);
    }

    @Transactional(readOnly = true)
    public PageResponse<StayExtensionResponse> getAllExtensions(Pageable pageable) {
        Page<StayExtension> page = stayExtensionRepository.findAll(pageable);
        List<StayExtensionResponse> content = page.getContent().stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
        return PageResponse.fromPage(page, content);
    }

    @Transactional
    public StayExtensionResponse reviewExtension(UUID extensionId, StayExtensionReviewRequest request, String reviewerName) {
        StayExtension extension = stayExtensionRepository.findById(extensionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn gia hạn"));

        if (extension.getStatus() != ExtensionStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Đơn này đã được xử lý");
        }

        if (request.getStatus() == ExtensionStatus.APPROVED) {
            StudentHousingAssignment activeAssignment = assignmentRepository
                    .findByStudent_StudentIdAndStatus(extension.getStudent().getStudentId(), AssignmentStatus.OCCUPIED)
                    .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Sinh viên hiện không lưu trú tại KTX"));
            
            // Kéo dài expectedCheckOutAt theo lịch trình của Đợt gia hạn
            activeAssignment.setExpectedCheckOutAt(extension.getNewExpectedCheckOutAt());
            assignmentRepository.save(activeAssignment);

            // Tính thời gian gia hạn để quyết định có sinh PDF hay không
            int startYear = extension.getRegistrationPeriod().getStayStartDate().getYear();
            int startMonth = extension.getRegistrationPeriod().getStayStartDate().getMonthValue();
            int endYear = extension.getRegistrationPeriod().getStayEndDate().getYear();
            int endMonth = extension.getRegistrationPeriod().getStayEndDate().getMonthValue();
            int totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

            if (totalMonths > 3) {
                // Sinh PDF (Hợp đồng & Bản cam kết mới) cho đợt gia hạn dài hạn (HK1+HK2)
                String[] pdfUrls = pdfService.generateExtensionPdfs(extension, reviewerName);
                extension.setContractPdfUrl(pdfUrls[0]);
                extension.setCommitmentPdfUrl(pdfUrls[1]);
            }
            
            extension.setStatus(ExtensionStatus.APPROVED);
            stayExtensionRepository.save(extension);

            // Bắn sự kiện sinh bill và thông báo
            eventPublisher.publishEvent(new ExtensionApprovedEvent(
                    this,
                    extension.getExtensionId(),
                    extension.getStudent().getStudentId(),
                    activeAssignment.getAssignmentId(),
                    extension.getStudent().getFullName(),
                    extension.getStudent().getEmail()
            ));

        } else if (request.getStatus() == ExtensionStatus.REJECTED) {
            extension.setStatus(ExtensionStatus.REJECTED);
            extension.setRejectReason(request.getRejectReason());
        } else {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Trạng thái không hợp lệ");
        }

        return buildResponse(stayExtensionRepository.save(extension));
    }

    private StayExtensionResponse buildResponse(StayExtension extension) {
        return StayExtensionResponse.builder()
                .extensionId(extension.getExtensionId())
                .studentId(extension.getStudent().getStudentId())
                .studentCode(extension.getStudent().getStudentCode())
                .fullName(extension.getStudent().getFullName())
                .reason(extension.getReason())
                .status(extension.getStatus())
                .currentBedId(extension.getCurrentBed().getBedId())
                .currentBedCode(extension.getCurrentBed().getBedCode())
                .currentRoomCode(extension.getCurrentBed().getRoom().getRoomCode())
                .contractPdfUrl(extension.getContractPdfUrl())
                .commitmentPdfUrl(extension.getCommitmentPdfUrl())
                .description(extension.getDescription())
                .rejectReason(extension.getRejectReason())
                .oldExpectedCheckOutAt(extension.getOldExpectedCheckOutAt())
                .newExpectedCheckOutAt(extension.getNewExpectedCheckOutAt())
                .build();
    }
}
