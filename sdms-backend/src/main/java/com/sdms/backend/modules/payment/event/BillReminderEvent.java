package com.sdms.backend.modules.payment.event;

import com.sdms.backend.modules.payment.enums.BillType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class BillReminderEvent {
    private final UUID billId;
    private final UUID studentId;
    private final String billCode;
    private final BillType billType;
    private final BigDecimal amount;
    private final LocalDate dueDate;
    private final String reminderType; // "DUE_SOON_3_DAYS", "DUE_SOON_1_DAY", "OVERDUE"
}
