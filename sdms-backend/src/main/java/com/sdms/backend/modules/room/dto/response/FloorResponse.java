package com.sdms.backend.modules.room.dto.response;

import com.sdms.backend.modules.room.enums.OccupancyPolicy;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * DTO trả về thông tin chi tiết của tầng.
 * * DESIGN NOTE: Bao gồm cả buildingId, buildingCode và buildingName để phía Client
 * thuận tiện hiển thị đầy đủ thông tin tòa nhà trên giao diện.
 */
@Getter
@Setter
@Builder
public class FloorResponse {

    private UUID floorId;

    private Integer floorNumber;

    private OccupancyPolicy occupancyPolicy;

    private UUID buildingId;

    private String buildingCode;

    private String buildingName;
}