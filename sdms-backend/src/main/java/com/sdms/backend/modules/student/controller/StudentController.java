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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Student Profile", description = "APIs for managing student profiles")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService studentService;

    @Operation(summary = "Get current student profile",
            description = "Retrieves the profile details of the authenticated student. Only accessible by STUDENT role.")
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getMyProfile() {
        StudentProfileResponse profile = studentService.getMyProfile();
        return ResponseEntity.ok(new ApiResponse<>(true, "Get profile successful", profile));
    }

    @Operation(summary = "Update current student profile",
            description = "Updates only the fields provided in the request body. Only accessible by STUDENT role.")
    @PatchMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        StudentProfileResponse profile = studentService.updateMyProfile(request);

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Update profile successful",
                profile
        ));
    }
}