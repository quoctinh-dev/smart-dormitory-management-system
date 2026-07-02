package com.sdms.backend.modules.room.mapper;

import com.sdms.backend.modules.room.dto.response.FloorResponse;
import com.sdms.backend.modules.room.entity.Floor;
import org.springframework.stereotype.Component;

@Component
public class FloorMapper {

    public FloorResponse toResponse(Floor floor) {
        return FloorResponse.builder()
                .floorId(floor.getFloorId())
                .floorNumber(floor.getFloorNumber())
                .gender(floor.getGender())
                .buildingId(floor.getBuilding().getBuildingId())
                .buildingCode(floor.getBuilding().getCode())
                .buildingName(floor.getBuilding().getName())
                .build();
    }
}