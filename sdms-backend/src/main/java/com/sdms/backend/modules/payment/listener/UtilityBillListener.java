package com.sdms.backend.modules.payment.listener;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.event.UtilityBillCalculatedEvent;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.RoomRole;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.system.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

/**
 * Event Listener lắng nghe sự kiện chốt điện/nước để tự động tính tiền và tạo Hóa đơn (Bill).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UtilityBillListener {

    private final BillRepository billRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final SystemConfigService systemConfigService;

    /**
     * Xử lý tự động khi nhận sự kiện UtilityBillCalculatedEvent (chốt số điện/nước thành công).
     */
    @EventListener
    @Transactional
    public void onUtilityBillCalculated(UtilityBillCalculatedEvent event) {
        // Lấy đơn giá điện từ cấu hình hệ thống (mặc định 3,500 VNĐ/kWh)
        BigDecimal electricityPrice = new BigDecimal(
                systemConfigService.getConfigValue("ELECTRICITY_PRICE_PER_KWH", "3500")
        );
        BigDecimal unitPrice = electricityPrice;
        BillType billType = BillType.ELECTRIC_FEE;
        String utilityName = "điện";
        String unitName = "kWh";

        // Tính tổng tiền = Đơn giá * Số điện tiêu thụ
        BigDecimal totalAmount = unitPrice.multiply(new BigDecimal(event.getTotalUsage()));
        YearMonth billingMonth = YearMonth.of(event.getYear(), event.getMonth());
        LocalDate startOfMonth = billingMonth.atDay(1);
        LocalDate endOfMonth = billingMonth.atEndOfMonth();

        // 1. Lấy tất cả danh sách sinh viên đang ở (OCCUPIED) thuộc phòng này
        List<StudentHousingAssignment> assignments = assignmentRepository
                .findByBed_Room_RoomIdAndStatus(event.getRoomId(), AssignmentStatus.OCCUPIED);

        if (assignments.isEmpty()) {
            // Trường hợp phòng trống: Gán hóa đơn trực tiếp cho roomId (không gán sinh viên)
            createRoomBill(event, totalAmount, billType, utilityName, unitName);
            return;
        }

        // 2. Xác định đại diện thanh toán tiền điện của phòng theo thứ tự ưu tiên:
        //    Trưởng phòng (ROOM_LEADER) -> Phó phòng (DEPUTY_LEADER) -> Người vào ở sớm nhất (Check-in sớm nhất)
        StudentHousingAssignment payer = assignments.stream()
                .filter(a -> a.getRoomRole() == RoomRole.ROOM_LEADER)
                .findFirst()
                .orElseGet(() -> assignments.stream()
                        .filter(a -> a.getRoomRole() == RoomRole.DEPUTY_LEADER)
                        .findFirst()
                        .orElseGet(() -> assignments.stream()
                                .min(Comparator.comparing(
                                        StudentHousingAssignment::getCheckInAt,
                                        Comparator.nullsLast(Comparator.naturalOrder())
                                ))
                                .orElse(assignments.get(0))
                        )
                );

        // 3. Khởi tạo và lưu duy nhất 1 hóa đơn cho người đại diện phòng
        Bill bill = new Bill();
        bill.setBillType(billType);
        bill.setAmount(totalAmount);
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        bill.setDueDate(LocalDate.now().plusDays(10)); // Hạn thanh toán 10 ngày từ ngày tạo

        String roleStr = payer.getRoomRole() == RoomRole.ROOM_LEADER ? "Trưởng phòng" :
                payer.getRoomRole() == RoomRole.DEPUTY_LEADER ? "Phó phòng" : "Đại diện phòng";

        bill.setDescription(String.format("Hóa đơn tiền %s tháng %d/%d (Thu từ %s). Số %s phòng: %d %s",
                utilityName, event.getMonth(), event.getYear(), roleStr, utilityName, event.getTotalUsage(), unitName));
        bill.setRoomId(event.getRoomId());
        bill.setStudentId(payer.getStudent().getStudentId());
        bill.setAssignmentId(payer.getAssignmentId());

        billRepository.save(bill);
        log.info("Successfully created electricity bill for room {} assigned to student {}", event.getRoomId(), payer.getStudent().getStudentId());
    }

    /**
     * Tạo hóa đơn tiền điện dành cho phòng trống chưa có sinh viên ở.
     */
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
        log.info("Successfully created empty room electricity bill for room {}", event.getRoomId());
    }
}