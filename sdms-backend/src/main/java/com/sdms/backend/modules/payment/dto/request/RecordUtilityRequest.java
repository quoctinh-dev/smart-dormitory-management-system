package com.sdms.backend.modules.payment.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordUtilityRequest {
    @NotNull(message = "ID phòng là bắt buộc")
    private UUID roomId;

    @Min(value = 1, message = "Tháng phải từ 1 đến 12")
    @Max(value = 12, message = "Tháng phải từ 1 đến 12")
    private int month;

    @Min(value = 2020, message = "Năm không hợp lệ")
    private int year;

    @Min(value = 0, message = "Chỉ số mới không được âm")
    private int newReading;

    // Chỉ dùng cho lần đầu tiên chốt số của phòng
    @Min(value = 0, message = "Chỉ số cũ không được âm")
    private Integer oldReading;
}
