package com.sdms.backend.modules.room.mapper;

import com.sdms.backend.modules.room.dto.response.BedResponse;
import com.sdms.backend.modules.room.entity.Bed;
import org.springframework.stereotype.Component;

@Component
public class BedMapper {

    public BedResponse toResponse(Bed bed) {
        return BedResponse.builder()
                .bedId(bed.getBedId())
                .bedCode(bed.getBedCode())
                .status(bed.getStatus())
                .note(bed.getNote())
                .roomId(bed.getRoom().getRoomId())
                .roomCode(bed.getRoom().getRoomCode())
                .floorId(bed.getRoom().getFloor().getFloorId())
                .floorNumber(bed.getRoom().getFloor().getFloorNumber())
                .buildingId(bed.getRoom().getFloor().getBuilding().getBuildingId())
                .buildingCode(bed.getRoom().getFloor().getBuilding().getCode())
                .build();
    }
}