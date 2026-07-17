package com.sdms.backend.modules.smartaccess.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

/**
 * RoomPinService: Quản lý mã PIN cửa phòng.
 *
 * DESIGN DECISION: PIN thuộc về PHÒNG, không phải sinh viên.
 * - Sinh viên đổi phòng → tự dùng PIN phòng mới, không cần migration.
 * - Admin đổi PIN phòng → toàn bộ SV trong phòng đó dùng PIN mới.
 * - PIN được sinh ngẫu nhiên (SecureRandom), 6 chữ số.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoomPinService {

    private final RoomRepository roomRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Sinh mã PIN ngẫu nhiên 6 chữ số.
     */
    private String generatePin() {
        int pin = 100000 + RANDOM.nextInt(900000); // 100000 -> 999999
        return String.valueOf(pin);
    }

    /**
     * Sinh PIN cho 1 phòng cụ thể (dùng khi tạo phòng mới).
     */
    @Transactional
    public String generatePinForRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy phòng: " + roomId));
        String pin = generatePin();
        room.setRoomPinCode(pin);
        roomRepository.save(room);
        log.info("[PIN] Generated PIN for roomId={}, roomCode={}", roomId, room.getRoomCode());
        
        eventPublisher.publishEvent(new com.sdms.backend.modules.smartaccess.event.RoomPinChangedEvent(roomId, room.getRoomCode(), pin));
        return pin;
    }

    /**
     * Reset PIN cho 1 phòng (Admin thao tác trên UI).
     */
    @Transactional
    public String resetPinForRoom(UUID roomId) {
        return generatePinForRoom(roomId);
    }

    /**
     * Sinh PIN hàng loạt cho TẤT CẢ phòng chưa có PIN.
     * Dùng khi khởi tạo hệ thống lần đầu.
     */
    @Transactional
    public int generatePinsForAllRoomsWithoutPin() {
        List<Room> rooms = roomRepository.findAll().stream()
                .filter(r -> r.getRoomPinCode() == null || r.getRoomPinCode().isBlank())
                .toList();
        rooms.forEach(room -> {
            room.setRoomPinCode(generatePin());
        });
        roomRepository.saveAll(rooms);
        log.info("[PIN] Bulk generated PINs for {} rooms without PIN.", rooms.size());
        return rooms.size();
    }

    /**
     * Reset PIN hàng loạt cho TẤT CẢ phòng (Admin muốn làm mới toàn bộ).
     */
    @Transactional
    public int resetPinsForAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        rooms.forEach(room -> room.setRoomPinCode(generatePin()));
        roomRepository.saveAll(rooms);
        log.info("[PIN] Bulk reset PINs for ALL {} rooms.", rooms.size());
        return rooms.size();
    }

    /**
     * Lấy PIN hiện tại của phòng (cho Admin xem trên UI).
     */
    @Transactional(readOnly = true)
    public String getPinForRoom(UUID roomId) {
        return roomRepository.findById(roomId)
                .map(Room::getRoomPinCode)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy phòng: " + roomId));
    }
}
