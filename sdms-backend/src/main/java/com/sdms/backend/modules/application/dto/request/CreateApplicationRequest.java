package com.sdms.backend.modules.application.dto.request;

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.application.enums.PriorityCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreateApplicationRequest {
    @NotNull(message = "Registration Period ID is required")
    private UUID periodId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "DOB is required")
    private LocalDate dob;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "CCCD is required")
    private String cccd;

    private LocalDate issueDate;
    private String issuePlace;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String permanentAddress;
    private String pob;
    private String ethnic;
    private String religion;
    private String faculty;
    private String contactAddress;

    private String fatherName;
    private Integer fatherYob;
    private String fatherJob;
    private String fatherPhone;

    private String motherName;
    private Integer motherYob;
    private String motherJob;
    private String motherPhone;

    private String familyContact;
    private String emergencyContact;

    private List<PriorityCategory> priorityCategories;
}
