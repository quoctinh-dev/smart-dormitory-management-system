package com.sdms.backend.modules.room.service;

import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.room.dto.response.DashboardStatsResponse;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.BuildingRepository; // Added
import com.sdms.backend.modules.room.repository.FloorRepository;   // Added
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomDashboardService {

    private final DormitoryApplicationRepository applicationRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final BuildingRepository buildingRepository; // Added
    private final FloorRepository floorRepository;       // Added

    public DashboardStatsResponse getDashboardStats() {
        long pendingApplications = applicationRepository.countByStatus(ApplicationStatus.PENDING);
        long waitingPayment = applicationRepository.countByStatus(ApplicationStatus.WAITING_PAYMENT);
        long waitingCheckIn = assignmentRepository.countByStatus(AssignmentStatus.PENDING_CHECKIN);
        long occupied = assignmentRepository.countByStatus(AssignmentStatus.OCCUPIED);
        long totalRooms = roomRepository.count();
        long totalBeds = bedRepository.count();
        long totalBuildings = buildingRepository.count(); // Added
        long totalFloors = floorRepository.count();       // Added

        return DashboardStatsResponse.builder()
                .pendingApplications(pendingApplications)
                .waitingForPayment(waitingPayment)
                .pendingCheckIn(waitingCheckIn)
                .occupiedAssignments(occupied)
                .totalRooms(totalRooms)
                .totalBeds(totalBeds)
                .totalBuildings(totalBuildings) // Added
                .totalFloors(totalFloors)       // Added
                .build();
    }
}
