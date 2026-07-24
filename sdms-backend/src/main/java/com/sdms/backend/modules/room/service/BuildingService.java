package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.room.dto.request.CreateBuildingRequest;
import com.sdms.backend.modules.room.dto.request.UpdateBuildingRequest;
import com.sdms.backend.modules.room.dto.response.BuildingResponse;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.enums.BuildingStatus;
import com.sdms.backend.modules.room.mapper.BuildingMapper;
import com.sdms.backend.modules.room.repository.BuildingRepository;
import com.sdms.backend.modules.room.repository.FloorRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
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
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final BuildingMapper buildingMapper;

    // ROOM-04 INTEGRATION: Thay thế việc trực tiếp gọi AssignmentRepository bằng BuildingValidator lớp chuyên trách
    private final BuildingValidator buildingValidator;

    public BuildingResponse createBuilding(CreateBuildingRequest request) {
        String normalizedCode = request.getCode().trim().toUpperCase();
        if (buildingRepository.existsByCode(normalizedCode)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Mã tòa nhà đã tồn tại");
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

    @Transactional
    public void deleteBuilding(UUID buildingId) {
        Building building = findById(buildingId);
        
        // 1. Validate if any bed in any room on any floor in this building has history
        boolean hasHistory = assignmentRepository.existsByBed_Room_Floor_Building_BuildingId(buildingId);

        if (hasHistory) {
            throw new AppException(ErrorCode.DATA_CONFLICT, "Không thể xóa tòa nhà: Đã có sinh viên từng lưu trú tại tòa nhà này. Vui lòng cập nhật trạng thái tòa nhà thành Dừng hoạt động thay vì xóa.");
        }

        // 2. Tòa nhà trống, được phép xóa cứng
        List<Floor> floors = floorRepository.findByBuilding_BuildingId(buildingId);
        for (Floor floor : floors) {
            List<Room> rooms = roomRepository.findByFloor_FloorId(floor.getFloorId());
            for (Room room : rooms) {
                bedRepository.deleteAll(bedRepository.findByRoom_RoomId(room.getRoomId()));
            }
            roomRepository.deleteAll(rooms);
        }
        floorRepository.deleteAll(floors);
        buildingRepository.delete(building);
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private Building findById(UUID id) {
        return buildingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy tòa nhà"));
    }
}