package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.payment.dto.response.BillResponse;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.service.BillService;
import com.sdms.backend.modules.user.entity.UserAccount;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bills")
@RequiredArgsConstructor
@Tag(name = "Hóa đơn (Bill)", description = "Quản lý hóa đơn")
public class BillController {

    private final BillService billService;

    @Operation(summary = "Lấy hóa đơn theo hồ sơ đăng ký")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'STUDENT')")
    @GetMapping("/application/{applicationId}")
    public ApiResponse<BillResponse> getBillByApplicationId(@PathVariable UUID applicationId) {
        BillResponse response = billService.getBillByApplicationId(applicationId);
        return ApiResponse.success("Lấy thông tin hóa đơn thành công", response);
    }

    @Operation(summary = "Lấy lịch sử hóa đơn của tôi (danh sách)")
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public ApiResponse<List<BillResponse>> getMyBills(
            @AuthenticationPrincipal UserAccount currentUser
    ) {
        List<BillResponse> myBills = billService.getMyBills(currentUser);
        return ApiResponse.success("Lấy lịch sử thanh toán thành công", myBills);
    }

    @Operation(summary = "Lấy lịch sử hóa đơn của tôi (phân trang - Mobile App)")
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me/paged")
    public ApiResponse<PageResponse<BillResponse>> getMyBillsPaged(
            @AuthenticationPrincipal UserAccount currentUser,
            Pageable pageable
    ) {
        PageResponse<BillResponse> result = billService.getMyBillsPaged(currentUser, pageable);
        return ApiResponse.success("Lấy lịch sử hóa đơn thành công", result);
    }

    @Operation(summary = "Lấy tất cả hóa đơn (Admin/Staff)")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @GetMapping
    public ApiResponse<PageResponse<Map<String, Object>>> getAllBills(Pageable pageable) {
        PageResponse<Map<String, Object>> pageResponse = billService.getAllBillsPaged(pageable);
        return ApiResponse.success("Lấy danh sách hóa đơn thành công", pageResponse);
    }
}
