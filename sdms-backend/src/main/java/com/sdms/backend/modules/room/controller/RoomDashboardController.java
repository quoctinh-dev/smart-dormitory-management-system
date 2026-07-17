package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.response.DashboardStatsResponse;
import com.sdms.backend.modules.room.service.RoomDashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Thống kê tổng quan (Dashboard)", description = "API lấy dữ liệu tổng quan cho Dashboard")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class RoomDashboardController {

    private final RoomDashboardService dashboardService;

    @Operation(summary = "Lấy thông số thống kê tổng quan")
    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> getStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ApiResponse.success("Lấy dữ liệu thống kê thành công", stats);
    }
}
