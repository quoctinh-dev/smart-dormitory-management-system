package com.sdms.backend.modules.student.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import com.sdms.backend.modules.student.dto.request.BulkCheckoutReviewDto;
import com.sdms.backend.modules.student.dto.request.CheckoutRequestReviewDto;
import com.sdms.backend.modules.student.dto.request.CheckoutRequestSubmitDto;
import com.sdms.backend.modules.student.dto.response.CheckoutRequestResponse;
import com.sdms.backend.modules.student.entity.CheckoutRequest;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.CheckoutStatus;
import com.sdms.backend.modules.student.event.StudentCheckedOutEvent;
import com.sdms.backend.modules.student.repository.CheckoutRequestRepository;
import com.sdms.backend.modules.system.service.SystemConfigService;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.repository.UserAccountRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckoutRequestService {

    private final CheckoutRequestRepository checkoutRequestRepository;
    private final UserAccountRepository userAccountRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final HousingAssignmentService housingAssignmentService;
    private final BillRepository billRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final SystemConfigService systemConfigService;

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

        // Validate số ngày báo trước tối thiểu (7 ngày)
        int minNoticeDays = Integer.parseInt(systemConfigService.getConfigValue("MIN_CHECKOUT_NOTICE_DAYS", "7"));
        LocalDateTime minValidDate = LocalDateTime.now().plusDays(minNoticeDays).truncatedTo(ChronoUnit.DAYS);
        
        if (request.getIntendedCheckoutDate().isBefore(minValidDate)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, 
                "Ngày dự kiến trả phòng phải báo trước ít nhất " + minNoticeDays + " ngày (từ ngày " + minValidDate.toLocalDate().toString() + " trở đi)");
        }

        // [LUẬT LƯU TRÚ] Không cho phép làm đơn trả phòng sớm nếu chỉ còn dưới 30 ngày là hết hạn đợt
        StudentHousingAssignment activeAssignment = assignmentRepository
                .findByStudent_StudentIdAndStatus(student.getStudentId(), AssignmentStatus.OCCUPIED)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Bạn hiện không lưu trú tại Ký túc xá"));

        LocalDate endDate = activeAssignment.getApplication().getRegistrationPeriod().getStayEndDate().toLocalDate();
        LocalDate now = LocalDate.now();
        long daysUntilEnd = ChronoUnit.DAYS.between(now, endDate);
        
        if (daysUntilEnd < 30) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, 
                "Bạn đang trong tháng cuối cùng của kỳ lưu trú. Hệ thống không tiếp nhận đơn trả phòng sớm. Vui lòng dọn dẹp và chờ hệ thống tự động trả phòng vào ngày " + endDate);
        }

        // [SỬA LỖI] Chỉ chặn nếu có hóa đơn QUÁ HẠN (OVERDUE). 
        // Các hóa đơn UNPAID (chưa tới hạn) có thể là hóa đơn của chu kỳ sau, hoặc Admin sẽ cấn trừ vào tiền cọc lúc duyệt.
        boolean hasDebts = billRepository.existsByStudentIdAndStatusIn(student.getStudentId(), Arrays.asList(BillStatus.OVERDUE));
        if (hasDebts) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Bạn đang có hóa đơn tiền phòng hoặc điện nước ĐÃ QUÁ HẠN. Vui lòng thanh toán nợ quá hạn trước khi xin trả phòng.");
        }

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
    public PageResponse<CheckoutRequestResponse> getAllCheckoutRequests(CheckoutStatus status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59, 999999999) : null;

        Page<CheckoutRequest> page = checkoutRequestRepository.findByFilters(status, startDateTime, endDateTime, pageable);
        
        List<CheckoutRequestResponse> content = page.getContent().stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
        return PageResponse.fromPage(page, content);
    }

    @Transactional
    public int bulkReviewCheckoutRequests(BulkCheckoutReviewDto request) {
        if (request.getRequestIds() == null || request.getRequestIds().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Danh sách đơn xin trả phòng trống");
        }

        int count = 0;
        for (UUID requestId : request.getRequestIds()) {
            try {
                CheckoutRequestReviewDto reviewDto = new CheckoutRequestReviewDto();
                reviewDto.setStatus(request.getStatus());
                reviewCheckoutRequest(requestId, reviewDto);
                count++;
            } catch (Exception e) {
                // Có thể log lỗi cho từng đơn bị thất bại, tiếp tục với đơn khác
            }
        }
        return count;
    }

    @Transactional
    public CheckoutRequestResponse reviewCheckoutRequest(UUID requestId, CheckoutRequestReviewDto request) {
        CheckoutRequest checkoutReq = checkoutRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy đơn xin trả phòng"));

        if (request.getStatus() == CheckoutStatus.APPROVED) {
            if (checkoutReq.getStatus() != CheckoutStatus.PENDING) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể duyệt đơn đang ở trạng thái PENDING");
            }
            checkoutReq.setStatus(CheckoutStatus.APPROVED);
            
            // 1. Kích hoạt logic check-out giường thực tế (Cập nhật trạng thái Giường thành AVAILABLE)
            housingAssignmentService.checkOut(checkoutReq.getAssignment().getAssignmentId());
            
            /* 
             * [KIẾN TRÚC HỆ THỐNG - EVENT-DRIVEN ARCHITECTURE (OBSERVER PATTERN)]
             * Thay vì gọi trực tiếp các module khác (VD: smartAccessService.revoke() hay paymentService.cancelBill()), 
             * ta dùng ApplicationEventPublisher để bắn ra một Sự kiện (Event).
             * Ý NGHĨA KHI BẢO VỆ ĐỒ ÁN: 
             * - Đảm bảo tính "Lỏng lẻo" (Loose Coupling): Module Student không cần biết sự tồn tại của module IoT hay Payment.
             * - Tính mở rộng (Open-Closed Principle): Sau này nếu thêm tính năng "Tự động gửi Email khi Checkout", 
             *   ta chỉ cần viết 1 Listener mới bắt Event này mà không cần sửa code ở hàm này.
             */
            eventPublisher.publishEvent(new StudentCheckedOutEvent(
                    this, 
                    checkoutReq.getStudent().getStudentId(),
                    checkoutReq.getAssignment().getAssignmentId(),
                    checkoutReq.getStudent().getStudentCode()
            ));
        } else if (request.getStatus() == CheckoutStatus.REJECTED) {
            if (checkoutReq.getStatus() != CheckoutStatus.PENDING) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể từ chối đơn đang ở trạng thái PENDING");
            }
            checkoutReq.setStatus(CheckoutStatus.REJECTED);
            checkoutReq.setRejectReason(request.getRejectReason());
        } else if (request.getStatus() == CheckoutStatus.COMPLETED) {
            if (checkoutReq.getStatus() != CheckoutStatus.APPROVED) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể hoàn tất đơn khi đã được APPROVED trước đó");
            }
            checkoutReq.setStatus(CheckoutStatus.COMPLETED);
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
