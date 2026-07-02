package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class MaintenanceReportResponse {
    private int totalRoomsUnderMaintenance;
    private List<MaintenanceRecord> records;

    @Data
    @Builder
    public static class MaintenanceRecord {
        private String roomCode;
        private String issueDescription;
        private String expectedCompletionDate;
    }
}
