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
    @NotNull(message = "Room ID is required")
    private UUID roomId;

    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private int month;

    @Min(value = 2020, message = "Year must be valid")
    private int year;

    @Min(value = 0, message = "New reading must be non-negative")
    private int newReading;

    // Chỉ dùng cho lần đầu tiên chốt số của phòng
    @Min(value = 0, message = "Old reading must be non-negative")
    private Integer oldReading;
}
