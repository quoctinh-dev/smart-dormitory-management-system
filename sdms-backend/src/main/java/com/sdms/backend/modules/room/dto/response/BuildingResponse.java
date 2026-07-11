package com.sdms.backend.modules.room.dto.response;

import com.sdms.backend.modules.room.enums.BuildingStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO trả về thông tin tòa nhà cho Client.
 * * DESIGN NOTE: Sử dụng @Builder để dễ dàng khởi tạo từ Entity trong Mapper.
 */
@Getter
@Setter
@Builder
public class BuildingResponse {

    private UUID buildingId;

    private String code;

    private String name;

    private String description;

    private BuildingStatus status;

    private com.sdms.backend.modules.room.enums.BuildingGender gender;

    private LocalDateTime createdAt;
}