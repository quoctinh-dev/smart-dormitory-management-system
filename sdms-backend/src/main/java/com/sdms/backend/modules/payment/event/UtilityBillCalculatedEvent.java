package com.sdms.backend.modules.payment.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import com.sdms.backend.modules.payment.entity.UtilityType;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class UtilityBillCalculatedEvent {
    private final UUID roomId;
    private final UtilityType utilityType;
    private final int totalUsage;
    private final int month;
    private final int year;
    private final UUID usageId;
}
