package com.sdms.backend.modules.room.dto.response;

import com.sdms.backend.modules.room.enums.RoomRole;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RoommateResponse {
    private UUID studentId;
    private String studentCode;
    private String fullName;
    private String bedCode;
    private RoomRole roomRole;
}
