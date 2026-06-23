package com.sdms.backend.modules.room.dto.request;

import com.sdms.backend.modules.room.enums.OccupancyPolicy;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * DTO dùng để tạo mới một tầng cho tòa nhà.
 * * BUSINESS RULE:
 * - buildingId là bắt buộc để xác định tầng thuộc tòa nhà nào.
 * - floorNumber và occupancyPolicy giúp định hình cơ sở hạ tầng KTX.
 */
@Getter
@Setter
public class CreateFloorRequest {

    @NotNull(message = "Building ID is required")
    private UUID buildingId;

    @NotNull(message = "Floor number is required")
    private Integer floorNumber;

    @NotNull(message = "Occupancy policy is required")
    private OccupancyPolicy occupancyPolicy;
}