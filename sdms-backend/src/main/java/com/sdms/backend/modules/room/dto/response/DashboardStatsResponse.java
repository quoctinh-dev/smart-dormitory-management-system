package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

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
}
