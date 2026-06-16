package com.sdms.backend.modules.registration.dto.request;

import com.sdms.backend.modules.registration.enums.RegistrationType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
public class CreateRegistrationPeriodRequest {
    @Schema(description = "Tên đợt", example = "Đợt Đăng Ký Tân Sinh Viên 2026")
    @NotBlank(message = "Tên đợt không được để trống")
    private String periodName;

    @NotNull(message = "Loại đợt bắt buộc")
    private RegistrationType registrationType;

    @NotNull private LocalDateTime startDate;
    @NotNull private LocalDateTime endDate;
}