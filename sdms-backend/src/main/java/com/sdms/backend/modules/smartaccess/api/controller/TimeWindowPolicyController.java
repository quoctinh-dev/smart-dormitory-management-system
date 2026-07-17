package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.sdms.backend.modules.smartaccess.domain.entity.TimeWindowPolicy;
import com.sdms.backend.modules.smartaccess.domain.repository.TimeWindowPolicyRepository;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access/time-window-policies")
@RequiredArgsConstructor
@Tag(name = "Chính sách khung giờ (Time Window Policy)", description = "API quản lý các khung giờ ra vào của hệ thống")
public class TimeWindowPolicyController {

    private final TimeWindowPolicyRepository timeWindowPolicyRepository;

    @Operation(summary = "Tạo chính sách mới", description = "Tạo chính sách khung giờ ra vào mới")
    @PostMapping
    @PreAuthorize(SmartAccessPermissions.MANAGE_TIME_WINDOW_POLICY)
    public ApiResponse<TimeWindowPolicy> createPolicy(@RequestBody TimeWindowPolicy policy) {
        return ApiResponse.success("Tạo chính sách thành công", timeWindowPolicyRepository.save(policy));
    }

    @Operation(summary = "Cập nhật trạng thái", description = "Cập nhật trạng thái kích hoạt của chính sách")
    @PutMapping("/{id}/status")
    @PreAuthorize(SmartAccessPermissions.MANAGE_TIME_WINDOW_POLICY)
    public ApiResponse<Void> updateStatus(@PathVariable UUID id, @RequestParam boolean isActive) {
        timeWindowPolicyRepository.findById(id).ifPresent(p -> {
            p.setIsActive(isActive);
            timeWindowPolicyRepository.save(p);
        });
        return ApiResponse.success("Cập nhật trạng thái thành công");
    }
}
