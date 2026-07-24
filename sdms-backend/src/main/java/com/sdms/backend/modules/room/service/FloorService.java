package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
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

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.room.enums.BuildingGender;

import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.AssignmentStatus;

@Service
@RequiredArgsConstructor
@Transactional
public class FloorService {

    private final FloorRepository floorRepository;
    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final FloorMapper floorMapper;
    private final FloorValidator floorValidator;

    public FloorResponse createFloor(CreateFloorRequest request) {
        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tòa nhà"));

        if (floorRepository.existsByBuilding_BuildingIdAndFloorNumber(request.getBuildingId(), request.getFloorNumber())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Số tầng đã tồn tại trong tòa nhà");
        }

        Gender targetGender = request.getGender();
        if (building.getGender() != BuildingGender.MIXED) {
            Gender expectedGender = Gender.valueOf(building.getGender().name());
            if (targetGender != null && targetGender != expectedGender) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Giới tính của tòa nhà giới hạn giới tính tầng là " + expectedGender);
            }
            targetGender = expectedGender;
        }

        if (targetGender == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Giới tính của tầng không được để trống");
        }

        Floor floor = new Floor();
        floor.setBuilding(building);
        floor.setFloorNumber(request.getFloorNumber());
        floor.setGender(targetGender);

        return floorMapper.toResponse(floorRepository.save(floor));
    }

    public FloorResponse updateFloor(UUID floorId, UpdateFloorRequest request) {
        Floor floor = findById(floorId);
        Building building = floor.getBuilding();

        Gender targetGender = request.getGender();
        if (building.getGender() != BuildingGender.MIXED) {
            Gender expectedGender = Gender.valueOf(building.getGender().name());
            if (targetGender != null && targetGender != expectedGender) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Không thể đổi giới tính tầng vì tòa nhà chỉ dành cho " + expectedGender);
            }
            targetGender = expectedGender;
        }

        if (targetGender == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Giới tính của tầng không được để trống");
        }

        // Kiểm tra xem chính sách có thay đổi không
        if (targetGender != floor.getGender()) {
            floorValidator.validatePolicyChange(floorId);
        }

        floor.setGender(targetGender);
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

    @Transactional
    public void deleteFloor(UUID floorId) {
        Floor floor = findById(floorId);
        
        // 1. Validate if any bed in any room on this floor has history
        boolean hasHistory = assignmentRepository.existsByBed_Room_Floor_FloorId(floorId);

        if (hasHistory) {
            throw new AppException(ErrorCode.DATA_CONFLICT, "Không thể xóa tầng: Đã có phòng trên tầng này có lịch sử sinh viên lưu trú. Vui lòng cập nhật trạng thái phòng thay vì xóa.");
        }

        // 2. Tầng trống, được phép xóa cứng
        List<Room> rooms = roomRepository.findByFloor_FloorId(floorId);
        for (Room room : rooms) {
            bedRepository.deleteAll(bedRepository.findByRoom_RoomId(room.getRoomId()));
        }
        roomRepository.deleteAll(rooms);
        floorRepository.delete(floor);
    }

    private Floor findById(UUID id) {
        return floorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy tầng"));
    }
}