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
    @NotNull(message = "Mã kỳ đăng ký là bắt buộc")
    private UUID periodId;

    @NotBlank(message = "Họ và tên là bắt buộc")
    private String fullName;

    @NotBlank(message = "Mã số sinh viên là bắt buộc")
    private String studentCode;

    @NotNull(message = "Ngày sinh là bắt buộc")
    private LocalDate dob;

    @NotNull(message = "Giới tính là bắt buộc")
    private Gender gender;

    @NotBlank(message = "Số CCCD là bắt buộc")
    private String cccd;

    private LocalDate issueDate;
    private String issuePlace;

    @Email(message = "Định dạng email không hợp lệ")
    @NotBlank(message = "Email là bắt buộc")
    private String email;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    private String phone;

    private String permanentAddress;
    private String pob;
    private String ethnic;
    private String religion;
    private String faculty;
    private String cohort;
    private String contactAddress;

    private String fatherName;
    private Integer fatherYob;
    private String fatherJob;
    private String fatherPhone;

    private String motherName;
    private Integer motherYob;
    private String motherJob;
    private String motherPhone;


    private List<PriorityCategory> priorityCategories;
}
