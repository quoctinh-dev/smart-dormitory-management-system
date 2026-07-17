package com.sdms.backend.modules.student.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import com.sdms.backend.modules.student.dto.request.CheckoutRequestReviewDto;
import com.sdms.backend.modules.student.dto.request.CheckoutRequestSubmitDto;
import com.sdms.backend.modules.student.dto.response.CheckoutRequestResponse;
import com.sdms.backend.modules.student.entity.CheckoutRequest;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.CheckoutStatus;
import com.sdms.backend.modules.student.repository.CheckoutRequestRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.enums.BillStatus;
import org.springframework.context.ApplicationEventPublisher;
import com.sdms.backend.modules.student.event.StudentCheckedOutEvent;

@Service
@RequiredArgsConstructor
public class CheckoutRequestService {

    private final CheckoutRequestRepository checkoutRequestRepository;
    private final UserAccountRepository userAccountRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final HousingAssignmentService housingAssignmentService;
    private final BillRepository billRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CheckoutRequestResponse submitCheckoutRequest(String username, CheckoutRequestSubmitDto request) {
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản người dùng"));

        Student student = userAccount.getStudent();
        if (student == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Tài khoản chưa được liên kết với hồ sơ sinh viên");
        }

        if (checkoutRequestRepository.existsByStudent_StudentIdAndStatus(student.getStudentId(), CheckoutStatus.PENDING)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Bạn đã có một đơn xin trả phòng đang chờ xử lý");
        }

        boolean hasDebts = billRepository.existsByStudentIdAndStatusIn(student.getStudentId(), Arrays.asList(BillStatus.UNPAID, BillStatus.OVERDUE));
        if (hasDebts) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Bạn đang có hóa đơn tiền phòng hoặc điện nước chưa thanh toán. Vui lòng thanh toán toàn bộ nợ trước khi xin trả phòng.");
        }

        StudentHousingAssignment activeAssignment = assignmentRepository
                .findByStudent_StudentIdAndStatus(student.getStudentId(), AssignmentStatus.OCCUPIED)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Bạn hiện không lưu trú tại Ký túc xá"));

        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setStudent(student);
        checkoutReq.setAssignment(activeAssignment);
        checkoutReq.setIntendedCheckoutDate(request.getIntendedCheckoutDate());
        checkoutReq.setReason(request.getReason());
        checkoutReq.setBankAccountNumber(request.getBankAccountNumber());
        checkoutReq.setBankName(request.getBankName());
        checkoutReq.setStatus(CheckoutStatus.PENDING);

        return buildResponse(checkoutRequestRepository.save(checkoutReq));
    }

    @Transactional(readOnly = true)
    public List<CheckoutRequestResponse> getMyCheckoutRequests(String username) {
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản người dùng"));

        Student student = userAccount.getStudent();
        if (student == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Tài khoản chưa được liên kết với hồ sơ sinh viên");
        }

        List<CheckoutRequest> requests = checkoutRequestRepository.findAllByStudent_StudentIdOrderByCreatedAtDesc(student.getStudentId());
        return requests.stream().map(this::buildResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<CheckoutRequestResponse> getAllCheckoutRequests(CheckoutStatus status, Pageable pageable) {
        Page<CheckoutRequest> page;
        if (status != null) {
            page = checkoutRequestRepository.findByStatus(status, pageable);
        } else {
            page = checkoutRequestRepository.findAll(pageable);
        }
        
        List<CheckoutRequestResponse> content = page.getContent().stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
        return PageResponse.fromPage(page, content);
    }

    @Transactional
    public CheckoutRequestResponse reviewCheckoutRequest(UUID requestId, CheckoutRequestReviewDto request) {
        CheckoutRequest checkoutReq = checkoutRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy đơn xin trả phòng"));

        if (checkoutReq.getStatus() != CheckoutStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Đơn xin trả phòng này đã được xử lý trước đó");
        }

        if (request.getStatus() == CheckoutStatus.APPROVED) {
            checkoutReq.setStatus(CheckoutStatus.APPROVED);
            // Kích hoạt logic check-out giường thực tế
            housingAssignmentService.checkOut(checkoutReq.getAssignment().getAssignmentId());
            
            // Phát ra sự kiện Check-out thành công để các module khác (như Smart Access) thu hồi quyền
            eventPublisher.publishEvent(new StudentCheckedOutEvent(
                    this, 
                    checkoutReq.getStudent().getStudentId(),
                    checkoutReq.getAssignment().getAssignmentId(),
                    checkoutReq.getStudent().getStudentCode()
            ));
        } else if (request.getStatus() == CheckoutStatus.REJECTED) {
            checkoutReq.setStatus(CheckoutStatus.REJECTED);
            checkoutReq.setRejectReason(request.getRejectReason());
        } else {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Trạng thái xử lý không hợp lệ");
        }

        return buildResponse(checkoutRequestRepository.save(checkoutReq));
    }

    private CheckoutRequestResponse buildResponse(CheckoutRequest request) {
        return CheckoutRequestResponse.builder()
                .requestId(request.getRequestId())
                .studentId(request.getStudent().getStudentId())
                .studentCode(request.getStudent().getStudentCode())
                .fullName(request.getStudent().getFullName())
                .assignmentId(request.getAssignment().getAssignmentId())
                .roomCode(request.getAssignment().getBed().getRoom().getRoomCode())
                .bedCode(request.getAssignment().getBed().getBedCode())
                .intendedCheckoutDate(request.getIntendedCheckoutDate())
                .reason(request.getReason())
                .bankAccountNumber(request.getBankAccountNumber())
                .bankName(request.getBankName())
                .status(request.getStatus())
                .rejectReason(request.getRejectReason())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
