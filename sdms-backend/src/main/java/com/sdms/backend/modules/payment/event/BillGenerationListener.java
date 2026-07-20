package com.sdms.backend.modules.payment.event;

import com.sdms.backend.modules.payment.service.BillService;
import com.sdms.backend.modules.room.event.BedReservedEvent;
import com.sdms.backend.modules.student.event.ExtensionApprovedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillGenerationListener {

    private final BillService billService;
    private final com.sdms.backend.modules.system.service.SystemConfigService systemConfigService;
    private final com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository assignmentRepository;

    /**
     * Lắng nghe sự kiện một giường đã được giữ chỗ thành công (BedReservedEvent).
     * Nhiệm vụ của listener này là tạo ra một hóa đơn tiền phòng (Accommodation Fee)
     * ở trạng thái UNPAID, chờ sinh viên thanh toán.
     *
     * @param event Sự kiện chứa thông tin về việc giữ chỗ.
     */

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleBedReservedEvent(BedReservedEvent event) {
        log.info("[BillGenerationListener] Handling BedReservedEvent for assignmentId={}", event.getAssignmentId());
        try {
            // Tìm Assignment và RegistrationPeriod để tự động tính số tháng
            com.sdms.backend.modules.room.entity.StudentHousingAssignment assignment = assignmentRepository.findById(event.getAssignmentId())
                    .orElseThrow(() -> new RuntimeException("Assignment not found"));
            com.sdms.backend.modules.registration.entity.RegistrationPeriod period = assignment.getApplication().getRegistrationPeriod();
            
            // Tính toán số tháng lưu trú (Month Count)
            int startYear = period.getStayStartDate().getYear();
            int startMonth = period.getStayStartDate().getMonthValue();
            int endYear = period.getStayEndDate().getYear();
            int endMonth = period.getStayEndDate().getMonthValue();
            int totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
            
            // Lấy đơn giá mỗi tháng từ SystemConfig, mặc định 350.000 VNĐ
            BigDecimal monthlyFee = new BigDecimal(systemConfigService.getConfigValue("MONTHLY_ROOM_FEE", "350000"));
            
            // Lấy cấu hình số tháng mỗi đợt thanh toán (mặc định 3 tháng/quý)
            int chunkSize = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_CHUNK_MONTHS", "3"));
            int remainingMonths = totalMonths;
            int currentDelay = 0; // Số tháng cộng dồn cho DueDate
            
            while (remainingMonths > 0) {
                int currentChunk = Math.min(chunkSize, remainingMonths);
                BigDecimal billAmount = monthlyFee.multiply(new BigDecimal(currentChunk));

                billService.createAccommodationBill(
                        event.getAssignmentId(),
                        event.getApplicationId(),
                        null, // studentId is null for new assignments
                        billAmount,
                        currentDelay
                );
                remainingMonths -= currentChunk;
                currentDelay += currentChunk;
            }

            log.info("[BillGenerationListener] Successfully created chunked accommodation bills for assignmentId={}",
                    event.getAssignmentId());

        } catch (Exception e) {
            log.error("[BillGenerationListener] Failed to create bill for assignmentId={}. Reason: {}",
                    event.getAssignmentId(), e.getMessage(), e);
        }
    }

    /**
     * Lắng nghe sự kiện gia hạn lưu trú được duyệt (ExtensionApprovedEvent).
     * Tạo ra một hóa đơn tiền phòng cho đợt gia hạn mới.
     */
    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleExtensionApprovedEvent(ExtensionApprovedEvent event) {
        log.info("[BillGenerationListener] Handling ExtensionApprovedEvent for extensionId={}", event.getExtensionId());
        try {
            // Tìm Assignment để lấy RegistrationPeriod (nếu là gia hạn thì dùng kỳ hiện tại của Assignment)
            com.sdms.backend.modules.room.entity.StudentHousingAssignment assignment = assignmentRepository.findById(event.getAssignmentId())
                    .orElseThrow(() -> new RuntimeException("Assignment not found"));
            com.sdms.backend.modules.registration.entity.RegistrationPeriod period = assignment.getApplication().getRegistrationPeriod();
            
            // Tính số tháng
            int startYear = period.getStayStartDate().getYear();
            int startMonth = period.getStayStartDate().getMonthValue();
            int endYear = period.getStayEndDate().getYear();
            int endMonth = period.getStayEndDate().getMonthValue();
            int totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
            
            BigDecimal monthlyFee = new BigDecimal(systemConfigService.getConfigValue("MONTHLY_ROOM_FEE", "350000"));
            
            // Lấy cấu hình số tháng mỗi đợt thanh toán (mặc định 3 tháng/quý)
            int chunkSize = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_CHUNK_MONTHS", "3"));
            int remainingMonths = totalMonths;
            int currentDelay = 0; // Số tháng cộng dồn cho DueDate
            
            while (remainingMonths > 0) {
                int currentChunk = Math.min(chunkSize, remainingMonths);
                BigDecimal billAmount = monthlyFee.multiply(new BigDecimal(currentChunk));

                billService.createAccommodationBill(
                        event.getAssignmentId(),
                        null, // Đơn gia hạn không gắn với ApplicationId (Registration) của năm đầu
                        event.getStudentId(),
                        billAmount,
                        currentDelay
                );
                remainingMonths -= currentChunk;
                currentDelay += currentChunk;
            }

            log.info("[BillGenerationListener] Successfully created chunked accommodation bills for extensionId={}",
                    event.getExtensionId());

        } catch (Exception e) {
            log.error("[BillGenerationListener] Failed to create bill for extensionId={}. Reason: {}",
                    event.getExtensionId(), e.getMessage(), e);
        }
    }
}
