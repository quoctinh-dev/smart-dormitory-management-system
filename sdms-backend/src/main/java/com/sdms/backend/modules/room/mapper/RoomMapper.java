package com.sdms.backend.modules.room.mapper;

import com.sdms.backend.modules.room.dto.response.RoomResponse;
import com.sdms.backend.modules.room.entity.Room;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {

    public RoomResponse toResponse(Room room) {
        return RoomResponse.builder()
                .roomId(room.getRoomId())
                .roomCode(room.getRoomCode())
                .capacity(room.getCapacity())
                .occupiedBeds(room.getOccupiedBeds())
                .availableBeds(room.getCapacity() - room.getOccupiedBeds())
                .status(room.getStatus())
                .floorId(room.getFloor().getFloorId())
                .floorNumber(room.getFloor().getFloorNumber())
                .buildingId(room.getFloor().getBuilding().getBuildingId())
                .buildingCode(room.getFloor().getBuilding().getCode())
                .buildingName(room.getFloor().getBuilding().getName())
                .build();
    }
}