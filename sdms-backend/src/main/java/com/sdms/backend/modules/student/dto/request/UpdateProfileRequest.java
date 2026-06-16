package com.sdms.backend.modules.student.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    @Email(message = "Invalid email format")
    private String email;
    private String phone;
    private String fatherName;
    private String fatherPhone;
    private String motherName;
    private String motherPhone;
    private String emergencyContact;
    private String permanentAddress;
    private String avatarUrl;
}