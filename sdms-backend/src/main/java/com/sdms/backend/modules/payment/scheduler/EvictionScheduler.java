package com.sdms.backend.modules.payment.scheduler;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import com.sdms.backend.modules.system.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class EvictionScheduler {

    private final BillRepository billRepository;
    private final HousingAssignmentService assignmentService;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final SystemConfigService systemConfigService;

    /**
     * Chạy hàng ngày lúc 01:00 AM để quét các sinh viên nợ tiền lưu trú quá hạn quy định.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void scanAndEvictOverdueStudents() {
        log.info("[EVICTION_SCHEDULER] Bắt đầu quét hóa đơn lưu trú quá hạn...");

        String daysStr = systemConfigService.getConfigValue("OVERDUE_DAYS_BEFORE_EVICTION", "7");
        int overdueDays;
        try {
            overdueDays = Integer.parseInt(daysStr);
        } catch (NumberFormatException e) {
            log.error("Cấu hình OVERDUE_DAYS_BEFORE_EVICTION không hợp lệ: {}. Mặc định dùng 7 ngày.", daysStr);
            overdueDays = 7;
        }

        // Tìm các hóa đơn có dueDate <= ngày này
        LocalDate targetDate = LocalDate.now().minusDays(overdueDays);
        
        // dueDate < targetDate + 1 tương đương với dueDate <= targetDate
        List<Bill> overdueBills = billRepository.findByStatusAndDueDateBefore(BillStatus.UNPAID, targetDate.plusDays(1));
        
        int evictedCount = 0;
        for (Bill bill : overdueBills) {
            if (bill.getBillType() == BillType.ACCOMMODATION_FEE || bill.getBillType() == BillType.PENALTY_FEE) {
                try {
                    UUID assignmentId = bill.getAssignmentId();
                    
                    // Nếu hóa đơn PENALTY_FEE không đính kèm assignmentId, ta tự tìm assignment đang active của SV đó
                    if (assignmentId == null && bill.getStudentId() != null) {
                        StudentHousingAssignment activeAssignment = assignmentRepository
                                .findByStudent_StudentIdAndStatus(bill.getStudentId(), AssignmentStatus.OCCUPIED)
                                .orElse(null);
                        if (activeAssignment != null) {
                            assignmentId = activeAssignment.getAssignmentId();
                        }
                    }

                    if (assignmentId != null) {
                        StudentHousingAssignment assignment = assignmentService.getAssignmentById(assignmentId);
                        
                        // Chỉ thao tác nếu sinh viên đang thực sự ở trong KTX
                        if (assignment.getStatus() == AssignmentStatus.OCCUPIED) {
                            assignmentService.checkOut(assignmentId);
                            
                            log.info("Đã checkout cưỡng chế hợp đồng {} do hóa đơn {} ({}) quá hạn >= {} ngày.", 
                                     assignmentId, bill.getBillCode(), bill.getBillType(), overdueDays);
                            evictedCount++;
                        }
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi checkout cưỡng chế cho hóa đơn {}: {}", bill.getBillCode(), e.getMessage());
                }
            }
        }
        
        log.info("[EVICTION_SCHEDULER] Hoàn tất quét. Đã checkout cưỡng chế {} trường hợp.", evictedCount);
    }
}
