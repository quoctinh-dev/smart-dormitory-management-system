package com.sdms.backend.common.seeder;

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.room.entity.Bed;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.BedStatus;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.BuildingRepository;
import com.sdms.backend.modules.room.repository.FloorRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.smartaccess.domain.repository.GateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Trình khởi tạo dữ liệu mồi (Seeder) cho hạ tầng Ký túc xá (Tòa nhà, Tầng, Phòng, Giường).
 * Đảm bảo hệ thống luôn có sẵn cấu trúc dữ liệu nền tảng, hỗ trợ quá trình kiểm thử
 * và phát triển ban đầu mà không đòi hỏi thao tác nhập liệu thủ công.
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class DormitorySeeder implements CommandLineRunner {

    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final GateRepository gateRepository;
    private final JdbcTemplate jdbcTemplate;

    // ==============================================================
    // ID CỐ ĐỊNH ĐỂ TEST PHẦN CỨNG IOT
    // ==============================================================
    // ID khớp với file Config.h trong cụm smart_access (Mạch 1)
    public static final UUID BUILDING_A_ID    = UUID.fromString("dd979326-9196-497f-b35e-068b99f6e3ff");
    public static final UUID BUILDING_B_ID    = UUID.fromString("bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb"); // Tòa nhà B
    public static final UUID MAIN_GATE_ID     = UUID.fromString("1fe2de28-3fbe-46c4-b2fb-335aba513f26");

    // ID khớp với file Config.h trong cụm room_door (Mạch 2)
    public static final UUID ROOM_101_GATE_ID = UUID.fromString("a937509c-e2ae-4a2c-a74e-fd30d2318b2b");
    public static final UUID ROOM_101_ID      = UUID.fromString("dddddddd-4444-4444-4444-dddddddddddd");
    public static final String ROOM_101_PIN = "123456";

    // ID cho cụm room_door thứ hai (Phòng B101 - Mạch 3)
    public static final UUID ROOM_B101_GATE_ID = UUID.fromString("c827509c-e2ae-4a2c-a74e-fd30d2318b2c");
    public static final UUID ROOM_B101_ID      = UUID.fromString("eeeeeeee-5555-5555-5555-eeeeeeeeeeee");
    public static final String ROOM_B101_PIN = "654321";

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (buildingRepository.count() > 0) {
            log.info("Dormitory infrastructure already exists. Skipping seed.");
            return;
        }

        log.info("Starting Dormitory Infrastructure Seeding...");

        // 1. Khởi tạo dữ liệu Tòa nhà A (Dùng native query để ép ID cứng)
        jdbcTemplate.update(
            "INSERT INTO buildings (building_id, code, name, description, status, gender, created_at, updated_at) " +
            "VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
            BUILDING_A_ID, "A", "Tòa nhà A - KTX", "Tòa nhà 2 tầng, dành cho cả Nam và Nữ", "ACTIVE", "MIXED"
        );
        Building building = buildingRepository.findById(BUILDING_A_ID).orElseThrow();

        // 2. Khởi tạo danh sách Tầng (1 Tầng Nam, 1 Tầng Nữ)
        Floor floor1 = new Floor();
        floor1.setFloorNumber(1);
        floor1.setGender(Gender.MALE);
        floor1.setBuilding(building);
        floor1 = floorRepository.save(floor1);

        Floor floor2 = new Floor();
        floor2.setFloorNumber(2);
        floor2.setGender(Gender.FEMALE);
        floor2.setBuilding(building);
        floor2 = floorRepository.save(floor2);

        // 3. Khởi tạo danh sách Phòng và Giường tương ứng cho từng Tầng
        Room room101 = null;
        for (int i = 1; i <= 10; i++) {
            Room room = createRoom(floor1, 100 + i, 4, i == 1 ? ROOM_101_ID : null);
            if (i == 1) room101 = room; // Save reference for Gate Demo
        }
        for (int i = 1; i <= 10; i++) {
            createRoom(floor2, 200 + i, 4, null);
        }

        // 4. KHỞI TẠO CỔNG SMART ACCESS (Cho IOT Demo) bằng native query
        jdbcTemplate.update(
            "INSERT INTO gates (gate_id, name, gate_type, building_id, mac_address, is_active, created_at, updated_at) " +
            "VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
            MAIN_GATE_ID, "Cổng chính Tòa A (Lối vào)", "BUILDING_GATE", BUILDING_A_ID, "AA:BB:CC:DD:EE:01", true
        );

        jdbcTemplate.update(
            "INSERT INTO gates (gate_id, name, gate_type, building_id, room_id, mac_address, is_active, created_at, updated_at) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
            ROOM_101_GATE_ID, "Cửa phòng A101", "ROOM_DOOR", BUILDING_A_ID, room101.getRoomId(), "AA:BB:CC:DD:EE:02", true
        );


        // 5. Khởi tạo Tòa nhà B bằng native query
        jdbcTemplate.update(
            "INSERT INTO buildings (building_id, code, name, description, status, gender, created_at, updated_at) " +
            "VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
            BUILDING_B_ID, "B", "Tòa nhà B - KTX", "Tòa nhà 2 tầng, dành cho cả Nam và Nữ (Dùng để test từ chối mở cổng Tòa A)", "ACTIVE", "MIXED"
        );
        Building buildingB = buildingRepository.findById(BUILDING_B_ID).orElseThrow();

        Floor floor1B = new Floor();
        floor1B.setFloorNumber(1);
        floor1B.setGender(Gender.MALE);
        floor1B.setBuilding(buildingB);
        floor1B = floorRepository.save(floor1B);

        Room roomB101 = null;
        for (int i = 1; i <= 2; i++) {
            Room room = createRoom(floor1B, 100 + i, 4, i == 1 ? ROOM_B101_ID : null); // Tạo 2 phòng bên Tòa B để test
            if (i == 1) roomB101 = room;
        }

        // KHỞI TẠO CỔNG SMART ACCESS B101
        jdbcTemplate.update(
            "INSERT INTO gates (gate_id, name, gate_type, building_id, room_id, mac_address, is_active, created_at, updated_at) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
            ROOM_B101_GATE_ID, "Cửa phòng B101", "ROOM_DOOR", BUILDING_B_ID, roomB101.getRoomId(), "AA:BB:CC:DD:EE:03", true
        );

        // 6. Set PIN cố định cho phòng A101 và B101
        jdbcTemplate.update("UPDATE rooms SET room_pin_code = ? WHERE room_id = ?", ROOM_101_PIN, ROOM_101_ID);
        jdbcTemplate.update("UPDATE rooms SET room_pin_code = ? WHERE room_id = ?", ROOM_B101_PIN, ROOM_B101_ID);

        log.info("Dormitory Infrastructure Seeded Successfully!");
        log.info("==================================================");
        log.info("📢 IOT DEMO GATE IDs:");
        log.info(" BUILDING_A_ID  : {}", BUILDING_A_ID);
        log.info(" BUILDING_B_ID  : {}", BUILDING_B_ID);
        log.info(" MAIN_GATE_ID   : {}", MAIN_GATE_ID);
        log.info(" ROOM_101_GATE_ID: {}", ROOM_101_GATE_ID);
        log.info(" ROOM_101_PIN    : {} ← nhập trên keypad rồi nhấn #", ROOM_101_PIN);
        log.info(" ROOM_B101_GATE_ID: {}", ROOM_B101_GATE_ID);
        log.info(" ROOM_B101_PIN    : {} ← nhập trên keypad rồi nhấn #", ROOM_B101_PIN);
        log.info("==================================================");
    }

    private Room createRoom(Floor floor, int number, int capacity, UUID overrideId) {
        Room room = new Room();
        String roomCode = floor.getBuilding().getCode() + number;
        room.setRoomCode(roomCode);
        room.setCapacity(capacity);
        room.setOccupiedBeds(0);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setFloor(floor);
        room = roomRepository.saveAndFlush(room);
        
        // Cập nhật lại ID cứng cho phòng A101
        if (overrideId != null) {
            jdbcTemplate.update("UPDATE rooms SET room_id = ? WHERE room_id = ?", overrideId, room.getRoomId());
            room = roomRepository.findById(overrideId).orElseThrow();
        }

        for (int i = 1; i <= capacity; i++) {
            Bed bed = new Bed();
            bed.setBedCode(roomCode + "-B0" + i);
            bed.setStatus(BedStatus.AVAILABLE);
            bed.setRoom(room);
            bedRepository.save(bed);
        }
        return room;
    }
}
