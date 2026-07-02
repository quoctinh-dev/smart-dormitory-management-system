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
import org.springframework.http.ResponseEntity;
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

    @Operation(summary = "Lấy danh sách đơn gia hạn")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StayExtensionResponse>>> getAllExtensions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<StayExtensionResponse> response = stayExtensionService.getAllExtensions(pageable);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách đơn gia hạn thành công", response)
        );
    }

    @Operation(summary = "Phê duyệt hoặc từ chối đơn gia hạn")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<StayExtensionResponse>> reviewExtension(
            @PathVariable UUID id,
            @Valid @RequestBody StayExtensionReviewRequest request) {

        StayExtensionResponse response = stayExtensionService.reviewExtension(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Đã duyệt đơn gia hạn thành công", response)
        );
    }
}
