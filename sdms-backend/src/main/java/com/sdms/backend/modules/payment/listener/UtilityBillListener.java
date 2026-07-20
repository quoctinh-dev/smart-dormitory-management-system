package com.sdms.backend.modules.payment.listener;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.event.UtilityBillCalculatedEvent;
import com.sdms.backend.modules.payment.entity.UtilityType;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.RoomRole;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.sdms.backend.modules.system.service.SystemConfigService;
import java.math.BigDecimal;;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UtilityBillListener {
    private final BillRepository billRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final SystemConfigService systemConfigService;

    @EventListener
    @Transactional
    public void onUtilityBillCalculated(UtilityBillCalculatedEvent event) {
        BigDecimal electricityPrice = new BigDecimal(systemConfigService.getConfigValue("ELECTRICITY_PRICE_PER_KWH", "3500"));
        BigDecimal waterPrice = new BigDecimal(systemConfigService.getConfigValue("WATER_PRICE_PER_M3", "15000"));
        
        BigDecimal unitPrice = event.getUtilityType() == UtilityType.ELECTRICITY ? electricityPrice : waterPrice;
        BillType billType = event.getUtilityType() == UtilityType.ELECTRICITY ? BillType.ELECTRIC_FEE : BillType.WATER_FEE;
        String utilityName = event.getUtilityType() == UtilityType.ELECTRICITY ? "điện" : "nước";
        String unitName = event.getUtilityType() == UtilityType.ELECTRICITY ? "kWh" : "m3";

        BigDecimal totalAmount = unitPrice.multiply(new BigDecimal(event.getTotalUsage()));
        YearMonth billingMonth = YearMonth.of(event.getYear(), event.getMonth());
        LocalDate startOfMonth = billingMonth.atDay(1);
        LocalDate endOfMonth = billingMonth.atEndOfMonth();

        // 1. Lấy tất cả assignment của phòng này (Đang ở)
        List<StudentHousingAssignment> assignments = assignmentRepository.findByBed_Room_RoomIdAndStatus(event.getRoomId(), AssignmentStatus.OCCUPIED);

        if (assignments.isEmpty()) {
            // Phòng trống hoàn toàn, gán bill cho phòng (không gán cho sinh viên)
            createRoomBill(event, totalAmount, billType, utilityName, unitName);
            return;
        }

        // 2. Tìm người đại diện thanh toán (Ưu tiên: Trưởng phòng -> Phó phòng -> Người ở lâu nhất)
        StudentHousingAssignment payer = assignments.stream()
                .filter(a -> a.getRoomRole() == RoomRole.ROOM_LEADER)
                .findFirst()
                .orElse(null);

        if (payer == null) {
            payer = assignments.stream()
                    .filter(a -> a.getRoomRole() == RoomRole.DEPUTY_LEADER)
                    .findFirst()
                    .orElse(null);
        }

        if (payer == null) {
            // Fallback: Lấy người có ngày check-in sớm nhất
            payer = assignments.stream()
                    .min((a1, a2) -> {
                        if (a1.getCheckInAt() == null) return 1;
                        if (a2.getCheckInAt() == null) return -1;
                        return a1.getCheckInAt().compareTo(a2.getCheckInAt());
                    })
                    .orElse(assignments.get(0));
        }

        // 3. Tạo duy nhất 1 hóa đơn gán cho người đại diện
        Bill bill = new Bill();
        bill.setBillType(billType);
        bill.setAmount(totalAmount);
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        bill.setDueDate(LocalDate.now().plusDays(10));
        
        String roleStr = payer.getRoomRole() == RoomRole.ROOM_LEADER ? "Trưởng phòng" : 
                         payer.getRoomRole() == RoomRole.DEPUTY_LEADER ? "Phó phòng" : "Đại diện phòng";

        bill.setDescription(String.format("Hóa đơn tiền %s tháng %d/%d (Thu từ %s). Số %s phòng: %d %s", 
                utilityName, event.getMonth(), event.getYear(), roleStr, utilityName, event.getTotalUsage(), unitName));
        bill.setRoomId(event.getRoomId());
        bill.setStudentId(payer.getStudent().getStudentId());
        bill.setAssignmentId(payer.getAssignmentId());

        billRepository.save(bill);
    }

    private void createRoomBill(UtilityBillCalculatedEvent event, BigDecimal totalAmount, BillType billType, String utilityName, String unitName) {
        Bill bill = new Bill();
        bill.setBillType(billType);
        bill.setAmount(totalAmount);
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        bill.setDueDate(LocalDate.now().plusDays(10));
        bill.setDescription(String.format("Hóa đơn tiền %s tháng %d/%d. Số %s: %d %s (Phòng trống)", 
                utilityName, event.getMonth(), event.getYear(), utilityName, event.getTotalUsage(), unitName));
        bill.setRoomId(event.getRoomId());
        
        billRepository.save(bill);
    }
}
