package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.system.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final SystemConfigService systemConfigService;

    /**
     * Tạo bill tiền ở KTX
     *
     * Flow:
     * Assignment approved
     *    ↓
     * Create accommodation bill
     *    ↓
     * Student payment
     *    ↓
     * Check-in
     */
    @Transactional
    public Bill createAccommodationBill(
            UUID assignmentId,
            UUID applicationId,
            BigDecimal amount
    ) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException("Invalid bill amount", HttpStatus.BAD_REQUEST);
        }

        int deadlineDays = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_DEADLINE_DAYS", "3"));

        Bill bill = new Bill();
        bill.setAssignmentId(assignmentId);
        bill.setApplicationId(applicationId);
        bill.setBillType(BillType.ACCOMMODATION_FEE);
        bill.setAmount(amount);
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        bill.setDueDate(LocalDate.now().plusDays(deadlineDays));
        bill.setDescription("Accommodation fee");
        return billRepository.save(bill);
    }
}