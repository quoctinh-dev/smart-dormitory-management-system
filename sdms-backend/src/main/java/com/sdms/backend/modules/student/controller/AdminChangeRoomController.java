package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.student.dto.AdminProcessChangeRoomDto;
import com.sdms.backend.modules.student.dto.ChangeRoomResponseDto;
import com.sdms.backend.modules.student.dto.MaintenanceRelocationDto;
import com.sdms.backend.modules.student.enums.ChangeRoomRequestStatus;
import com.sdms.backend.modules.student.service.ChangeRoomService;
import com.sdms.backend.modules.user.entity.UserAccount;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/change-room")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin duyệt hoặc từ chối yêu cầu đổi phòng của sinh viên", description = "API quản lý việc đổi phòng và di dời sinh viên (dành cho Admin)")
public class AdminChangeRoomController {

    private final ChangeRoomService changeRoomService;

    @Operation(summary = "Lấy danh sách yêu cầu đổi phòng", description = "Lấy tất cả yêu cầu đổi phòng của sinh viên, có hỗ trợ phân trang và lọc theo trạng thái")
    @GetMapping("/requests")
    public ApiResponse<PageResponse<ChangeRoomResponseDto>> getAllRequests(
            @RequestParam(required = false) ChangeRoomRequestStatus status,
            @PageableDefault(sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        
        Page<ChangeRoomResponseDto> page = changeRoomService.getAllRequests(status, pageable);
        return ApiResponse.success("Lấy danh sách thành công", PageResponse.of(page));
    }

    @Operation(summary = "Xử lý yêu cầu đổi phòng", description = "Admin duyệt hoặc từ chối yêu cầu đổi phòng của sinh viên")
    @PostMapping("/requests/{id}/process")
    public ApiResponse<ChangeRoomResponseDto> processRequest(
            org.springframework.security.core.Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AdminProcessChangeRoomDto dto) {
        
        UserAccount userAccount = (UserAccount) authentication.getPrincipal();
        java.util.UUID adminId = userAccount.getAccountId();
        
        ChangeRoomResponseDto response = changeRoomService.processRequest(adminId, id, dto);
        return ApiResponse.success("Xử lý yêu cầu thành công", response);
    }

    @Operation(summary = "Di dời sinh viên để bảo trì", description = "Di dời hàng loạt sinh viên sang phòng khác để thực hiện bảo trì phòng hiện tại")
    @PostMapping("/maintenance/relocate")
    public ApiResponse<Void> relocateForMaintenance(
            org.springframework.security.core.Authentication authentication,
            @Valid @RequestBody MaintenanceRelocationDto dto) {
        
        UserAccount userAccount = (UserAccount) authentication.getPrincipal();
        java.util.UUID adminId = userAccount.getAccountId();
        
        changeRoomService.relocateStudentsForMaintenance(adminId, dto);
        return ApiResponse.success("Di dời sinh viên thành công");
    }
}
