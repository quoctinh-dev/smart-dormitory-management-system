package com.sdms.backend.modules.maintenance.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.maintenance.dto.request.CreateMaintenanceRequest;
import com.sdms.backend.modules.maintenance.dto.response.MaintenanceResponse;
import com.sdms.backend.modules.maintenance.service.MaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/student/maintenance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student Maintenance", description = "API Sinh viên báo cáo bảo trì/sửa chữa")
public class StudentMaintenanceController {

    private final MaintenanceService maintenanceService;

    @Operation(summary = "Tạo báo cáo sự cố (hư hỏng đồ đạc)")
    @PostMapping
    public ApiResponse<MaintenanceResponse> createRequest(@Valid @RequestBody CreateMaintenanceRequest request) {
        MaintenanceResponse response = maintenanceService.createRequest(request);
        return ApiResponse.success("Gửi báo cáo sự cố thành công", response);
    }

    @Operation(summary = "Xem lịch sử báo cáo của tôi")
    @GetMapping("/me")
    public ApiResponse<PageResponse<MaintenanceResponse>> getMyRequests(Pageable pageable) {
        PageResponse<MaintenanceResponse> response = maintenanceService.getMyRequests(pageable);
        return ApiResponse.success("Lấy danh sách thành công", response);
    }
}
