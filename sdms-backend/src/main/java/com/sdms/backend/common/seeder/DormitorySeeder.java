package com.sdms.backend.common.seeder;

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.room.entity.Bed;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.BedStatus;
import com.sdms.backend.modules.room.enums.BuildingGender;
import com.sdms.backend.modules.room.enums.BuildingStatus;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.BuildingRepository;
import com.sdms.backend.modules.room.repository.FloorRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Seeder for Dormitory Infrastructure and Smart Access Gates.
 * Executed after DatabaseSeeder.
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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (buildingRepository.count() > 0) {
            log.info("Dormitory infrastructure already exists. Skipping seed.");
            return;
        }

        log.info("Starting Dormitory Infrastructure Seeding...");

        // 1. Create Building A
        Building building = new Building();
        building.setCode("A");
        building.setName("Tòa nhà A - KTX");
        building.setDescription("Tòa nhà 2 tầng, dành cho cả Nam và Nữ");
        building.setStatus(BuildingStatus.ACTIVE);
        building.setGender(BuildingGender.MIXED);
        building = buildingRepository.save(building);

        // 2. Create Floors (1 Male, 2 Female)
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

        // 3. Create Rooms and Beds
        Room room101 = null;
        for (int i = 1; i <= 10; i++) {
            Room room = createRoom(floor1, 100 + i, 4);
            if (i == 1) room101 = room; // Save reference for Gate Demo
        }
        for (int i = 1; i <= 10; i++) {
            createRoom(floor2, 200 + i, 4);
        }

        log.info("Dormitory Infrastructure Seeded Successfully!");
        // Note: Smart Access Gates should now be managed via the Frontend Admin UI (CRUD)
        // rather than hardcoding them here.
    }

    private Room createRoom(Floor floor, int number, int capacity) {
        Room room = new Room();
        String roomCode = floor.getBuilding().getCode() + number;
        room.setRoomCode(roomCode);
        room.setCapacity(capacity);
        room.setOccupiedBeds(0);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setFloor(floor);
        room = roomRepository.save(room);

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
