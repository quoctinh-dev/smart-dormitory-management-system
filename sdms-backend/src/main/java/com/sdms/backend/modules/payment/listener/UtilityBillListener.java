package com.sdms.backend.modules.payment.listener;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.event.UtilityBillCalculatedEvent;
import com.sdms.backend.modules.payment.event.UtilityBillCreatedEvent;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.service.BillService;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.RoomRole;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.system.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/**
 * Event Listener lắng nghe sự kiện chốt điện để tự động tính tiền và tạo Hóa đơn (Bill).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UtilityBillListener {

    private static final String DEFAULT_ELECTRICITY_PRICE = "3500";
    private static final String CONFIG_KEY_ELECTRICITY_PRICE = "ELECTRICITY_PRICE_PER_KWH";
    private static final String UTILITY_NAME_ELECTRICITY = "điện";
    private static final String UNIT_NAME_KWH = "kWh";
    private static final int DUE_DAYS = 10;

    private final BillRepository billRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final SystemConfigService systemConfigService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Xử lý tự động khi nhận sự kiện UtilityBillCalculatedEvent (chốt số điện thành công).
     */
    @EventListener
    @Transactional
    public void onUtilityBillCalculated(UtilityBillCalculatedEvent event) {
        // Lấy đơn giá điện từ cấu hình hệ thống
        BigDecimal electricityPrice = new BigDecimal(
                systemConfigService.getConfigValue(CONFIG_KEY_ELECTRICITY_PRICE, DEFAULT_ELECTRICITY_PRICE)
        );

        BillType billType = BillType.ELECTRIC_FEE;

        // Tính tổng tiền = Đơn giá * Số điện tiêu thụ
        BigDecimal totalAmount = electricityPrice.multiply(new BigDecimal(event.getTotalUsage()));

        // 1. Lấy tất cả danh sách sinh viên đang ở (OCCUPIED) thuộc phòng này
        List<StudentHousingAssignment> assignments = assignmentRepository
                .findByBed_Room_RoomIdAndStatus(event.getRoomId(), AssignmentStatus.OCCUPIED);

        if (assignments.isEmpty()) {
            // Trường hợp phòng trống: Gán hóa đơn trực tiếp cho roomId
            createRoomBill(event, totalAmount, billType);
            return;
        }

        // 2. Xác định đại diện thanh toán: Trưởng phòng -> Phó phòng -> Người vào ở sớm nhất
        StudentHousingAssignment payer = findRepresentativePayer(assignments);

        // 3. Khởi tạo và lưu duy nhất 1 hóa đơn cho người đại diện phòng
        Bill bill = new Bill();
        bill.setBillType(billType);
        bill.setAmount(totalAmount);
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        bill.setDueDate(LocalDate.now().plusDays(DUE_DAYS));

        String roleStr = getRoleName(payer.getRoomRole());

        bill.setDescription(String.format("Hóa đơn tiền %s tháng %d/%d (Thu từ %s). Số %s phòng: %d %s",
                UTILITY_NAME_ELECTRICITY, event.getMonth(), event.getYear(), roleStr, UTILITY_NAME_ELECTRICITY, event.getTotalUsage(), UNIT_NAME_KWH));
        bill.setRoomId(event.getRoomId());
        bill.setStudentId(payer.getStudent().getStudentId());
        bill.setAssignmentId(payer.getAssignmentId());
        bill.setBillCode(BillService.generateBillCode(billType));

        billRepository.save(bill);
        log.info("Successfully created {} bill for room {} assigned to student {}",
                UTILITY_NAME_ELECTRICITY, event.getRoomId(), payer.getStudent().getStudentId());

        // Bắn sự kiện thông báo tạo hóa đơn thành công
        eventPublisher.publishEvent(new UtilityBillCreatedEvent(
                bill.getBillCode(),
                bill.getStudentId(),
                bill.getBillType(),
                totalAmount,
                UTILITY_NAME_ELECTRICITY,
                event.getMonth(),
                event.getYear()
        ));
    }

    /**
     * Tạo hóa đơn tiền điện dành cho phòng trống chưa có sinh viên ở.
     */
    private void createRoomBill(UtilityBillCalculatedEvent event, BigDecimal totalAmount, BillType billType) {
        Bill bill = new Bill();
        bill.setBillType(billType);
        bill.setAmount(totalAmount);
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        bill.setDueDate(LocalDate.now().plusDays(DUE_DAYS));
        bill.setDescription(String.format("Hóa đơn tiền %s tháng %d/%d. Số %s: %d %s (Phòng trống)",
                UTILITY_NAME_ELECTRICITY, event.getMonth(), event.getYear(), UTILITY_NAME_ELECTRICITY, event.getTotalUsage(), UNIT_NAME_KWH));
        bill.setRoomId(event.getRoomId());
        bill.setBillCode(BillService.generateBillCode(billType));

        billRepository.save(bill);
        log.info("Successfully created empty room {} bill for room {}", UTILITY_NAME_ELECTRICITY, event.getRoomId());
    }

    /**
     * Tìm sinh viên đại diện đứng tên hóa đơn.
     */
    private StudentHousingAssignment findRepresentativePayer(List<StudentHousingAssignment> assignments) {
        return assignments.stream()
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
    }

    private String getRoleName(RoomRole role) {
        if (role == RoomRole.ROOM_LEADER) return "Trưởng phòng";
        if (role == RoomRole.DEPUTY_LEADER) return "Phó phòng";
        return "Đại diện phòng";
    }
}