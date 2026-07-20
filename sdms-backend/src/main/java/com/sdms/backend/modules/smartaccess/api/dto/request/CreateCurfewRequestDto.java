package com.sdms.backend.modules.smartaccess.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateCurfewRequestDto {
    @NotBlank(message = "Lý do không được để trống")
    private String reason;

    private String requestType; // LATE_RETURN or ABSENCE

    private LocalDateTime startDate; // optional

    @NotNull(message = "Thời gian dự kiến về (hoặc ngày trở lại) không được để trống")
    private LocalDateTime expectedArrivalTime;
}
