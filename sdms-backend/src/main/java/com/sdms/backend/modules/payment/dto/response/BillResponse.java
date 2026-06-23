package com.sdms.backend.modules.payment.dto.response;

import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class BillResponse {

    private UUID billId;

    private BillType billType;

    private BigDecimal amount;

    private BigDecimal paidAmount;

    private BigDecimal remainingAmount;

    private BillStatus status;

    private LocalDate dueDate;

    private String description;

    private UUID assignmentId;

    private String roomCode;

    private String bedCode;
}
