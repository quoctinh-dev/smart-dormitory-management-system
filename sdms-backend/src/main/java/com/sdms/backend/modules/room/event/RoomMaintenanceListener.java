package com.sdms.backend.modules.room.event;

import com.sdms.backend.modules.maintenance.event.RoomMaintenanceCompletedEvent;
import com.sdms.backend.modules.maintenance.event.RoomMaintenanceRequiredEvent;
import com.sdms.backend.modules.room.entity.Bed;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.BedStatus;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomMaintenanceListener {

    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final HousingAssignmentService housingAssignmentService;

    @EventListener
    public void handleMaintenanceRequired(RoomMaintenanceRequiredEvent event) {
        log.info("[RoomMaintenanceListener] Received RoomMaintenanceRequiredEvent for roomId: {}, bedId: {}", event.getRoomId(), event.getBedId());
        
        if (event.getBedId() != null) {
            bedRepository.findById(event.getBedId()).ifPresent(bed -> {
                bed.setStatus(BedStatus.MAINTENANCE);
                bedRepository.save(bed);
                log.info("Set BedStatus to MAINTENANCE for bedId: {}", event.getBedId());
            });
        } else if (event.getRoomId() != null) {
            roomRepository.findById(event.getRoomId()).ifPresent(room -> {
                room.setStatus(RoomStatus.MAINTENANCE);
                roomRepository.save(room);
                log.info("Set RoomStatus to MAINTENANCE for roomId: {}", event.getRoomId());
            });
        }
    }

    @EventListener
    public void handleMaintenanceCompleted(RoomMaintenanceCompletedEvent event) {
        log.info("[RoomMaintenanceListener] Received RoomMaintenanceCompletedEvent for roomId: {}, bedId: {}", event.getRoomId(), event.getBedId());

        if (event.getBedId() != null) {
            bedRepository.findById(event.getBedId()).ifPresent(bed -> {
                bed.setStatus(BedStatus.AVAILABLE);
                bedRepository.save(bed);
                housingAssignmentService.reconcileRoomOccupancy(bed.getRoom().getRoomId());
                log.info("Set BedStatus to AVAILABLE and reconciled room for bedId: {}", event.getBedId());
            });
        } else if (event.getRoomId() != null) {
            roomRepository.findById(event.getRoomId()).ifPresent(room -> {
                housingAssignmentService.reconcileRoomOccupancy(room.getRoomId());
                log.info("Reconciled room for roomId: {}", event.getRoomId());
            });
        }
    }
}
