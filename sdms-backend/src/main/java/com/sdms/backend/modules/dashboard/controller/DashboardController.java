package com.sdms.backend.modules.dashboard.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.dashboard.dto.response.DashboardStatsResponse;
import com.sdms.backend.modules.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Thống kê tổng quan (Dashboard)", description = "API lấy dữ liệu tổng quan cho Dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Lấy thống kê tổng quan (Dashboard)")
    public ApiResponse<DashboardStatsResponse> getStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ApiResponse.success("Lấy thống kê thành công", stats);
    }
}
