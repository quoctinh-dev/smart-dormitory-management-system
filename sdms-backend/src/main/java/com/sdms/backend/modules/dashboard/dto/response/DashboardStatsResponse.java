package com.sdms.backend.modules.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse implements Serializable {
    private long pendingApplications;
    private long waitingForPayment;
    private long pendingCheckIn;
    private long occupiedAssignments;
    private long totalRooms;
    private long totalBeds;
    private long totalBuildings;
    private long totalFloors;
    private long studentsInside;
    private long studentsOutside;
    private List<HourlyTrafficDto> hourlyTraffic;

    // Revenue tracking
    private java.math.BigDecimal totalCollectedAmount;
    private long paidBillsCount;
    private long unpaidBillsCount;

    // Advanced charting data
    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> extensionsByStatus;
    private Map<String, Long> billsByStatus;
}
