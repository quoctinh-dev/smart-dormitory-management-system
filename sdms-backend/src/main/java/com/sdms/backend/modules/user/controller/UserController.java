package com.sdms.backend.modules.user.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.user.dto.response.MeResponse;
import com.sdms.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User")
public class UserController {
    private final UserService userService;

    @Operation(
            summary = "Get Current User",
            description = "Get profile information of the currently authenticated user"
    )
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MeResponse>> getMe() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User profile retrieved successfully",
                        userService.getMe()
                )
        );
    }
}
