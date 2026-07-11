package com.sdms.backend.modules.smartaccess.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.repository.BuildingRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.smartaccess.api.dto.request.GateRequest;
import com.sdms.backend.modules.smartaccess.api.dto.response.GateResponse;
import com.sdms.backend.modules.smartaccess.application.mapper.GateMapper;
import com.sdms.backend.modules.smartaccess.domain.entity.Gate;
import com.sdms.backend.modules.smartaccess.domain.enums.GateType;
import com.sdms.backend.modules.smartaccess.domain.repository.GateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GateService {

    private final GateRepository gateRepository;
    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final GateMapper gateMapper;

    @Transactional(readOnly = true)
    public List<GateResponse> getAllGates() {
        return gateRepository.findAll().stream()
                .map(gateMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GateResponse getGateById(UUID id) {
        return gateRepository.findById(id)
                .map(gateMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Not found"));
    }

    @Transactional
    public GateResponse createGate(GateRequest request) {
        Gate gate = new Gate();
        gateMapper.updateEntity(gate, request);

        if (request.getGateType() == GateType.BUILDING_GATE) {
            if (request.getBuildingId() == null) {
                throw new IllegalArgumentException("Building ID is required for BUILDING_GATE");
            }
            Building building = buildingRepository.findById(request.getBuildingId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Not found"));
            gate.setBuilding(building);
        } else if (request.getGateType() == GateType.ROOM_DOOR) {
            if (request.getRoomId() == null) {
                throw new IllegalArgumentException("Room ID is required for ROOM_DOOR");
            }
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Not found"));
            gate.setRoom(room);
            gate.setBuilding(room.getFloor().getBuilding());
        }

        Gate savedGate = gateRepository.save(gate);
        return gateMapper.toResponse(savedGate);
    }

    @Transactional
    public GateResponse updateGate(UUID id, GateRequest request) {
        Gate gate = gateRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Not found"));

        gateMapper.updateEntity(gate, request);

        if (request.getGateType() == GateType.BUILDING_GATE) {
            if (request.getBuildingId() != null) {
                Building building = buildingRepository.findById(request.getBuildingId())
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Not found"));
                gate.setBuilding(building);
                gate.setRoom(null);
            }
        } else if (request.getGateType() == GateType.ROOM_DOOR) {
            if (request.getRoomId() != null) {
                Room room = roomRepository.findById(request.getRoomId())
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Not found"));
                gate.setRoom(room);
                gate.setBuilding(room.getFloor().getBuilding());
            }
        }

        return gateMapper.toResponse(gateRepository.save(gate));
    }

    @Transactional
    public void deleteGate(UUID id) {
        if (!gateRepository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Not found");
        }
        gateRepository.deleteById(id);
    }
}
