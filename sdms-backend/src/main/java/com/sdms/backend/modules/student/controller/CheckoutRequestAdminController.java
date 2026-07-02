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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/checkout-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CheckoutRequestAdminController {

    private final CheckoutRequestService checkoutRequestService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CheckoutRequestResponse>>> getAllRequests(
            @RequestParam(required = false) CheckoutStatus status,
            Pageable pageable) {

        PageResponse<CheckoutRequestResponse> response = checkoutRequestService.getAllCheckoutRequests(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn trả phòng thành công", response));
    }

    @PostMapping("/{requestId}/review")
    public ResponseEntity<ApiResponse<CheckoutRequestResponse>> reviewRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody CheckoutRequestReviewDto request) {

        CheckoutRequestResponse response = checkoutRequestService.reviewCheckoutRequest(requestId, request);
        return ResponseEntity.ok(ApiResponse.success("Xét duyệt đơn trả phòng thành công", response));
    }
}
