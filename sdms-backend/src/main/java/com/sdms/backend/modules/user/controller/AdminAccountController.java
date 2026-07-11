package com.sdms.backend.modules.user.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.user.dto.response.UserAccountDTO;
import com.sdms.backend.modules.user.dto.request.CreateStaffRequest;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/accounts")
@RequiredArgsConstructor
@Tag(name = "Admin Account Management")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAccountController {

    private final UserService userService;

    @Operation(summary = "Lấy danh sách tài khoản (Có tìm kiếm & phân trang)")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserAccountDTO>>> getAccounts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy danh sách tài khoản thành công",
                        userService.searchAccounts(keyword, role, status, pageable)
                )
        );
    }

    @Operation(summary = "Khóa/Mở khóa tài khoản")
    @PutMapping("/{id}/toggle-lock")
    public ResponseEntity<ApiResponse<Void>> toggleLock(@PathVariable UUID id) {
        userService.toggleAccountStatus(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Đã thay đổi trạng thái tài khoản thành công", null)
        );
    }

    @Operation(summary = "Thêm tài khoản Staff mới")
    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<Void>> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        userService.createStaff(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo tài khoản Staff thành công", null));
    }

    @Operation(summary = "Xem hồ sơ sinh viên từ tài khoản")
    @GetMapping("/{id}/student-profile")
    public ResponseEntity<ApiResponse<com.sdms.backend.modules.student.dto.response.StudentProfileResponse>> getStudentProfileByAccountId(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Lấy hồ sơ sinh viên thành công",
                userService.getStudentProfileByAccountId(id)
        ));
    }
}
