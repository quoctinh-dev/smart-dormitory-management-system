package com.sdms.backend.modules.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomUtilityResponse {
    private UUID roomId;
    private String roomCode;
    private int oldReading;
    private Integer newReading;
    private boolean isSettled;
    private boolean isFirstRecord;
}
