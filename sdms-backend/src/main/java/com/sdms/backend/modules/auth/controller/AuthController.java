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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý các API liên quan đến xác thực và tài khoản.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @Operation(summary = "Kích hoạt tài khoản sinh viên", description = "Kích hoạt tài khoản bằng email, mật khẩu tạm thời (CCCD) và mật khẩu mới")
    @PostMapping("/activate")
    public ResponseEntity<ApiResponse<AuthResponse>> activate(@Valid @RequestBody ActivateAccountRequest request) {
        AuthResponse response = authService.activate(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tài khoản đã được kích hoạt thành công", response));
    }

    @Operation(summary = "User Login", description = "Authenticate user and return JWT tokens")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
    }

    @Operation(summary = "Refresh Token", description = "Get new access and refresh tokens")
    @PostMapping({"/refresh-token", "/refresh"})
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(new ApiResponse<>(true, "Refresh token successful", response));
    }

    @Operation(summary = "User Logout", description = "Logout user and revoke refresh token")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        authService.logout();
        return ResponseEntity.ok(new ApiResponse<>(true, "Logout successful", null));
    }

    @Operation(summary = "Change Password", description = "Change password for the current authenticated user")
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully", null));
    }

    @Operation(summary = "Forgot Password", description = "Request password reset via email")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset request processed", null));
    }

    @Operation(summary = "Reset Password", description = "Reset user password using a valid token")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password has been reset successfully", null));
    }

}
