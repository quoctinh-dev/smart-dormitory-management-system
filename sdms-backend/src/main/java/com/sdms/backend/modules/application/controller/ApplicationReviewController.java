package com.sdms.backend.modules.application.controller;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.application.dto.request.AdminRequestRevisionRequest;
import com.sdms.backend.modules.application.dto.request.AdminReviewRequest;
import com.sdms.backend.modules.application.dto.request.VerifyDocumentRequest;
import com.sdms.backend.modules.application.service.ApplicationReviewService;
import com.sdms.backend.modules.payment.service.PaymentService;
import com.sdms.backend.modules.user.entity.UserAccount;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * REST Controller dành riêng cho Quản trị viên (Admin) và Nhân viên (Staff) để thực hiện quy trình xét duyệt hồ sơ đăng ký KTX.
 * <p>
 * Bao gồm các chức năng: Bắt đầu duyệt, Xác minh giấy tờ đính kèm, Phê duyệt, Từ chối, Yêu cầu nộp lại tài liệu và Xác nhận thu tiền mặt.
 */
@RestController
@RequestMapping("/api/v1/admin/applications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin - Duyệt hồ sơ nội trú")
public class ApplicationReviewController {

    private final ApplicationReviewService reviewService;
    private final PaymentService paymentService;

    /**
     * Endpoint bắt đầu quy trình xét duyệt hồ sơ (Chuyển trạng thái sang UNDER_REVIEW).
     *
     * @param applicationId Mã ID hồ sơ đăng ký cần duyệt
     * @param userAccount Thông tin tài khoản Admin/Staff đang đăng nhập
     * @return Phản hồi xác nhận bắt đầu duyệt thành công
     */
    @Operation(summary = "Bắt đầu duyệt hồ sơ (Chuyển sang UNDER_REVIEW)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bắt đầu xét duyệt thành công")
    @PatchMapping("/{applicationId}/start-review")
    public ApiResponse<Void> startReview(
            @PathVariable UUID applicationId,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.startReview(applicationId, adminUserId);
        return ApiResponse.success("Bắt đầu xét duyệt thành công");
    }

    /**
     * Endpoint xác minh tính hợp lệ/không hợp lệ của tài liệu minh chứng (CCCD, Ảnh thẻ, Giấy ưu tiên...).
     *
     * @param documentId Mã ID tài liệu minh chứng
     * @param request Thông tin xác minh (Trạng thái VALID/INVALID và ghi chú lý do)
     * @param userAccount Thông tin tài khoản Admin/Staff đang thực hiện
     * @return Phản hồi xác minh tài liệu thành công
     */
    @Operation(summary = "Xác minh tài liệu đính kèm (CCCD, ảnh chân dung...)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác minh tài liệu thành công")
    @PatchMapping("/documents/{documentId}/verify")
    public ApiResponse<Void> verifyDocument(
            @PathVariable UUID documentId,
            @Valid @RequestBody VerifyDocumentRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.verifyDocument(documentId, request.getStatus(), request.getNote(), adminUserId);
        return ApiResponse.success("Xác minh tài liệu thành công");
    }

    /**
     * Endpoint phê duyệt đơn đăng ký nội trú của sinh viên.
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @param request Thông tin ghi chú phê duyệt
     * @param userAccount Thông tin tài khoản Admin/Staff phê duyệt
     * @return Phản hồi phê duyệt thành công
     */
    @Operation(summary = "Phê duyệt đơn đăng ký nội trú")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Phê duyệt đơn thành công")
    @PatchMapping("/{applicationId}/approve")
    public ApiResponse<Void> approveApplication(
            @PathVariable UUID applicationId,
            @Valid @RequestBody AdminReviewRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.approveApplication(applicationId, request.getNote(), adminUserId);
        return ApiResponse.success("Phê duyệt đơn thành công (Chờ nộp phí)");
    }

    /**
     * Endpoint từ chối đơn đăng ký nội trú.
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @param request Thông tin lý do từ chối
     * @param userAccount Thông tin tài khoản Admin/Staff từ chối
     * @return Phản hồi từ chối thành công
     */
    @Operation(summary = "Từ chối đơn đăng ký nội trú")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Từ chối đơn thành công")
    @PatchMapping("/{applicationId}/reject")
    public ApiResponse<Void> rejectApplication(
            @PathVariable UUID applicationId,
            @Valid @RequestBody AdminReviewRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.rejectApplication(applicationId, request.getNote(), adminUserId);
        return ApiResponse.success("Từ chối đơn thành công");
    }

    /**
     * Endpoint gửi yêu cầu sinh viên bổ sung/nộp lại các tài liệu minh chứng không hợp lệ.
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @param request Thông tin yêu cầu nộp lại (Ghi chú và Hạn chót bổ sung)
     * @param userAccount Thông tin tài khoản Admin/Staff gửi yêu cầu
     * @return Phản hồi yêu cầu nộp lại thành công
     */
    @Operation(summary = "Yêu cầu sinh viên nộp lại minh chứng sai")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đã gửi email yêu cầu nộp lại minh chứng thành công")
    @PatchMapping("/{applicationId}/request-revision")
    public ApiResponse<Void> requestRevision(
            @PathVariable UUID applicationId,
            @Valid @RequestBody AdminRequestRevisionRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.requestRevision(applicationId, request.getNote(), request.getDeadlineDays(), adminUserId);
        return ApiResponse.success("Đã gửi email yêu cầu nộp lại minh chứng thành công");
    }

    /**
     * Endpoint xác nhận thu tiền giữ chỗ KTX trực tiếp bằng tiền mặt tại quầy.
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @param request Thông tin ghi chú xác nhận (Tùy chọn)
     * @param userAccount Thông tin tài khoản Admin/Staff thu tiền
     * @return Phản hồi xác nhận thu tiền thành công
     */
    @Operation(summary = "Xác nhận thu tiền giữ chỗ trực tiếp (Tiền mặt)",
            description = "Admin xác nhận đã thu tiền mặt tại quầy. Hệ thống tự tìm hóa đơn UNPAID của đơn đăng ký và đánh dấu PAID với phương thức CASH.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác nhận thu tiền thành công")
    @PatchMapping("/{applicationId}/confirm-payment")
    public ApiResponse<Void> confirmPayment(
            @PathVariable UUID applicationId,
            @RequestBody(required = false) AdminReviewRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        getAccountIdSafely(userAccount);
        paymentService.confirmCashPaymentByApplication(applicationId);
        return ApiResponse.success("Đã xác nhận thu tiền giữ chỗ thành công");
    }

    /**
     * Hàm private kiểm tra an toàn và trích xuất Account ID từ UserAccount đang đăng nhập.
     */
    private UUID getAccountIdSafely(UserAccount userAccount) {
        if (userAccount == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện chức năng này");
        }
        return userAccount.getAccountId();
    }
}