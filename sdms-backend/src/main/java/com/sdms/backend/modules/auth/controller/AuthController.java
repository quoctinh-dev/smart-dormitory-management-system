package com.sdms.backend.modules.auth.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.auth.dto.request.ActivateAccountRequest;
import com.sdms.backend.modules.auth.dto.request.ChangePasswordRequest;
import com.sdms.backend.modules.auth.dto.request.ForgotPasswordRequest;
import com.sdms.backend.modules.auth.dto.request.LoginRequest;
import com.sdms.backend.modules.auth.dto.request.RefreshTokenRequest;
import com.sdms.backend.modules.auth.dto.request.ResetPasswordRequest;
import com.sdms.backend.modules.auth.dto.response.AuthResponse;
import com.sdms.backend.modules.auth.service.AuthService;
import com.sdms.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý các API liên quan đến xác thực và tài khoản.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Xác thực (Authentication)", description = "Các API dùng để xác thực và quản lý tài khoản")
public class    AuthController {

    private final AuthService authService;
    private final UserService userService;

    @Operation(summary = "Kích hoạt tài khoản sinh viên", description = "Kích hoạt tài khoản bằng email, mật khẩu tạm thời (CCCD) và mật khẩu mới")
    @PostMapping("/activate")
    public ApiResponse<AuthResponse> activate(@Valid @RequestBody ActivateAccountRequest request) {
        AuthResponse response = authService.activate(request);
        return ApiResponse.success("Tài khoản đã được kích hoạt thành công", response);
    }

    @Operation(summary = "Đăng nhập", description = "Xác thực người dùng và trả về JWT token")
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.success("Đăng nhập thành công", response);
    }

    @Operation(summary = "Làm mới Token", description = "Cấp lại Access Token và Refresh Token mới")
    @PostMapping({"/refresh-token", "/refresh"})
    public ApiResponse<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ApiResponse.success("Làm mới Token thành công", response);
    }

    @Operation(summary = "Đăng xuất", description = "Đăng xuất người dùng và vô hiệu hóa Refresh Token")
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        authService.logout();
        return ApiResponse.success("Đăng xuất thành công", null);
    }

    @Operation(summary = "Đổi mật khẩu", description = "Đổi mật khẩu cho người dùng đang đăng nhập")
    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ApiResponse.success("Đổi mật khẩu thành công", null);
    }

    @Operation(summary = "Quên mật khẩu", description = "Gửi yêu cầu khôi phục mật khẩu qua email")
    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success("Yêu cầu khôi phục mật khẩu đã được xử lý", null);
    }

    @Operation(summary = "Khôi phục mật khẩu", description = "Đặt lại mật khẩu mới bằng token hợp lệ")
    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Mật khẩu đã được khôi phục thành công", null);
    }

}
