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
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.room.dto.response.HourlyTrafficDto;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.enums.BillStatus;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
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
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final AccessHistoryRepository accessHistoryRepository;
    private final BillRepository billRepository;

    @Cacheable(value = "dashboard_static", key = "'static_metrics_v4'")
    public DashboardStatsResponse getDashboardStats() {
        long pendingApplications = applicationRepository.countByStatus(ApplicationStatus.PENDING);
        long waitingPayment = applicationRepository.countByStatus(ApplicationStatus.WAITING_PAYMENT);
        long waitingCheckIn = assignmentRepository.countByStatus(AssignmentStatus.PENDING_CHECKIN);
        long occupied = assignmentRepository.countByStatus(AssignmentStatus.OCCUPIED);
        long totalRooms = roomRepository.count();
        long totalBeds = bedRepository.count();
        long totalBuildings = buildingRepository.count();
        long totalFloors = floorRepository.count();

        // Calculate Real Inside/Outside students
        long studentsOutside = accessHistoryRepository.countOccupiedStudentsCurrentlyOutside();
        long studentsInside = occupied > studentsOutside ? occupied - studentsOutside : 0;

        // Calculate Real Hourly Traffic for today
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
        List<Object[]> trafficRaw = accessHistoryRepository.getHourlyTraffic(startOfDay, endOfDay);
        
        List<HourlyTrafficDto> hourlyTraffic = new ArrayList<>();
        // Initialize 24 hours with 0
        for (int i = 0; i < 24; i++) {
            hourlyTraffic.add(HourlyTrafficDto.builder()
                .time(String.format("%02d:00", i))
                .in(0)
                .out(0)
                .build());
        }

        // Fill with actual data
        for (Object[] row : trafficRaw) {
            int hour = ((Number) row[0]).intValue();
            String direction = (String) row[1];
            long count = ((Number) row[2]).longValue();

            if (hour >= 0 && hour < 24) {
                HourlyTrafficDto dto = hourlyTraffic.get(hour);
                if ("IN".equals(direction)) {
                    dto.setIn(count);
                } else if ("OUT".equals(direction)) {
                    dto.setOut(count);
                }
            }
        }

        // Fetch Revenue stats
        long paidBillsCount = billRepository.countByStatus(BillStatus.PAID);
        long unpaidBillsCount = billRepository.countByStatus(BillStatus.UNPAID) + billRepository.countByStatus(BillStatus.PARTIALLY_PAID);
        java.math.BigDecimal totalCollected = billRepository.sumAmountByStatus(BillStatus.PAID);
        if (totalCollected == null) {
            totalCollected = java.math.BigDecimal.ZERO;
        }

        return DashboardStatsResponse.builder()
                .pendingApplications(pendingApplications)
                .waitingForPayment(waitingPayment)
                .pendingCheckIn(waitingCheckIn)
                .occupiedAssignments(occupied)
                .totalRooms(totalRooms)
                .totalBeds(totalBeds)
                .totalBuildings(totalBuildings)
                .totalFloors(totalFloors)
                .studentsInside(studentsInside)
                .studentsOutside(studentsOutside)
                .hourlyTraffic(hourlyTraffic)
                .totalCollectedAmount(totalCollected)
                .paidBillsCount(paidBillsCount)
                .unpaidBillsCount(unpaidBillsCount)
                .build();
    }
}
