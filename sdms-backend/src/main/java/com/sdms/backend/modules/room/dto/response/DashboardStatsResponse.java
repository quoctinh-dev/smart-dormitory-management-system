package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
public class DashboardStatsResponse implements Serializable {
    private long pendingApplications;
    private long waitingForPayment;
    private long pendingCheckIn;
    private long occupiedAssignments;
    private long totalRooms;
    private long totalBeds;
    private long totalBuildings; // Added
    private long totalFloors;    // Added
    private long studentsInside;
    private long studentsOutside;
    private List<HourlyTrafficDto> hourlyTraffic;

    // Revenue tracking
    private java.math.BigDecimal totalCollectedAmount;
    private long paidBillsCount;
    private long unpaidBillsCount;
}
