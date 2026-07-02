package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;
import java.io.Serializable;
import java.util.List;

@Data
@Builder
public class OccupancyAnalyticsResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private double overallOccupancyRate;
    private List<BuildingOccupancy> buildingOccupancies;
    private List<String> lowOccupancyAlerts;
    private String recommendationAction;

    @Data
    @Builder
    public static class BuildingOccupancy implements Serializable {
        private static final long serialVersionUID = 1L;
        
        private String buildingName;
        private double occupancyRate;
        private String trend;
    }
}
