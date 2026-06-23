package com.sdms.backend.modules.room.mapper;

import com.sdms.backend.modules.room.dto.request.CreateBuildingRequest;
import com.sdms.backend.modules.room.dto.response.BuildingResponse;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.enums.BuildingStatus;
import org.springframework.stereotype.Component;

@Component
public class BuildingMapper {

    public Building toEntity(CreateBuildingRequest request) {
        Building building = new Building();
        building.setCode(request.getCode().trim().toUpperCase());
        building.setName(request.getName());
        building.setDescription(request.getDescription());
        building.setStatus(BuildingStatus.ACTIVE); // Mặc định khi tạo mới
        return building;
    }

    public BuildingResponse toResponse(Building building) {
        return BuildingResponse.builder()
                .buildingId(building.getBuildingId())
                .code(building.getCode())
                .name(building.getName())
                .description(building.getDescription())
                .status(building.getStatus())
                .createdAt(building.getCreatedAt())
                .build();
    }
}