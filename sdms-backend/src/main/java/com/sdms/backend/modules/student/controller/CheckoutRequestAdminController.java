package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.student.dto.request.CheckoutRequestReviewDto;
import com.sdms.backend.modules.student.dto.response.CheckoutRequestResponse;
import com.sdms.backend.modules.student.enums.CheckoutStatus;
import com.sdms.backend.modules.student.service.CheckoutRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/checkout-requests")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin Checkout Request", description = "API quản lý đơn xin trả phòng (dành cho Admin)")
public class CheckoutRequestAdminController {

    private final CheckoutRequestService checkoutRequestService;

    @Operation(summary = "Lấy danh sách đơn trả phòng", description = "Lấy tất cả đơn xin trả phòng của sinh viên, có hỗ trợ phân trang và lọc theo trạng thái")
    @GetMapping
    public ApiResponse<PageResponse<CheckoutRequestResponse>> getAllRequests(
            @RequestParam(required = false) CheckoutStatus status,
            Pageable pageable) {

        PageResponse<CheckoutRequestResponse> response = checkoutRequestService.getAllCheckoutRequests(status, pageable);
        return ApiResponse.success("Lấy danh sách đơn trả phòng thành công", response);
    }

    @Operation(summary = "Xét duyệt đơn trả phòng", description = "Admin duyệt hoặc từ chối đơn xin trả phòng của sinh viên")
    @PostMapping("/{requestId}/review")
    public ApiResponse<CheckoutRequestResponse> reviewRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody CheckoutRequestReviewDto request) {

        CheckoutRequestResponse response = checkoutRequestService.reviewCheckoutRequest(requestId, request);
        return ApiResponse.success("Xét duyệt đơn trả phòng thành công", response);
    }
}
