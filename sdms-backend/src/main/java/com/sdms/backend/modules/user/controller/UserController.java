package com.sdms.backend.modules.user.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.user.dto.response.MeResponse;
import com.sdms.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Tài khoản người dùng")
public class UserController {
    private final UserService userService;

    @Operation(
            summary = "Lấy thông tin người dùng hiện tại",
            description = "Lấy thông tin hồ sơ của người dùng đang đăng nhập"
    )
    @GetMapping("/me")
    public ApiResponse<MeResponse> getMe() {
        return ApiResponse.success("Lấy thông tin tài khoản thành công", userService.getMe());
    }
}
