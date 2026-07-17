package com.sdms.backend.modules.application.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.application.dto.request.CreateApplicationRequest;
import com.sdms.backend.modules.application.dto.response.ApplicationResponse;
import com.sdms.backend.modules.application.dto.response.DocumentResponse;
import com.sdms.backend.modules.application.enums.VerificationDocumentType;
import com.sdms.backend.modules.application.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Application - Đăng ký nội trú")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Operation(summary = "Tạo đơn đăng ký nháp (Draft)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Khởi tạo đơn nháp thành công")
    @PostMapping
    public ApiResponse<ApplicationResponse> createDraft(
            @Valid @RequestBody CreateApplicationRequest request
    ) {
        ApplicationResponse response = applicationService.createDraft(request);
        return ApiResponse.success("Khởi tạo đơn nháp thành công", response);
    }

    @Operation(summary = "Tải lên tài liệu minh chứng")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tải lên tài liệu thành công")
    @PostMapping("/{applicationId}/documents")
    public ApiResponse<DocumentResponse> uploadDocument(
            @PathVariable UUID applicationId,
            @RequestParam("type") VerificationDocumentType type,
            @RequestParam("fileUrl") String fileUrl
    ) {
        DocumentResponse response = applicationService.uploadDocument(applicationId, type, fileUrl);
        return ApiResponse.success("Tải lên tài liệu thành công", response);
    }

    @Operation(summary = "Nộp đơn đăng ký chính thức")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Nộp đơn chính thức thành công")
    @PostMapping("/{applicationId}/submit")
    public ApiResponse<ApplicationResponse> submitApplication(
            @PathVariable UUID applicationId
    ) {
        ApplicationResponse response = applicationService.submitApplication(applicationId);
        return ApiResponse.success("Nộp đơn đăng ký thành công", response);
    }

    @Operation(summary = "Sinh viên nộp lại tài liệu minh chứng bị sai")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Nộp lại tài liệu thành công")
    @PutMapping("/{applicationId}/documents/{documentId}/resubmit")
    public ApiResponse<DocumentResponse> resubmitDocument(
            @PathVariable UUID applicationId,
            @PathVariable UUID documentId,
            @RequestParam("fileUrl") String newFileUrl
    ) {
        DocumentResponse response = applicationService.resubmitDocument(applicationId, documentId, newFileUrl);
        return ApiResponse.success("Nộp lại tài liệu thành công", response);
    }

    @Operation(summary = "Xem chi tiết đơn đăng ký")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy chi tiết đơn thành công")
    @GetMapping("/{applicationId}")
    public ApiResponse<ApplicationResponse> getApplicationDetail(
            @PathVariable UUID applicationId
    ) {
        ApplicationResponse response = applicationService.getApplicationDetail(applicationId);
        return ApiResponse.success("Lấy chi tiết đơn thành công", response);
    }

    @Operation(summary = "Tra cứu đơn đăng ký theo MSSV")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tra cứu thành công")
    @GetMapping("/status")
    public ApiResponse<ApplicationResponse> getApplicationStatusByStudentCode(
            @RequestParam("studentCode") String studentCode
    ) {
        ApplicationResponse response = applicationService.getApplicationByStudentCode(studentCode);
        return ApiResponse.success("Tra cứu thành công", response);
    }

    @Operation(summary = "Lấy danh sách tất cả các đơn đăng ký (Phân trang)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách đơn thành công")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<PageResponse<ApplicationResponse>> getApplications(
            @RequestParam(required = false) com.sdms.backend.modules.application.enums.ApplicationStatus status,
            @RequestParam(required = false, defaultValue = "") String search,
            Pageable pageable
    ) {
        PageResponse<ApplicationResponse> response = applicationService.getApplications(status, search, pageable);
        return ApiResponse.success("Lấy danh sách đơn thành công", response);
    }
}
