package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.student.dto.request.UpdateProfileRequest;
import com.sdms.backend.modules.student.dto.response.StudentProfileResponse;
import com.sdms.backend.modules.student.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @Operation(summary = "Gán thẻ RFID cho sinh viên", description = "Admin gán một thẻ RFID cho một sinh viên cụ thể.")
    @PostMapping("/{studentId}/rfid")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ApiResponse<Void> assignRfid(
            @PathVariable java.util.UUID studentId,
            @RequestParam("rfidCode") String rfidCode) {
        studentService.assignRfidCode(studentId, rfidCode);
        return ApiResponse.success("Gán thẻ RFID thành công");
    }
}