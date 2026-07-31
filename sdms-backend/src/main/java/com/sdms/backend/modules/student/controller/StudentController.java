package com.sdms.backend.modules.student.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.student.dto.request.AdminUpdateStudentProfileRequest;
import com.sdms.backend.modules.student.dto.request.UpdateProfileRequest;
import com.sdms.backend.modules.student.dto.response.StudentProfileResponse;
import com.sdms.backend.modules.student.enums.StudentStatus;
import com.sdms.backend.modules.student.service.StudentService;

import java.util.UUID;

/**
 * REST Controller quản lý Hồ sơ sinh viên.
 * <p>
 * Cung cấp các Endpoint cho phép Sinh viên tra cứu/cập nhật hồ sơ cá nhân,
 * và cho phép Ban quản lý (Admin/Staff) tra cứu, cập nhật thông tin và gán thẻ RFID kiểm soát ra vào.
 */
@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Hồ sơ sinh viên", description = "API quản lý hồ sơ cá nhân của sinh viên")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService studentService;

    /**
     * Endpoint lấy chi tiết hồ sơ cá nhân của sinh viên đang đăng nhập.
     *
     * @return Thông tin hồ sơ sinh viên
     */
    @Operation(summary = "Lấy hồ sơ sinh viên hiện tại",
            description = "Lấy chi tiết hồ sơ của sinh viên đang đăng nhập. Chỉ dành cho vai trò STUDENT.")
    @ApiResponse(responseCode = "200", description = "Lấy hồ sơ thành công")
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public com.sdms.backend.common.response.ApiResponse<StudentProfileResponse> getMyProfile() {
        StudentProfileResponse profile = studentService.getMyProfile();
        return com.sdms.backend.common.response.ApiResponse.success("Lấy hồ sơ thành công", profile);
    }

    /**
     * Endpoint cập nhật thông tin hồ sơ cá nhân của sinh viên đang đăng nhập.
     *
     * @param request Dữ liệu thông tin cập nhật
     * @return Thông tin hồ sơ sau khi cập nhật
     */
    @Operation(summary = "Cập nhật hồ sơ sinh viên hiện tại",
            description = "Chỉ cập nhật các trường được cung cấp trong body request. Chỉ dành cho vai trò STUDENT.")
    @ApiResponse(responseCode = "200", description = "Cập nhật hồ sơ thành công")
    @PatchMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public com.sdms.backend.common.response.ApiResponse<StudentProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        StudentProfileResponse profile = studentService.updateMyProfile(request);

        return com.sdms.backend.common.response.ApiResponse.success("Cập nhật hồ sơ thành công", profile);
    }

    /**
     * Endpoint lấy danh sách tất cả sinh viên có phân trang và bộ lọc (Dành cho Admin/Staff).
     *
     * @param search Từ khóa tìm kiếm (MSSV, Họ tên, Email, CCCD...)
     * @param status Lọc theo trạng thái sinh viên
     * @param pageable Thông tin phân trang
     * @return Danh sách sinh viên đã phân trang
     */
    @Operation(summary = "Lấy danh sách tất cả sinh viên", description = "Tìm kiếm và lọc sinh viên dành cho Admin/Staff")
    @ApiResponse(responseCode = "200", description = "Lấy danh sách sinh viên thành công")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public com.sdms.backend.common.response.ApiResponse<PageResponse<StudentProfileResponse>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) StudentStatus status,
            Pageable pageable) {
        return com.sdms.backend.common.response.ApiResponse.success(
                "Lấy danh sách sinh viên thành công",
                PageResponse.of(studentService.getAllStudents(search, status, pageable))
        );
    }

    /**
     * Endpoint lấy thông tin hồ sơ chi tiết của sinh viên theo ID (Dành cho Admin/Staff).
     *
     * @param id Mã ID sinh viên
     * @return Chi tiết hồ sơ sinh viên
     */
    @Operation(summary = "Lấy hồ sơ sinh viên bằng ID", description = "Dành cho Admin/Staff xem hồ sơ sinh viên khi duyệt đơn")
    @ApiResponse(responseCode = "200", description = "Lấy hồ sơ thành công")
    @GetMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public com.sdms.backend.common.response.ApiResponse<StudentProfileResponse> getStudentProfileById(@PathVariable UUID id) {
        return com.sdms.backend.common.response.ApiResponse.success("Lấy hồ sơ thành công", studentService.getStudentProfileById(id));
    }

    /**
     * Endpoint cho phép Admin chỉnh sửa trực tiếp hồ sơ sinh viên.
     *
     * @param id Mã ID sinh viên
     * @param request Thông tin hồ sơ cập nhật từ Admin
     * @return Thông tin hồ sơ sau khi cập nhật
     */
    @Operation(summary = "Cập nhật hồ sơ sinh viên", description = "Dành cho Admin/Staff cập nhật thông tin sinh viên")
    @ApiResponse(responseCode = "200", description = "Cập nhật hồ sơ thành công")
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public com.sdms.backend.common.response.ApiResponse<StudentProfileResponse> updateStudentProfile(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateStudentProfileRequest request) {
        return com.sdms.backend.common.response.ApiResponse.success("Cập nhật hồ sơ thành công", studentService.updateStudentProfile(id, request));
    }

    /**
     * Endpoint gán mã thẻ RFID cho sinh viên để phục vụ ra vào KTX qua cổng kiểm soát.
     *
     * @param studentId Mã ID sinh viên
     * @param rfidCode Mã định danh thẻ RFID
     * @return Phản hồi gán thẻ thành công
     */
    @Operation(summary = "Gán thẻ RFID cho sinh viên", description = "Admin gán một thẻ RFID cho một sinh viên cụ thể.")
    @ApiResponse(responseCode = "200", description = "Gán thẻ RFID thành công")
    @PostMapping("/{studentId}/rfid")
    @PreAuthorize("hasRole('ADMIN')")
    public com.sdms.backend.common.response.ApiResponse<Void> assignRfid(
            @PathVariable UUID studentId,
            @RequestParam("rfidCode") String rfidCode) {
        studentService.assignRfidCode(studentId, rfidCode);
        return com.sdms.backend.common.response.ApiResponse.success("Gán thẻ RFID thành công");
    }
}