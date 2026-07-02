package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.student.dto.request.CheckoutRequestSubmitDto;
import com.sdms.backend.modules.student.dto.response.CheckoutRequestResponse;
import com.sdms.backend.modules.student.service.CheckoutRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students/checkout-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class CheckoutRequestController {

    private final CheckoutRequestService checkoutRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<CheckoutRequestResponse>> submitRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CheckoutRequestSubmitDto request) {

        CheckoutRequestResponse response = checkoutRequestService.submitCheckoutRequest(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Nộp đơn xin trả phòng thành công", response)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CheckoutRequestResponse>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        List<CheckoutRequestResponse> responses = checkoutRequestService.getMyCheckoutRequests(userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách đơn trả phòng thành công", responses)
        );
    }
}
