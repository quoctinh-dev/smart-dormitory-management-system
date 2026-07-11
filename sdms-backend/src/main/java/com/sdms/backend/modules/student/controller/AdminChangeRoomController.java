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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/change-room")
@RequiredArgsConstructor
public class AdminChangeRoomController {

    private final ChangeRoomService changeRoomService;

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<PageResponse<ChangeRoomResponseDto>>> getAllRequests(
            @RequestParam(required = false) ChangeRoomRequestStatus status,
            @PageableDefault(sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        
        Page<ChangeRoomResponseDto> page = changeRoomService.getAllRequests(status, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thành công", PageResponse.of(page)));
    }

    @PostMapping("/requests/{id}/process")
    public ResponseEntity<ApiResponse<ChangeRoomResponseDto>> processRequest(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AdminProcessChangeRoomDto dto) {
        
        UserAccount userAccount = (UserAccount) authentication.getPrincipal();
        UUID adminId = userAccount.getAccountId();
        
        ChangeRoomResponseDto response = changeRoomService.processRequest(adminId, id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xử lý yêu cầu thành công", response));
    }

    @PostMapping("/maintenance/relocate")
    public ResponseEntity<ApiResponse<Void>> relocateForMaintenance(
            Authentication authentication,
            @Valid @RequestBody MaintenanceRelocationDto dto) {
        
        UserAccount userAccount = (UserAccount) authentication.getPrincipal();
        UUID adminId = userAccount.getAccountId();
        
        changeRoomService.relocateStudentsForMaintenance(adminId, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Di dời sinh viên thành công", null));
    }
}
