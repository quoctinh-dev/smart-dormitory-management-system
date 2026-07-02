package com.sdms.backend.modules.smartaccess.application.port.out;

import lombok.Builder;
import lombok.Getter;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;

import java.util.UUID;

@Getter
@Builder
public class StudentEligibilitySnapshot {
    private UUID studentId;
    private String status; // ACTIVE, LOCKED, EXPELLED, CHECKED_OUT
    private ResidentType residentType;
    private UUID buildingId;
}
