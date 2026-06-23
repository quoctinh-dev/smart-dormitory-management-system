package com.sdms.backend.modules.room.dto.response;

import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.BedStatus;
import com.sdms.backend.modules.room.enums.RoomStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentRoomResponse {
    private UUID assignmentId;
    private String buildingCode;
    private String buildingName;
    private Integer floorNumber;
    private String roomCode;
    private RoomStatus roomStatus;
    private String bedCode;
    private BedStatus bedStatus;
    private AssignmentStatus assignmentStatus;
    private LocalDateTime checkInAt;
    private LocalDateTime expectedCheckOutAt;
}