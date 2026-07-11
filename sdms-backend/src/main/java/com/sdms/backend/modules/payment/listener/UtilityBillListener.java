package com.sdms.backend.modules.payment.listener;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.event.UtilityBillCalculatedEvent;
import com.sdms.backend.modules.payment.entity.UtilityType;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.sdms.backend.modules.system.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        // 1. Lấy tất cả assignment của phòng này (Đang ở hoặc Đã trả phòng)
        List<StudentHousingAssignment> assignments = new ArrayList<>();
        assignments.addAll(assignmentRepository.findByBed_Room_RoomIdAndStatus(event.getRoomId(), AssignmentStatus.OCCUPIED));
        assignments.addAll(assignmentRepository.findByBed_Room_RoomIdAndStatus(event.getRoomId(), AssignmentStatus.CHECKED_OUT));

        // 2. Tính toán số ngày ở thực tế trong tháng của từng sinh viên
        Map<StudentHousingAssignment, Long> studentDaysMap = new HashMap<>();
        long totalStudentDays = 0;

        for (StudentHousingAssignment assignment : assignments) {
            LocalDate checkInDate = assignment.getCheckInAt() != null ? assignment.getCheckInAt().toLocalDate() : null;
            LocalDate checkOutDate = assignment.getCheckOutAt() != null ? assignment.getCheckOutAt().toLocalDate() : null;

            if (checkInDate == null || checkInDate.isAfter(endOfMonth)) {
                continue; // Chưa check-in hoặc check-in sau tháng này
            }
            if (checkOutDate != null && checkOutDate.isBefore(startOfMonth)) {
                continue; // Đã check-out từ tháng trước
            }

            LocalDate actualStart = checkInDate.isAfter(startOfMonth) ? checkInDate : startOfMonth;
            LocalDate actualEnd = (checkOutDate != null && checkOutDate.isBefore(endOfMonth)) ? checkOutDate : endOfMonth;

            long daysStayed = ChronoUnit.DAYS.between(actualStart, actualEnd) + 1; // Tính cả ngày đến và ngày đi
            if (daysStayed > 0) {
                studentDaysMap.put(assignment, daysStayed);
                totalStudentDays += daysStayed;
            }
        }

        // 3. Xử lý ngoại lệ: Nếu phòng không có ai ở nhưng vẫn phát sinh số
        if (totalStudentDays == 0 || studentDaysMap.isEmpty()) {
            createRoomBill(event, totalAmount, billType, utilityName, unitName);
            return;
        }

        // 4. Pro-rata: Chia tiền dựa trên tỷ lệ ngày ở
        BigDecimal remainingAmount = totalAmount;
        int i = 0;
        int totalStudents = studentDaysMap.size();

        for (Map.Entry<StudentHousingAssignment, Long> entry : studentDaysMap.entrySet()) {
            StudentHousingAssignment assignment = entry.getKey();
            long days = entry.getValue();

            BigDecimal fraction = new BigDecimal(days).divide(new BigDecimal(totalStudentDays), 10, RoundingMode.HALF_UP);
            BigDecimal studentAmount = totalAmount.multiply(fraction).setScale(0, RoundingMode.HALF_UP);

            i++;
            if (i == totalStudents) { // Người cuối cùng chịu phần dư để làm tròn đúng tổng số tiền
                studentAmount = remainingAmount;
            } else {
                remainingAmount = remainingAmount.subtract(studentAmount);
            }

            Bill bill = new Bill();
            bill.setBillType(billType);
            bill.setAmount(studentAmount);
            bill.setPaidAmount(BigDecimal.ZERO);
            bill.setStatus(BillStatus.UNPAID);
            bill.setDueDate(LocalDate.now().plusDays(10));
            bill.setDescription(String.format("Hóa đơn tiền %s tháng %d/%d (Tỷ lệ: %d/%d ngày). Số %s phòng: %d %s", 
                    utilityName, event.getMonth(), event.getYear(), days, totalStudentDays, utilityName, event.getTotalUsage(), unitName));
            bill.setRoomId(event.getRoomId());
            bill.setStudentId(assignment.getStudent().getStudentId());
            bill.setAssignmentId(assignment.getAssignmentId());

            billRepository.save(bill);
        }
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
