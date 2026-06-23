package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * DTO tổng quan tình trạng toàn bộ KTX.
 */
@Data
@Builder
public class RoomDashboardResponse {
    private Long totalBuildings;
    private Long totalFloors;
    private Long totalRooms;
    private Long totalBeds;

    private Long occupiedBeds;    // Số giường thực tế đang có Assignment OCCUPIED
    private Long availableBeds;   // Số giường trống (Available)
    private Long maintenanceBeds; // Số giường đang bảo trì

    private Double occupancyRate; // Tỷ lệ lấp đầy (0.0 - 100.0)
}