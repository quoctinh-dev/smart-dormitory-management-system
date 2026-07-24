package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.sdms.backend.modules.smartaccess.domain.entity.CurfewPolicy;
import com.sdms.backend.modules.smartaccess.domain.repository.CurfewPolicyRepository;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access/curfew-policies")
@RequiredArgsConstructor
@Tag(name = "Chính sách giờ giới nghiêm (Curfew Policy)", description = "API quản lý chính sách giờ giới nghiêm")
public class CurfewPolicyController {

    private final CurfewPolicyRepository curfewPolicyRepository;

    @Operation(summary = "Lấy danh sách", description = "Lấy tất cả chính sách")
    @GetMapping
    @PreAuthorize(SmartAccessPermissions.MANAGE_CURFEW_POLICY)
    public ApiResponse<List<CurfewPolicy>> getAllPolicies() {
        return ApiResponse.success("Thành công", curfewPolicyRepository.findAll());
    }

    @Operation(summary = "Tạo chính sách mới", description = "Tạo chính sách giờ giới nghiêm mới")
    @PostMapping
    @PreAuthorize(SmartAccessPermissions.MANAGE_CURFEW_POLICY)
    public ApiResponse<CurfewPolicy> createPolicy(@RequestBody CurfewPolicy policy) {
        if (policy.getIsActive() == null) {
            policy.setIsActive(true);
        }
        return ApiResponse.success("Tạo chính sách thành công", curfewPolicyRepository.save(policy));
    }

    @Operation(summary = "Cập nhật trạng thái", description = "Cập nhật trạng thái kích hoạt của chính sách")
    @PutMapping("/{id}/status")
    @PreAuthorize(SmartAccessPermissions.MANAGE_CURFEW_POLICY)
    public ApiResponse<Void> updateStatus(@PathVariable UUID id, @RequestParam boolean isActive) {
        curfewPolicyRepository.findById(id).ifPresent(p -> {
            p.setIsActive(isActive);
            curfewPolicyRepository.save(p);
        });
        return ApiResponse.success("Cập nhật trạng thái thành công");
    }

    @Operation(summary = "Xóa chính sách", description = "Xóa chính sách")
    @DeleteMapping("/{id}")
    @PreAuthorize(SmartAccessPermissions.MANAGE_CURFEW_POLICY)
    public ApiResponse<Void> deletePolicy(@PathVariable UUID id) {
        curfewPolicyRepository.deleteById(id);
        return ApiResponse.success("Xóa thành công");
    }
}
