package com.sdms.backend.modules.utility.event;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ElectricityBillCalculatedEvent {
    private UUID roomId;
    private Integer totalKwh;
    private Integer month;
    private Integer year;
    private UUID usageId;
}
