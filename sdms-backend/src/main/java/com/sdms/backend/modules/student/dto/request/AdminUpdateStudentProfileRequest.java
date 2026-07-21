package com.sdms.backend.modules.student.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateStudentProfileRequest {
    // Admin có thể cập nhật toàn bộ thông tin
    private String fullName;
    private String cccd;
    private String email;
    
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    private String faculty;
    private String academicYear;

    private String fatherName;
    private String fatherPhone;
    private String motherName;
    private String motherPhone;
    
    private String contactAddress;
    private String permanentAddress;
    
    private String avatarUrl;
}
