package com.sdms.backend.modules.registration.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.registration.dto.response.EligibilityImportResponse;
import com.sdms.backend.modules.registration.dto.response.EligibilityResponse;
import com.sdms.backend.modules.registration.service.RegistrationEligibilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/registration-periods")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Quản lý Danh sách Hợp lệ (Eligibility)")
public class RegistrationEligibilityController {

    private final RegistrationEligibilityService service;

    @Operation(summary = "Import danh sách sinh viên đủ điều kiện từ file Excel")
    @PostMapping(
            value = "/{periodId}/eligibilities/import",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ApiResponse<EligibilityImportResponse> importEligibility(
            @PathVariable UUID periodId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ApiResponse.success("Import thành công", service.importEligibility(periodId, file));
    }

    @Operation(summary = "Xem danh sách sinh viên đủ điều kiện của một đợt (Có phân trang & Tìm kiếm)")
    @GetMapping("/{periodId}/eligibilities")
    public ApiResponse<PageResponse<EligibilityResponse>> getEligibilities(
            @PathVariable UUID periodId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<EligibilityResponse> pageData = service.getEligibilities(periodId, keyword, pageable);
        return ApiResponse.success("Lấy danh sách thành công", PageResponse.of(pageData));
    }

    @Operation(summary = "Xóa một sinh viên khỏi danh sách đủ điều kiện")
    @DeleteMapping("/{periodId}/eligibilities/{eligibilityId}")
    public ApiResponse<Void> deleteEligibility(
            @PathVariable UUID periodId,
            @PathVariable UUID eligibilityId
    ) {
        service.deleteEligibility(periodId, eligibilityId);
        return ApiResponse.success("Xóa thành công");
    }

    @Operation(summary = "Xóa toàn bộ sinh viên khỏi danh sách đủ điều kiện")
    @DeleteMapping("/{periodId}/eligibilities")
    public ApiResponse<Void> deleteAllEligibilities(
            @PathVariable UUID periodId
    ) {
        service.deleteAllEligibilities(periodId);
        return ApiResponse.success("Xóa toàn bộ thành công");
    }
}