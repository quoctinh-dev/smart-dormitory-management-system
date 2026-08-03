package com.sdms.backend.modules.payment.event;

import com.sdms.backend.modules.payment.enums.BillType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ManualBillCreatedEvent {
    private String billId;
    private UUID studentId;
    private BillType billType;
    private BigDecimal amount;
    private String description;
}
