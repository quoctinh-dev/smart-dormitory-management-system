package com.sdms.backend.modules.smartaccess.api.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.smartaccess.api.dto.request.UpdateCurfewRequestDto;
import com.sdms.backend.modules.smartaccess.api.dto.response.CurfewRequestDto;
import com.sdms.backend.modules.smartaccess.application.service.CurfewRequestService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/curfew-requests")
@RequiredArgsConstructor
public class CurfewRequestController {

    private final CurfewRequestService curfewRequestService;

    @PostMapping
    public ApiResponse<CurfewRequestDto> createRequest(
            @jakarta.validation.Valid @RequestBody com.sdms.backend.modules.smartaccess.api.dto.request.CreateCurfewRequestDto dto
    ) {
        CurfewRequestDto created = curfewRequestService.createRequest(dto);
        return ApiResponse.success("Tạo yêu cầu vào trễ thành công", created);
    }

    @GetMapping("/me")
    public ApiResponse<PageResponse<CurfewRequestDto>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CurfewRequestDto> result = curfewRequestService.getMyRequests(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ApiResponse.success("Lấy danh sách yêu cầu vào trễ thành công", PageResponse.of(result));
    }

    @GetMapping
    public ApiResponse<PageResponse<CurfewRequestDto>> getRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CurfewRequestDto> result = curfewRequestService.getRequestsByStatus(
                status, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        
        return ApiResponse.success("Lấy danh sách yêu cầu vào trễ thành công", PageResponse.of(result));
    }

    @PatchMapping("/{id}")
    public ApiResponse<CurfewRequestDto> updateRequest(
            @PathVariable UUID id,
            @RequestBody UpdateCurfewRequestDto dto
    ) {
        // Mock adminId for now
        UUID mockAdminId = UUID.randomUUID();
        CurfewRequestDto updated = curfewRequestService.updateRequestStatus(id, dto, mockAdminId);
        return ApiResponse.success("Cập nhật trạng thái thành công", updated);
    }

    @Operation(summary = "Duyệt hàng loạt", description = "Duyệt nhiều yêu cầu về trễ cùng lúc")
    @PostMapping("/bulk/approve")
    public ApiResponse<java.util.List<CurfewRequestDto>> bulkApprove(
            @RequestBody @jakarta.validation.Valid com.sdms.backend.modules.smartaccess.api.dto.BulkCurfewRequestDto dto
    ) {
        UUID mockAdminId = UUID.randomUUID();
        java.util.List<CurfewRequestDto> result = curfewRequestService.bulkUpdateStatus(dto, com.sdms.backend.modules.smartaccess.domain.enums.CurfewRequestStatus.APPROVED, mockAdminId);
        return ApiResponse.success("Duyệt hàng loạt thành công", result);
    }

    @Operation(summary = "Từ chối hàng loạt", description = "Từ chối nhiều yêu cầu về trễ cùng lúc")
    @PostMapping("/bulk/reject")
    public ApiResponse<java.util.List<CurfewRequestDto>> bulkReject(
            @RequestBody @jakarta.validation.Valid com.sdms.backend.modules.smartaccess.api.dto.BulkCurfewRequestDto dto
    ) {
        UUID mockAdminId = UUID.randomUUID();
        java.util.List<CurfewRequestDto> result = curfewRequestService.bulkUpdateStatus(dto, com.sdms.backend.modules.smartaccess.domain.enums.CurfewRequestStatus.REJECTED, mockAdminId);
        return ApiResponse.success("Từ chối hàng loạt thành công", result);
    }
}
