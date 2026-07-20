package com.sdms.backend.modules.student.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAcademicInfoRequest {
    @NotBlank(message = "Tên Khoa không được để trống")
    private String faculty;

    @NotBlank(message = "Khóa/Niên khóa không được để trống")
    private String academicYear;
}
