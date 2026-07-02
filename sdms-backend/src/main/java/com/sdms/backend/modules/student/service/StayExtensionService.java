package com.sdms.backend.modules.student.service;

import com.sdms.backend.common.exception.AppException;
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

@Service
@RequiredArgsConstructor
public class StayExtensionService {

    private final StayExtensionRepository stayExtensionRepository;
    private final RegistrationPeriodRepository registrationPeriodRepository;
    private final StudentRepository studentRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final UserAccountRepository userAccountRepository;
    private final ApplicationPdfService pdfService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public StayExtensionResponse submitExtension(String username, StayExtensionRequest request) {
        // 1. Kiểm tra xem có Đợt đăng ký Gia hạn lưu trú đang mở không
        RegistrationPeriod activeWave = registrationPeriodRepository.findAll()
                .stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()) && p.getRegistrationType() == RegistrationType.CURRENT_RESIDENT)
                .findFirst()
                .orElseThrow(() -> new AppException("Hiện tại KTX không trong đợt tiếp nhận đơn gia hạn", HttpStatus.BAD_REQUEST));

        // 2. Tìm kiếm sinh viên từ UserAccount
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản người dùng", HttpStatus.NOT_FOUND));
        
        Student student = userAccount.getStudent();
        if (student == null) {
            throw new AppException("Tài khoản không liên kết với bất kỳ hồ sơ sinh viên nào", HttpStatus.BAD_REQUEST);
        }

        if (student.getStatus() != com.sdms.backend.modules.student.enums.StudentStatus.ACTIVE) {
            throw new AppException("Chỉ sinh viên đang cư trú (ACTIVE) mới được phép nộp đơn gia hạn", HttpStatus.BAD_REQUEST);
        }

        // 3. Kiểm tra xem sinh viên đã nộp đơn gia hạn chưa
        if (stayExtensionRepository.existsByStudent_StudentId(student.getStudentId())) {
            throw new AppException("Sinh viên đã nộp đơn xin gia hạn trước đó", HttpStatus.BAD_REQUEST);
        }

        // 4. Lấy thông tin phòng/giường hiện tại của sinh viên
        StudentHousingAssignment activeAssignment = assignmentRepository
                .findByStudent_StudentIdAndStatus(student.getStudentId(), AssignmentStatus.OCCUPIED)
                .orElseThrow(() -> new AppException("Sinh viên hiện không lưu trú tại KTX", HttpStatus.BAD_REQUEST));

        // 5. Tạo đơn gia hạn mới
        StayExtension extension = new StayExtension();
        extension.setStudent(student);
        extension.setReason(request.getReason());
        extension.setDescription(request.getDescription());
        extension.setCurrentBed(activeAssignment.getBed());
        extension.setStatus(ExtensionStatus.PENDING);
        extension.setPdfUrl(null);
        extension.setOldExpectedCheckOutAt(activeAssignment.getExpectedCheckOutAt());
        extension.setNewExpectedCheckOutAt(activeWave.getStayEndDate());

        StayExtension savedExtension = stayExtensionRepository.save(extension);

        return buildResponse(savedExtension);
    }

    @Transactional(readOnly = true)
    public StayExtensionResponse getMyExtension(String username) {
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản người dùng", HttpStatus.NOT_FOUND));

        Student student = userAccount.getStudent();
        if (student == null) {
            throw new AppException("Tài khoản không liên kết với bất kỳ hồ sơ sinh viên nào", HttpStatus.BAD_REQUEST);
        }

        StayExtension extension = stayExtensionRepository.findByStudent_StudentCode(student.getStudentCode())
                .orElseThrow(() -> new AppException("Bạn chưa nộp đơn gia hạn nào", HttpStatus.NOT_FOUND));

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
    public StayExtensionResponse reviewExtension(UUID extensionId, StayExtensionReviewRequest request) {
        StayExtension extension = stayExtensionRepository.findById(extensionId)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn gia hạn", HttpStatus.NOT_FOUND));

        if (extension.getStatus() != ExtensionStatus.PENDING) {
            throw new AppException("Đơn này đã được xử lý", HttpStatus.BAD_REQUEST);
        }

        if (request.getStatus() == ExtensionStatus.APPROVED) {
            StudentHousingAssignment activeAssignment = assignmentRepository
                    .findByStudent_StudentIdAndStatus(extension.getStudent().getStudentId(), AssignmentStatus.OCCUPIED)
                    .orElseThrow(() -> new AppException("Sinh viên hiện không lưu trú tại KTX", HttpStatus.BAD_REQUEST));
            
            // Kéo dài expectedCheckOutAt theo lịch trình của Đợt gia hạn
            activeAssignment.setExpectedCheckOutAt(extension.getNewExpectedCheckOutAt());
            assignmentRepository.save(activeAssignment);

            // Sinh PDF
            String pdfUrl = pdfService.generateAndUploadExtensionDecisionPdf(extension);
            extension.setPdfUrl(pdfUrl);
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
            throw new AppException("Trạng thái không hợp lệ", HttpStatus.BAD_REQUEST);
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
                .pdfUrl(extension.getPdfUrl())
                .description(extension.getDescription())
                .rejectReason(extension.getRejectReason())
                .oldExpectedCheckOutAt(extension.getOldExpectedCheckOutAt())
                .newExpectedCheckOutAt(extension.getNewExpectedCheckOutAt())
                .build();
    }
}
