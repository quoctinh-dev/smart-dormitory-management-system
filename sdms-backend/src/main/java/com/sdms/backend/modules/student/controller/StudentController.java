package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.student.dto.request.AdminUpdateStudentProfileRequest;
import com.sdms.backend.modules.student.dto.request.UpdateProfileRequest;
import com.sdms.backend.modules.student.dto.response.StudentProfileResponse;
import com.sdms.backend.modules.student.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.sdms.backend.modules.student.enums.StudentStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Hồ sơ sinh viên", description = "API quản lý hồ sơ cá nhân của sinh viên")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService studentService;

    @Operation(summary = "Lấy hồ sơ sinh viên hiện tại",
            description = "Lấy chi tiết hồ sơ của sinh viên đang đăng nhập. Chỉ dành cho vai trò STUDENT.")
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<StudentProfileResponse> getMyProfile() {
        StudentProfileResponse profile = studentService.getMyProfile();
        return ApiResponse.success("Lấy hồ sơ thành công", profile);
    }

    @Operation(summary = "Cập nhật hồ sơ sinh viên hiện tại",
            description = "Chỉ cập nhật các trường được cung cấp trong body request. Chỉ dành cho vai trò STUDENT.")
    @PatchMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<StudentProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        StudentProfileResponse profile = studentService.updateMyProfile(request);

        return ApiResponse.success("Cập nhật hồ sơ thành công", profile);
    }

    @Operation(summary = "Lấy danh sách tất cả sinh viên", description = "Tìm kiếm và lọc sinh viên dành cho Admin/Staff")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Page<StudentProfileResponse>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) StudentStatus status,
            Pageable pageable) {
        return ApiResponse.success("Lấy danh sách sinh viên thành công", studentService.getAllStudents(search, status, pageable));
    }

    @Operation(summary = "Lấy hồ sơ sinh viên bằng ID", description = "Dành cho Admin/Staff xem hồ sơ sinh viên khi duyệt đơn")
    @GetMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<StudentProfileResponse> getStudentProfileById(@PathVariable java.util.UUID id) {
        return ApiResponse.success("Lấy hồ sơ thành công", studentService.getStudentProfileById(id));
    }

    @Operation(summary = "Cập nhật hồ sơ sinh viên", description = "Dành cho Admin/Staff cập nhật thông tin sinh viên")
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<StudentProfileResponse> updateStudentProfile(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody AdminUpdateStudentProfileRequest request) {
        return ApiResponse.success("Cập nhật hồ sơ thành công", studentService.updateStudentProfile(id, request));
    }

    @Operation(summary = "Gán thẻ RFID cho sinh viên", description = "Admin gán một thẻ RFID cho một sinh viên cụ thể.")
    @PostMapping("/{studentId}/rfid")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> assignRfid(
            @PathVariable java.util.UUID studentId,
            @RequestParam("rfidCode") String rfidCode) {
        studentService.assignRfidCode(studentId, rfidCode);
        return ApiResponse.success("Gán thẻ RFID thành công");
    }
}