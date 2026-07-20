package com.sdms.backend.modules.user.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.user.dto.response.UserAccountResponse;
import com.sdms.backend.modules.user.dto.request.CreateStaffRequest;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/accounts")
@RequiredArgsConstructor
@Tag(name = "Quản lý tài khoản Admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAccountController {

    private final UserService userService;

    @Operation(summary = "Lấy danh sách tài khoản (Có tìm kiếm & phân trang)")
    @GetMapping
    public ApiResponse<PageResponse<UserAccountResponse>> getAccounts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status,
            Pageable pageable
    ) {
        return ApiResponse.success("Lấy danh sách tài khoản thành công", userService.searchAccounts(keyword, role, status, pageable));
    }

    @Operation(summary = "Khóa/Mở khóa tài khoản")
    @PutMapping("/{id}/toggle-lock")
    public ApiResponse<Void> toggleLock(@PathVariable UUID id) {
        userService.toggleAccountStatus(id);
        return ApiResponse.success("Đã thay đổi trạng thái tài khoản thành công");
    }

    @Operation(summary = "Thêm tài khoản Staff mới")
    @PostMapping("/staff")
    public ApiResponse<Void> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        userService.createStaff(request);
        return ApiResponse.success("Tạo tài khoản Staff thành công");
    }

    @Operation(summary = "Xem hồ sơ sinh viên từ tài khoản")
    @GetMapping("/{id}/student-profile")
    public ApiResponse<com.sdms.backend.modules.student.dto.response.StudentProfileResponse> getStudentProfileByAccountId(@PathVariable UUID id) {
        return ApiResponse.success("Lấy hồ sơ sinh viên thành công", userService.getStudentProfileByAccountId(id));
    }

    @Operation(summary = "Cập nhật thông tin học vụ của sinh viên (Khoa/Khóa)")
    @PatchMapping("/{id}/student-profile/academic")
    public ApiResponse<com.sdms.backend.modules.student.dto.response.StudentProfileResponse> updateStudentAcademicInfo(
            @PathVariable UUID id,
            @Valid @RequestBody com.sdms.backend.modules.student.dto.request.UpdateAcademicInfoRequest request) {
        return ApiResponse.success("Cập nhật học vụ thành công", userService.updateStudentAcademicInfo(id, request));
    }
}
