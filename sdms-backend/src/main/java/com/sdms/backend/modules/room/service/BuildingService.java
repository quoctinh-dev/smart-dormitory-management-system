package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.room.dto.request.CreateBuildingRequest;
import com.sdms.backend.modules.room.dto.request.UpdateBuildingRequest;
import com.sdms.backend.modules.room.dto.response.BuildingResponse;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.enums.BuildingStatus;
import com.sdms.backend.modules.room.mapper.BuildingMapper;
import com.sdms.backend.modules.room.repository.BuildingRepository;
import com.sdms.backend.modules.room.validator.BuildingValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service xử lý các nghiệp vụ quản lý Tòa nhà (Building).
 * Tích hợp chặt chẽ với BuildingValidator (ROOM-04) để bảo vệ toàn vẹn dữ liệu hạ tầng cư trú.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final BuildingMapper buildingMapper;

    // ROOM-04 INTEGRATION: Thay thế việc trực tiếp gọi AssignmentRepository bằng BuildingValidator lớp chuyên trách
    private final BuildingValidator buildingValidator;

    public BuildingResponse createBuilding(CreateBuildingRequest request) {
        String normalizedCode = request.getCode().trim().toUpperCase();
        if (buildingRepository.existsByCode(normalizedCode)) {
            throw new AppException("Building code already exists", HttpStatus.BAD_REQUEST);
        }

        Building building = buildingMapper.toEntity(request);
        return buildingMapper.toResponse(buildingRepository.save(building));
    }

    public BuildingResponse updateBuilding(UUID id, UpdateBuildingRequest request) {
        Building building = findById(id);

        // ROOM-04: Điều hướng Validation khi Admin thay đổi trạng thái hạ tầng tòa nhà sang CLOSED hoặc MAINTENANCE
        if (request.getStatus() != building.getStatus()) {
            if (request.getStatus() == BuildingStatus.CLOSED) {
                buildingValidator.validateCanClose(id);
            } else if (request.getStatus() == BuildingStatus.MAINTENANCE) {
                buildingValidator.validateCanMaintenance(id);
            }
        }

        building.setName(request.getName());
        building.setDescription(request.getDescription());
        building.setStatus(request.getStatus());

        if (request.getGender() != null) {
            building.setGender(request.getGender());
        }

        return buildingMapper.toResponse(buildingRepository.save(building));
    }

    @Transactional(readOnly = true)
    public BuildingResponse getBuilding(UUID id) {
        return buildingMapper.toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public List<BuildingResponse> getBuildings() {
        return buildingRepository.findAll().stream()
                .map(buildingMapper::toResponse)
                .collect(Collectors.toList());
    }

    public void changeStatus(UUID id, BuildingStatus status) {
        Building building = findById(id);

        // ROOM-04: Tách biệt rạch ròi 2 hành vi thay đổi trạng thái nguy hiểm phục vụ AI/IoT Audit
        if (status == BuildingStatus.CLOSED) {
            buildingValidator.validateCanClose(id);
        } else if (status == BuildingStatus.MAINTENANCE) {
            buildingValidator.validateCanMaintenance(id);
        }

        building.setStatus(status);
        buildingRepository.save(building);
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private Building findById(UUID id) {
        return buildingRepository.findById(id)
                .orElseThrow(() -> new AppException("Building not found", HttpStatus.NOT_FOUND));
    }
}