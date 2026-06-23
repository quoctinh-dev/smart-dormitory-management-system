package com.sdms.backend.modules.room.scheduler;

import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomOccupancyReconciliationJob {

    private final RoomRepository roomRepository;
    private final HousingAssignmentService housingAssignmentService;

    public void execute() {
        log.info("[ROOM_RECONCILIATION] START JOB - Scanning all rooms in the system for data reconciliation...");
        long startTime = System.currentTimeMillis();

        try {
            // LOAD ROOM IDS: Chỉ quét danh sách ID, không lock ở bước này
            List<UUID> roomIds = roomRepository.findAll().stream()
                    .map(Room::getRoomId)
                    .collect(Collectors.toList());

            log.info("[ROOM_RECONCILIATION] Loaded {} room IDs for processing.", roomIds.size());

            int processedRoomsCount = 0;
            int failedRoomsCount = 0;

            for (UUID roomId : roomIds) {
                try {
                    // TRY CATCH PER ROOM: Mỗi phòng xử lý biệt lập trong transaction REQUIRES_NEW riêng lẻ
                    housingAssignmentService.reconcileRoomOccupancy(roomId);
                    processedRoomsCount++;
                } catch (Exception e) {
                    failedRoomsCount++;
                    log.error("[ROOM_RECONCILIATION] Failed to reconcile room with ID: {}", roomId, e);
                }
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("[ROOM_RECONCILIATION] JOB FINISHED. Processed Rooms: {} | Failed Rooms: {} | Execution Time: {} ms", 
                    processedRoomsCount, failedRoomsCount, duration);

        } catch (Exception e) {
            log.error("[ROOM_RECONCILIATION] Critical failure running global reconciliation job", e);
        }
    }
}
