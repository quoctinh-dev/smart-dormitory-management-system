package com.sdms.backend.modules.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import com.sdms.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.application.dto.request.CreateApplicationRequest;
import com.sdms.backend.modules.application.dto.response.ApplicationResponse;
import com.sdms.backend.modules.application.dto.response.DocumentResponse;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.enums.VerificationDocumentType;
import com.sdms.backend.modules.application.service.ApplicationService;

import java.util.UUID;

/**
 * REST Controller quản lý các Endpoint đăng ký nội trú KTX cho sinh viên.
 * Cung cấp các API: Tạo đơn nháp, Tải lên tài liệu minh chứng, Nộp đơn chính thức,
 * Nộp lại tài liệu yêu cầu bổ sung, Tra cứu đơn theo MSSV và Quản lý danh sách đơn (Admin/Staff).
 */
@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Application - Đăng ký nội trú")
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * Endpoint khởi tạo hoặc cập nhật đơn đăng ký nháp (Draft).
     *
     * @param request Thông tin đăng ký KTX của sinh viên
     * @return Thông tin đơn nháp vừa được tạo/cập nhật
     */
    @Operation(summary = "Tạo đơn đăng ký nháp (Draft)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Khởi tạo đơn nháp thành công")
    @PostMapping
    public ApiResponse<ApplicationResponse> createDraft(
            @Valid @RequestBody CreateApplicationRequest request
    ) {
        ApplicationResponse response = applicationService.createDraft(request);
        return ApiResponse.success("Khởi tạo đơn nháp thành công", response);
    }

    /**
     * Endpoint tải lên tài liệu minh chứng đính kèm hồ sơ (CCCD, Ảnh thẻ, Giấy ưu tiên...).
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @param type Loại tài liệu minh chứng
     * @param fileUrl Đường dẫn URL file tải lên trên Cloud
     * @return Thông tin bản ghi tài liệu đã tạo
     */
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

    /**
     * Endpoint gửi đơn đăng ký chính thức lên hệ thống (Chuyển trạng thái sang chờ duyệt và kích hoạt xếp phòng).
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @return Thông tin hồ sơ sau khi gửi thành công
     */
    @Operation(summary = "Nộp đơn đăng ký chính thức")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Nộp đơn chính thức thành công")
    @PostMapping("/{applicationId}/submit")
    public ApiResponse<ApplicationResponse> submitApplication(
            @PathVariable UUID applicationId
    ) {
        ApplicationResponse response = applicationService.submitApplication(applicationId);
        return ApiResponse.success("Nộp đơn đăng ký thành công", response);
    }

    /**
     * Endpoint cho phép sinh viên nộp lại tài liệu minh chứng bị Ban quản lý đánh dấu KHÔNG HỢP LỆ.
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @param documentId Mã ID tài liệu cần nộp lại
     * @param newFileUrl Đường dẫn URL file mới
     * @return Thông tin tài liệu đã nộp lại
     */
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

    /**
     * Endpoint lấy chi tiết thông tin đơn đăng ký theo ID.
     *
     * @param applicationId Mã ID hồ sơ đăng ký
     * @return Chi tiết thông tin đơn đăng ký
     */
    @Operation(summary = "Xem chi tiết đơn đăng ký")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy chi tiết đơn thành công")
    @GetMapping("/{applicationId}")
    public ApiResponse<ApplicationResponse> getApplicationDetail(
            @PathVariable UUID applicationId
    ) {
        ApplicationResponse response = applicationService.getApplicationDetail(applicationId);
        return ApiResponse.success("Lấy chi tiết đơn thành công", response);
    }

    /**
     * Endpoint tra cứu trạng thái đơn đăng ký mới nhất theo Mã số sinh viên (Công khai).
     *
     * @param studentCode Mã số sinh viên (MSSV)
     * @return Thông tin đơn đăng ký mới nhất tìm được
     */
    @Operation(summary = "Tra cứu đơn đăng ký theo MSSV")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tra cứu thành công")
    @GetMapping("/status")
    public ApiResponse<ApplicationResponse> getApplicationStatusByStudentCode(
            @RequestParam("studentCode") String studentCode
    ) {
        ApplicationResponse response = applicationService.getApplicationByStudentCode(studentCode);
        return ApiResponse.success("Tra cứu thành công", response);
    }

    /**
     * Endpoint truy vấn danh sách tất cả các đơn đăng ký có phân trang và bộ lọc (Dành cho Quản trị viên / Nhân viên).
     *
     * @param status Lọc theo trạng thái hồ sơ (Tùy chọn)
     * @param search Từ khóa tìm kiếm theo tên, MSSV, CCCD (Tùy chọn)
     * @param pageable Thông tin phân trang
     * @return Danh sách đơn đăng ký đã phân trang
     */
    @Operation(summary = "Lấy danh sách tất cả các đơn đăng ký (Phân trang)")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách đơn thành công")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<PageResponse<ApplicationResponse>> getApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false, defaultValue = "") String search,
            Pageable pageable
    ) {
        PageResponse<ApplicationResponse> response = applicationService.getApplications(status, search, pageable);
        return ApiResponse.success("Lấy danh sách đơn thành công", response);
    }
}