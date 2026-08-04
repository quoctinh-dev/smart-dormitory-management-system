package com.sdms.backend.modules.payment.dto.response;

import com.sdms.backend.modules.payment.enums.UtilityType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class StudentUtilityResponse {
    private UUID utilityUsageId;
    private UUID roomId;
    private UtilityType utilityType;
    private Integer month;
    private Integer year;
    private Integer oldReading;
    private Integer newReading;
    private Integer totalUsage;
    private Boolean isSettled;
    private java.time.LocalDate readingDate;
}
