package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.room.dto.request.CreateRoomRequest;
import com.sdms.backend.modules.room.dto.request.UpdateRoomRequest;
import com.sdms.backend.modules.room.dto.response.RoomResponse;
import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.mapper.RoomMapper;
import com.sdms.backend.modules.room.repository.FloorRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.validator.RoomValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service xử lý các nghiệp vụ quản lý Phòng (Room).
 * Tích hợp chặt chẽ với RoomValidator (ROOM-04) bảo đảm an toàn dữ liệu tích hợp cho phân hệ AI/IoT.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final FloorRepository floorRepository;
    private final RoomMapper roomMapper;

    // ROOM-04 INTEGRATION: Thay thế việc gọi trực tiếp AssignmentRepository bằng RoomValidator lớp chuyên trách
    private final RoomValidator roomValidator;

    public RoomResponse createRoom(CreateRoomRequest request) {
        Floor floor = floorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new AppException("Floor not found", HttpStatus.NOT_FOUND));

        String normalizedCode = request.getRoomCode().trim().toUpperCase();
        if (roomRepository.existsByFloor_FloorIdAndRoomCode(floor.getFloorId(), normalizedCode)) {
            throw new AppException("Room code already exists in this floor", HttpStatus.BAD_REQUEST);
        }

        Room room = new Room();
        room.setFloor(floor);
        room.setRoomCode(normalizedCode);
        room.setCapacity(request.getCapacity());
        room.setOccupiedBeds(0);
        room.setStatus(RoomStatus.AVAILABLE);

        return roomMapper.toResponse(roomRepository.save(room));
    }

    public RoomResponse updateRoom(UUID roomId, UpdateRoomRequest request) {
        Room room = findById(roomId);

        // ROOM-04 STEP 03 Fix: Ép kiểm tra sức chứa (Capacity) dựa trên nguồn sự thật Assignment thay vì đếm biến thô
        if (request.getCapacity() != null) {
            roomValidator.validateCapacity(roomId, request.getCapacity());
            room.setCapacity(request.getCapacity());
        }

        // ROOM-04 STEP 02: Định tuyến kiểm tra chuyển đổi trạng thái (Transition Validation)
        // Đảm bảo an toàn cho cả luồng trạng thái CLOSED và MAINTENANCE từ bất kỳ trạng thái gốc nào (AVAILABLE/FULL)
        if (request.getStatus() != null && request.getStatus() != room.getStatus()) {
            roomValidator.validateStatusTransition(roomId, request.getStatus());
            room.setStatus(request.getStatus());
        }

        return roomMapper.toResponse(roomRepository.save(room));
    }

    public void changeStatus(UUID roomId, RoomStatus status) {
        Room room = findById(roomId);

        // ROOM-04: Kiểm tra tính an toàn chuyển đổi trạng thái trước khi lưu xuống DB
        if (status != room.getStatus()) {
            roomValidator.validateStatusTransition(roomId, status);
        }

        room.setStatus(status);
        roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoom(UUID roomId) {
        return roomMapper.toResponse(findById(roomId));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByFloor(UUID floorId) {
        return roomRepository.findByFloor_FloorId(floorId).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private Room findById(UUID id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new AppException("Room not found", HttpStatus.NOT_FOUND));
    }
}