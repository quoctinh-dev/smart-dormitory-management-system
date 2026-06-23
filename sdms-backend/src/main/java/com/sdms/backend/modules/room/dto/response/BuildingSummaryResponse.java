package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * DTO tóm tắt tình trạng cư trú của từng tòa nhà.
 */
@Data
@Builder
public class BuildingSummaryResponse {
    private String buildingCode;
    private Long totalRooms;
    private Long occupiedBeds;
    private Long availableBeds;
    private Double occupancyRate; // Thêm theo góp ý để Admin dễ theo dõi
}