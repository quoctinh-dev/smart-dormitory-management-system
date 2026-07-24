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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/registration-periods")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Quản lý Đợt Đăng Ký")
public class RegistrationAdminController {

    private final RegistrationAdminService service;

    @Operation(summary = "Tạo đợt đăng ký mới")
    @PostMapping
    public ApiResponse<RegistrationPeriodResponse> create(@Valid @RequestBody CreateRegistrationPeriodRequest req) {
        return ApiResponse.success("Tạo thành công", service.createPeriod(req));
    }

    @Operation(summary = "Lấy danh sách tất cả các đợt")
    @GetMapping
    public ApiResponse<List<RegistrationPeriodResponse>> getAll() {
        return ApiResponse.success("Thành công", service.getAllPeriods());
    }

    @Operation(summary = "Kích hoạt đợt (Tự động tắt các đợt khác)")
    @PatchMapping("/{id}/activate")
    public ApiResponse<Void> activate(@PathVariable UUID id) {
        service.activatePeriod(id);
        return ApiResponse.success("Kích hoạt thành công");
    }

    @Operation(summary = "Tắt đợt đang hoạt động")
    @PatchMapping("/{id}/deactivate")
    public ApiResponse<Void> deactivate(@PathVariable UUID id) {
        service.deactivatePeriod(id);
        return ApiResponse.success("Đã tắt đợt");
    }

    @Operation(summary = "Cập nhật thông quyết đợt")
    @PatchMapping("/{id}")
    public ApiResponse<RegistrationPeriodResponse> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateRegistrationPeriodRequest req) {
        return ApiResponse.success("Cập nhật thành công", service.updatePeriod(id, req));
    }

    @Operation(summary = "Xóa đợt đăng ký (Hard Delete)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        service.deletePeriod(id);
        return ApiResponse.success("Xóa cứng thành công");
    }
}