package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.response.*;
import com.sdms.backend.modules.room.service.RoomDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý các số liệu thống kê hạ tầng KTX.
 * Cung cấp dữ liệu realtime cho Dashboard Admin.
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard/room")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Room Dashboard", description = "API thống kê dữ liệu hạ tầng KTX")
public class RoomDashboardController {

    private final RoomDashboardService dashboardService;

    /**
     * Lấy dữ liệu tổng quan cho Dashboard Overview.
     * Trả về thông tin: Tổng tòa nhà, tổng tầng, tổng phòng, tổng giường,
     * số giường đang sử dụng/trống và tỷ lệ lấp đầy.
     */
    @Operation(summary = "Lấy dữ liệu tổng quan KTX", description = "Trả về KPI tổng thể cho Dashboard")
    @GetMapping
    public ApiResponse<RoomDashboardResponse> getOverview() {
        return new ApiResponse<>(true, "Dashboard overview loaded", dashboardService.getOverview());
    }

    /**
     * Lấy dữ liệu thống kê chi tiết trạng thái giường.
     * Trả về: Số lượng giường AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE.
     */
    @Operation(summary = "Lấy thống kê trạng thái giường", description = "Trả về số lượng giường theo từng trạng thái")
    @GetMapping("/beds")
    public ApiResponse<BedStatisticsResponse> getBedStats() {
        return new ApiResponse<>(true, "Bed statistics loaded", dashboardService.getBedStatistics());
    }
}