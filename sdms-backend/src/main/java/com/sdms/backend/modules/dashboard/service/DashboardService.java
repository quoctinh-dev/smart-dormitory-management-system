package com.sdms.backend.modules.dashboard.service;

import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.dashboard.dto.response.DashboardStatsResponse;
import com.sdms.backend.modules.dashboard.dto.response.HourlyTrafficDto;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.BuildingRepository;
import com.sdms.backend.modules.room.repository.FloorRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.student.repository.StayExtensionRepository;
import com.sdms.backend.modules.student.enums.ExtensionStatus;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final DormitoryApplicationRepository applicationRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final AccessHistoryRepository accessHistoryRepository;
    private final BillRepository billRepository;
    private final StayExtensionRepository extensionRepository;

    @Cacheable(value = "dashboard_static", key = "'static_metrics_v6'")
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

        // --- Advanced Charting Data ---
        Map<String, Long> applicationsByStatus = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            applicationsByStatus.put(status.name(), applicationRepository.countByStatus(status));
        }

        Map<String, Long> billsByStatus = new HashMap<>();
        for (BillStatus status : BillStatus.values()) {
            billsByStatus.put(status.name(), billRepository.countByStatus(status));
        }

        // Actually StayExtensionRepository doesn't have countByStatus by default, let's just do a basic try-catch or count all and group in java to avoid writing custom query
        Map<String, Long> extensionsByStatus = new HashMap<>();
        try {
            List<com.sdms.backend.modules.student.entity.StayExtension> extensions = extensionRepository.findAll();
            for (com.sdms.backend.modules.student.entity.StayExtension ext : extensions) {
                String sName = ext.getStatus().name();
                extensionsByStatus.put(sName, extensionsByStatus.getOrDefault(sName, 0L) + 1);
            }
        } catch (Exception e) {
            // Ignore if error
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
                .applicationsByStatus(applicationsByStatus)
                .extensionsByStatus(extensionsByStatus)
                .billsByStatus(billsByStatus)
                .build();
    }
}
