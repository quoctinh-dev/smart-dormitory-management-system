package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * DTO tình trạng lấp đầy của một phòng cụ thể.
 */
@Data
@Builder
public class RoomOccupancyResponse {
    private String roomCode;
    private Integer capacity;
    private Integer occupiedBeds;
    private Integer availableBeds;
    private Double occupancyRate;
}