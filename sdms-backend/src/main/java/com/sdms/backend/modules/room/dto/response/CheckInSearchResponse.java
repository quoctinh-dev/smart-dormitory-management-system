package com.sdms.backend.modules.room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInSearchResponse {
    private UUID assignmentId;
    private String studentName;
    private String studentCode;
    private String cccd;
    private String gender;
    private String portraitUrl;
    private String buildingName;
    private String floorName;
    private String roomName;
    private String bedName;
}