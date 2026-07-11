package com.sdms.backend.modules.smartaccess.api.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.smartaccess.api.dto.request.GateRequest;
import com.sdms.backend.modules.smartaccess.api.dto.response.GateResponse;
import com.sdms.backend.modules.smartaccess.application.service.GateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gates")
@RequiredArgsConstructor
public class GateController {

    private final GateService gateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GateResponse>>> getAllGates() {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách cổng thành công",
                gateService.getAllGates()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GateResponse>> getGateById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông tin cổng thành công",
                gateService.getGateById(id)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GateResponse>> createGate(@RequestBody @Valid GateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Tạo cổng thành công",
                gateService.createGate(request)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GateResponse>> updateGate(@PathVariable UUID id, @RequestBody @Valid GateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật thông tin cổng thành công",
                gateService.updateGate(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGate(@PathVariable UUID id) {
        gateService.deleteGate(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa cổng thành công", null));
    }
}
