package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * DTO thống kê trạng thái chi tiết của tất cả các giường.
 */
@Data
@Builder
public class BedStatisticsResponse {
    private Long availableBeds;
    private Long reservedBeds;
    private Long occupiedBeds;
    private Long maintenanceBeds;
}