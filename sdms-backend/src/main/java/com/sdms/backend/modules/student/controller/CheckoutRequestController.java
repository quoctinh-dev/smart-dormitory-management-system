package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.student.dto.request.CheckoutRequestSubmitDto;
import com.sdms.backend.modules.student.dto.response.CheckoutRequestResponse;
import com.sdms.backend.modules.student.service.CheckoutRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students/checkout-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student Checkout Request", description = "API quản lý đơn xin trả phòng (dành cho Sinh viên)")
public class CheckoutRequestController {

    private final CheckoutRequestService checkoutRequestService;

    @Operation(summary = "Nộp đơn xin trả phòng", description = "Sinh viên tạo và nộp đơn xin trả phòng")
    @PostMapping
    public ApiResponse<CheckoutRequestResponse> submitRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CheckoutRequestSubmitDto request) {

        CheckoutRequestResponse response = checkoutRequestService.submitCheckoutRequest(userDetails.getUsername(), request);
        return ApiResponse.success("Nộp đơn xin trả phòng thành công", response);
    }

    @Operation(summary = "Lấy danh sách đơn trả phòng của tôi", description = "Lấy danh sách các đơn xin trả phòng mà sinh viên này đã nộp")
    @GetMapping
    public ApiResponse<List<CheckoutRequestResponse>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        List<CheckoutRequestResponse> responses = checkoutRequestService.getMyCheckoutRequests(userDetails.getUsername());
        return ApiResponse.success("Lấy danh sách đơn trả phòng thành công", responses);
    }
}
