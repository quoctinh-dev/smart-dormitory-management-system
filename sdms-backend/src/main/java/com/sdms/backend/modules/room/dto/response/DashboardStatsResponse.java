package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    private long pendingApplications;
    private long waitingForPayment;
    private long pendingCheckIn;
    private long occupiedAssignments;
    private long totalRooms;
    private long totalBeds;
    private long totalBuildings; // Added
    private long totalFloors;    // Added
}
