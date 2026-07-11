package com.sdms.backend.modules.smartaccess.application.mapper;

import com.sdms.backend.modules.smartaccess.api.dto.request.GateRequest;
import com.sdms.backend.modules.smartaccess.api.dto.response.GateResponse;
import com.sdms.backend.modules.smartaccess.domain.entity.Gate;
import org.springframework.stereotype.Component;

@Component
public class GateMapper {

    public GateResponse toResponse(Gate gate) {
        return GateResponse.builder()
                .gateId(gate.getGateId())
                .name(gate.getName())
                .gateType(gate.getGateType())
                .buildingId(gate.getBuilding() != null ? gate.getBuilding().getBuildingId() : null)
                .buildingName(gate.getBuilding() != null ? gate.getBuilding().getName() : null)
                .roomId(gate.getRoom() != null ? gate.getRoom().getRoomId() : null)
                .roomCode(gate.getRoom() != null ? gate.getRoom().getRoomCode() : null)
                .macAddress(gate.getMacAddress())
                .active(gate.isActive())
                .build();
    }

    public void updateEntity(Gate gate, GateRequest request) {
        gate.setName(request.getName());
        gate.setGateType(request.getGateType());
        gate.setMacAddress(request.getMacAddress());
        gate.setActive(request.isActive());
    }
}
