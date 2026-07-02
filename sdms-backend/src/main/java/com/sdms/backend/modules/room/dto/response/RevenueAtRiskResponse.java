package com.sdms.backend.modules.room.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RevenueAtRiskResponse {
    private double totalAmountAtRisk;
    private int totalOverdueBeds;
    private List<OverdueRecord> overdueRecords;

    @Data
    @Builder
    public static class OverdueRecord {
        private String roomCode;
        private String bedCode;
        private String studentId;
        private double amountDue;
        private int daysOverdue;
    }
}
