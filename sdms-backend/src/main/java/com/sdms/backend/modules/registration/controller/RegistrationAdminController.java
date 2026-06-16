package com.sdms.backend.modules.registration.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.registration.dto.request.CreateRegistrationPeriodRequest;
import com.sdms.backend.modules.registration.dto.request.UpdateRegistrationPeriodRequest;
import com.sdms.backend.modules.registration.dto.response.RegistrationPeriodResponse;
import com.sdms.backend.modules.registration.service.RegistrationAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/registration-periods")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin - Quản lý Đợt Đăng Ký")
public class RegistrationAdminController {

    private final RegistrationAdminService service;

    @Operation(summary = "Tạo đợt đăng ký mới")
    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationPeriodResponse>> create(@Valid @RequestBody CreateRegistrationPeriodRequest req) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo thành công", service.createPeriod(req)));
    }

    @Operation(summary = "Lấy danh sách tất cả các đợt")
    @GetMapping
    public ResponseEntity<ApiResponse<List<RegistrationPeriodResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", service.getAllPeriods()));
    }

    @Operation(summary = "Kích hoạt đợt (Tự động tắt các đợt khác)")
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable UUID id) {
        service.activatePeriod(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Kích hoạt thành công", null));
    }

    @Operation(summary = "Tắt đợt đang hoạt động")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        service.deactivatePeriod(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã tắt đợt", null));
    }

    @Operation(summary = "Cập nhật thông tin đợt")
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<RegistrationPeriodResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateRegistrationPeriodRequest req) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thành công", service.updatePeriod(id, req)));
    }
}