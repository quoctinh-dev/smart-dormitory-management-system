package com.sdms.backend.modules.room.service;

import com.sdms.backend.modules.room.dto.response.*;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.BedStatus;
import com.sdms.backend.modules.room.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomDashboardService {

    // Inject đầy đủ các Repository cần thiết
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;

    public RoomDashboardResponse getOverview() {
        long totalBeds = bedRepository.count();
        // Sử dụng Assignment làm nguồn dữ liệu chính cho các giường đang có người ở
        long occupiedBeds = assignmentRepository.countByStatus(AssignmentStatus.OCCUPIED);
        long maintenanceBeds = bedRepository.countByStatus(BedStatus.MAINTENANCE);

        // Bảo vệ khỏi lỗi chia cho 0
        double occupancyRate = (totalBeds == 0) ? 0.0 : ((double) occupiedBeds / totalBeds) * 100;

        return RoomDashboardResponse.builder()
                .totalBuildings(buildingRepository.count())
                .totalFloors(floorRepository.count())
                .totalRooms(roomRepository.count())
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .availableBeds(totalBeds - occupiedBeds - maintenanceBeds)
                .maintenanceBeds(maintenanceBeds)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .build();
    }

    public BedStatisticsResponse getBedStatistics() {
        return BedStatisticsResponse.builder()
                .availableBeds(bedRepository.countByStatus(BedStatus.AVAILABLE))
                .reservedBeds(bedRepository.countByStatus(BedStatus.RESERVED))
                .occupiedBeds(assignmentRepository.countByStatus(AssignmentStatus.OCCUPIED))
                .maintenanceBeds(bedRepository.countByStatus(BedStatus.MAINTENANCE))
                .build();
    }
}