package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.student.dto.request.StayExtensionReviewRequest;
import com.sdms.backend.modules.student.dto.response.StayExtensionResponse;
import com.sdms.backend.modules.student.service.StayExtensionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/extensions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin - Quản lý đơn gia hạn lưu trú")
public class StayExtensionAdminController {

    private final StayExtensionService stayExtensionService;

    @Operation(summary = "Lấy danh sách đơn gia hạn", description = "Lấy tất cả đơn xin gia hạn lưu trú của sinh viên, có hỗ trợ phân trang")
    @GetMapping
    public ApiResponse<PageResponse<StayExtensionResponse>> getAllExtensions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<StayExtensionResponse> response = stayExtensionService.getAllExtensions(pageable);
        return ApiResponse.success("Lấy danh sách đơn gia hạn thành công", response);
    }

    @Operation(summary = "Phê duyệt hoặc từ chối đơn gia hạn", description = "Admin duyệt hoặc từ chối đơn xin gia hạn lưu trú của sinh viên")
    @PutMapping("/{id}/status")
    public ApiResponse<StayExtensionResponse> reviewExtension(
            @PathVariable UUID id,
            @Valid @RequestBody StayExtensionReviewRequest request) {

        StayExtensionResponse response = stayExtensionService.reviewExtension(id, request);

        return ApiResponse.success("Đã duyệt đơn gia hạn thành công", response);
    }
}
