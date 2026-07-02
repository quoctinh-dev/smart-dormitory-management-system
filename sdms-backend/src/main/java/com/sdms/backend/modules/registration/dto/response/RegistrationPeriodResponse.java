package com.sdms.backend.modules.registration.dto.response;

import com.sdms.backend.modules.registration.enums.RegistrationType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationPeriodResponse {

    @Schema(description = "ID của đợt đăng ký")
    private UUID periodId;

    @Schema(description = "Tên đợt đăng ký")
    private String periodName;

    @Schema(description = "Loại đợt đăng ký")
    private RegistrationType registrationType;

    @Schema(description = "Thời gian bắt đầu")
    private LocalDateTime startDate;

    @Schema(description = "Thời gian kết thúc")
    private LocalDateTime endDate;

    @Schema(description = "Trạng thái kích hoạt")
    private Boolean isActive;

    @Schema(description = "Thời gian bắt đầu lưu trú")
    private LocalDateTime stayStartDate;

    @Schema(description = "Thời gian kết thúc lưu trú")
    private LocalDateTime stayEndDate;
}