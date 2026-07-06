package com.sdms.backend.modules.payment.listener;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.event.ElectricityBillCalculatedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class ElectricityBillListener {
    private final BillRepository billRepository;
    private static final BigDecimal ELECTRICITY_PRICE_PER_KWH = new BigDecimal("3500");
    
    @EventListener
    @Transactional
    public void onElectricityBillCalculated(ElectricityBillCalculatedEvent event) {
        Bill bill = new Bill();
        bill.setBillType(BillType.ELECTRIC_FEE);
        bill.setAmount(ELECTRICITY_PRICE_PER_KWH.multiply(new BigDecimal(event.getTotalKwh())));
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        bill.setDueDate(LocalDate.now().plusDays(10));
        bill.setDescription(String.format("HÃ³a Ä‘Æ¡n tiá»n Ä‘iá»‡n thÃ¡ng %d/%d. Sá»‘ Ä‘iá»‡n: %d kWh", event.getMonth(), event.getYear(), event.getTotalKwh()));
        bill.setRoomId(event.getRoomId());
        
        billRepository.save(bill);
    }
}
