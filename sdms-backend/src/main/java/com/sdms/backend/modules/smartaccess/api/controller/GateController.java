package com.sdms.backend.modules.smartaccess.api.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.smartaccess.api.dto.request.GateRequest;
import com.sdms.backend.modules.smartaccess.api.dto.response.GateResponse;
import com.sdms.backend.modules.smartaccess.application.service.GateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gates")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Quản lý cổng (Gate Management)", description = "API quản lý các cổng ra vào, thiết bị nhận diện tại Ký túc xá")
public class GateController {

    private final GateService gateService;

    @Operation(summary = "Lấy danh sách cổng", description = "Lấy toàn bộ danh sách cổng ra vào")
    @GetMapping
    public ApiResponse<List<GateResponse>> getAllGates() {
        return ApiResponse.success(
                "Lấy danh sách cổng thành công",
                gateService.getAllGates()
        );
    }

    @Operation(summary = "Lấy thông tin một cổng", description = "Lấy chi tiết một cổng ra vào theo ID")
    @GetMapping("/{id}")
    public ApiResponse<GateResponse> getGateById(@PathVariable UUID id) {
        return ApiResponse.success(
                "Lấy thông tin cổng thành công",
                gateService.getGateById(id)
        );
    }

    @Operation(summary = "Tạo cổng mới", description = "Tạo một thiết bị cổng ra vào mới")
    @PostMapping
    public ApiResponse<GateResponse> createGate(@RequestBody @Valid GateRequest request) {
        return ApiResponse.success(
                "Tạo cổng thành công",
                gateService.createGate(request)
        );
    }

    @Operation(summary = "Cập nhật cổng", description = "Cập nhật thông tin cổng ra vào hiện có")
    @PutMapping("/{id}")
    public ApiResponse<GateResponse> updateGate(@PathVariable UUID id, @RequestBody @Valid GateRequest request) {
        return ApiResponse.success(
                "Cập nhật thông tin cổng thành công",
                gateService.updateGate(id, request)
        );
    }

    @Operation(summary = "Xóa cổng", description = "Xóa cổng ra vào khỏi hệ thống")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteGate(@PathVariable UUID id) {
        gateService.deleteGate(id);
        return ApiResponse.success("Xóa cổng thành công");
    }
}
