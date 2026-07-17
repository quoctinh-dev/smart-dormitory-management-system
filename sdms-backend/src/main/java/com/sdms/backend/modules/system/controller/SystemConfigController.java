package com.sdms.backend.modules.system.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.system.dto.SystemConfigDTO;
import com.sdms.backend.modules.system.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/system-configs")
@RequiredArgsConstructor
@Tag(name = "Cấu hình hệ thống", description = "API quản lý cấu hình hệ thống")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    @Operation(summary = "Lấy danh sách cấu hình", description = "Trả về toàn bộ danh sách cấu hình hệ thống (chỉ dành cho Admin)")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<SystemConfigDTO>> getAllConfigs() {
        return ApiResponse.success("Lấy danh sách cấu hình thành công", systemConfigService.getAllConfigs());
    }

    @Operation(summary = "Cập nhật cấu hình", description = "Cập nhật giá trị của một cấu hình hệ thống (chỉ dành cho Admin)")
    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SystemConfigDTO> updateConfig(
            @PathVariable String key,
            @RequestBody SystemConfigDTO dto) {
        return ApiResponse.success("Cập nhật cấu hình thành công", systemConfigService.updateConfig(key, dto));
    }
}
