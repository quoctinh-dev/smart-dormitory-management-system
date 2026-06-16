package com.sdms.backend.modules.registration.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateRegistrationPeriodRequest {

    @Schema(description = "Tên đợt đăng ký mới", example = "Cập nhật tên đợt đăng ký")
    @NotBlank(message = "Tên đợt không được để trống")
    private String periodName;

    @Schema(description = "Thời gian bắt đầu mới", example = "2026-06-17T08:00:00")
    @NotNull(message = "Thời gian bắt đầu là bắt buộc")
    private LocalDateTime startDate;

    @Schema(description = "Thời gian kết thúc mới", example = "2026-07-01T23:59:59")
    @NotNull(message = "Thời gian kết thúc là bắt buộc")
    private LocalDateTime endDate;
}