package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.room.dto.request.CreateFloorRequest;
import com.sdms.backend.modules.room.dto.request.UpdateFloorRequest;
import com.sdms.backend.modules.room.dto.response.FloorResponse;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.mapper.FloorMapper;
import com.sdms.backend.modules.room.repository.BuildingRepository;
import com.sdms.backend.modules.room.repository.FloorRepository;
import com.sdms.backend.modules.room.validator.FloorValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FloorService {

    private final FloorRepository floorRepository;
    private final BuildingRepository buildingRepository;
    private final FloorMapper floorMapper;
    private final FloorValidator floorValidator;

    public FloorResponse createFloor(CreateFloorRequest request) {
        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new AppException("Building not found", HttpStatus.NOT_FOUND));

        if (floorRepository.existsByBuilding_BuildingIdAndFloorNumber(request.getBuildingId(), request.getFloorNumber())) {
            throw new AppException("Floor number already exists in building", HttpStatus.BAD_REQUEST);
        }

        Floor floor = new Floor();
        floor.setBuilding(building);
        floor.setFloorNumber(request.getFloorNumber());
        floor.setOccupancyPolicy(request.getOccupancyPolicy());

        return floorMapper.toResponse(floorRepository.save(floor));
    }

    public FloorResponse updateFloor(UUID floorId, UpdateFloorRequest request) {
        Floor floor = findById(floorId);

        // Kiểm tra xem chính sách có thay đổi không
        if (request.getOccupancyPolicy() != floor.getOccupancyPolicy()) {
            floorValidator.validatePolicyChange(floorId);
        }

        floor.setOccupancyPolicy(request.getOccupancyPolicy());
        return floorMapper.toResponse(floorRepository.save(floor));
    }

    @Transactional(readOnly = true)
    public FloorResponse getFloor(UUID floorId) {
        return floorMapper.toResponse(findById(floorId));
    }

    @Transactional(readOnly = true)
    public List<FloorResponse> getFloorsByBuilding(UUID buildingId) {
        return floorRepository.findByBuilding_BuildingId(buildingId).stream()
                .map(floorMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Floor findById(UUID id) {
        return floorRepository.findById(id)
                .orElseThrow(() -> new AppException("Floor not found", HttpStatus.NOT_FOUND));
    }
}