package com.sdms.backend.modules.application.controller;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.application.dto.request.AdminReviewRequest;
import com.sdms.backend.modules.application.dto.request.VerifyDocumentRequest;
import com.sdms.backend.modules.application.service.ApplicationReviewService;
import com.sdms.backend.modules.user.entity.UserAccount;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/applications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin - Duyệt hồ sơ nội trú")
public class ApplicationReviewController {

    private final ApplicationReviewService reviewService;

    @Operation(summary = "Bắt đầu duyệt hồ sơ (Chuyển sang UNDER_REVIEW)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bắt đầu xét duyệt thành công")
    @PatchMapping("/{applicationId}/start-review")
    public ResponseEntity<ApiResponse<Void>> startReview(
            @PathVariable UUID applicationId,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.startReview(applicationId, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Bắt đầu xét duyệt thành công"));
    }

    @Operation(summary = "Xác minh tài liệu đính kèm (CCCD, ảnh chân dung...)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác minh tài liệu thành công")
    @PatchMapping("/documents/{documentId}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyDocument(
            @PathVariable UUID documentId,
            @Valid @RequestBody VerifyDocumentRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.verifyDocument(documentId, request.getStatus(), request.getNote(), adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Xác minh tài liệu thành công"));
    }

    @Operation(summary = "Phê duyệt đơn đăng ký nội trú")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Phê duyệt đơn thành công")
    @PatchMapping("/{applicationId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveApplication(
            @PathVariable UUID applicationId,
            @Valid @RequestBody AdminReviewRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.approveApplication(applicationId, request.getNote(), adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Phê duyệt đơn thành công (Chờ nộp phí)"));
    }

    @Operation(summary = "Xác nhận sinh viên nộp tiền mặt tại quầy")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác nhận thu tiền thành công")
    @PatchMapping("/{applicationId}/confirm-payment")
    public ResponseEntity<ApiResponse<Void>> confirmCashPayment(
            @PathVariable UUID applicationId,
            @Valid @RequestBody AdminReviewRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.confirmCashPayment(applicationId, request.getNote(), adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận thu tiền thành công, đã xếp phòng chính thức"));
    }

    @Operation(summary = "Từ chối đơn đăng ký nội trú")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Từ chối đơn thành công")
    @PatchMapping("/{applicationId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectApplication(
            @PathVariable UUID applicationId,
            @Valid @RequestBody AdminReviewRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.rejectApplication(applicationId, request.getNote(), adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Từ chối đơn thành công"));
    }

    @Operation(summary = "Yêu cầu sinh viên nộp lại minh chứng sai")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đã gửi email yêu cầu nộp lại minh chứng thành công")
    @PatchMapping("/{applicationId}/request-revision")
    public ResponseEntity<ApiResponse<Void>> requestRevision(
            @PathVariable UUID applicationId,
            @Valid @RequestBody com.sdms.backend.modules.application.dto.request.AdminRequestRevisionRequest request,
            @AuthenticationPrincipal UserAccount userAccount
    ) {
        UUID adminUserId = getAccountIdSafely(userAccount);
        reviewService.requestRevision(applicationId, request.getNote(), request.getDeadlineDays(), adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi email yêu cầu nộp lại minh chứng thành công"));
    }

    private UUID getAccountIdSafely(UserAccount userAccount) {
        if (userAccount == null) {
            throw new AppException("User not authenticated", HttpStatus.UNAUTHORIZED);
        }
        return userAccount.getAccountId();
    }
}
