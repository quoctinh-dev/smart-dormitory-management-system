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
    private final com.sdms.backend.modules.student.repository.StayExtensionRepository stayExtensionRepository;

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
            
            // Tính toán Pro-rata (Tháng chẵn + Ngày lẻ)
            java.time.LocalDate start = period.getStayStartDate().toLocalDate();
            java.time.LocalDate end = period.getStayEndDate().toLocalDate().plusDays(1); // inclusive end
            java.time.Period stayPeriod = java.time.Period.between(start, end);

            int fullMonths = stayPeriod.getYears() * 12 + stayPeriod.getMonths();
            int extraDays = stayPeriod.getDays();
            
            BigDecimal monthlyFee = new BigDecimal(systemConfigService.getConfigValue("MONTHLY_ROOM_FEE", "350000"));
            BigDecimal dailyFee = monthlyFee.divide(new BigDecimal("30"), 0, java.math.RoundingMode.HALF_UP);
            
            // Lấy cấu hình số tháng mỗi đợt thanh toán (mặc định 3 tháng/quý)
            int chunkSize = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_CHUNK_MONTHS", "3"));
            int deadlineDays = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_DEADLINE_DAYS", "3"));
            
            int remainingMonths = fullMonths;
            int currentDelayMonths = 0; // Số tháng cộng dồn cho DueDate
            
            while (remainingMonths > 0 || extraDays > 0) {
                int currentChunkMonths = Math.min(chunkSize, remainingMonths);
                BigDecimal billAmount = monthlyFee.multiply(new BigDecimal(currentChunkMonths));
                
                remainingMonths -= currentChunkMonths;
                
                // Gom ngày lẻ vào chunk cuối cùng
                if (remainingMonths == 0 && extraDays > 0) {
                    billAmount = billAmount.add(dailyFee.multiply(new BigDecimal(extraDays)));
                    extraDays = 0; // consume days
                }

                if (billAmount.compareTo(BigDecimal.ZERO) == 0) break;

                // Đơn đầu tiên hoặc nếu hạn thanh toán bị lùi về quá khứ thì kẹp (clamp) về hiện tại
                java.time.LocalDate calculatedDueDate = start.plusMonths(currentDelayMonths).plusDays(deadlineDays);
                java.time.LocalDate minDueDate = java.time.LocalDate.now().plusDays(deadlineDays);

                java.time.LocalDate dueDate;
                if (currentDelayMonths == 0 || calculatedDueDate.isBefore(minDueDate)) {
                    dueDate = minDueDate;
                } else {
                    dueDate = calculatedDueDate;
                }

                billService.createAccommodationBill(
                        event.getAssignmentId(),
                        event.getApplicationId(),
                        null, // studentId is null for new assignments
                        billAmount,
                        dueDate
                );
                currentDelayMonths += currentChunkMonths;
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
            // [BUG FIX] Tìm StayExtension thay vì Assignment cũ để lấy đúng RegistrationPeriod của đợt gia hạn
            com.sdms.backend.modules.student.entity.StayExtension extension = stayExtensionRepository.findById(event.getExtensionId())
                    .orElseThrow(() -> new RuntimeException("Extension not found"));
            com.sdms.backend.modules.registration.entity.RegistrationPeriod period = extension.getRegistrationPeriod();
            
            // Tính toán Pro-rata (Tháng chẵn + Ngày lẻ)
            java.time.LocalDate start = period.getStayStartDate().toLocalDate();
            java.time.LocalDate end = period.getStayEndDate().toLocalDate().plusDays(1);
            java.time.Period stayPeriod = java.time.Period.between(start, end);

            int fullMonths = stayPeriod.getYears() * 12 + stayPeriod.getMonths();
            int extraDays = stayPeriod.getDays();
            
            BigDecimal monthlyFee = new BigDecimal(systemConfigService.getConfigValue("MONTHLY_ROOM_FEE", "350000"));
            BigDecimal dailyFee = monthlyFee.divide(new BigDecimal("30"), 0, java.math.RoundingMode.HALF_UP);
            
            // Lấy cấu hình số tháng mỗi đợt thanh toán (mặc định 3 tháng/quý)
            int chunkSize = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_CHUNK_MONTHS", "3"));
            int deadlineDays = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_DEADLINE_DAYS", "3"));
            
            int remainingMonths = fullMonths;
            int currentDelayMonths = 0; // Số tháng cộng dồn cho DueDate
            
            while (remainingMonths > 0 || extraDays > 0) {
                int currentChunkMonths = Math.min(chunkSize, remainingMonths);
                BigDecimal billAmount = monthlyFee.multiply(new BigDecimal(currentChunkMonths));
                
                remainingMonths -= currentChunkMonths;
                
                // Gom ngày lẻ vào chunk cuối cùng
                if (remainingMonths == 0 && extraDays > 0) {
                    billAmount = billAmount.add(dailyFee.multiply(new BigDecimal(extraDays)));
                    extraDays = 0; // consume days
                }

                if (billAmount.compareTo(BigDecimal.ZERO) == 0) break;

                // Đơn đầu tiên hoặc nếu hạn thanh toán bị lùi về quá khứ thì kẹp (clamp) về hiện tại
                java.time.LocalDate calculatedDueDate = start.plusMonths(currentDelayMonths).plusDays(deadlineDays);
                java.time.LocalDate minDueDate = java.time.LocalDate.now().plusDays(deadlineDays);

                java.time.LocalDate dueDate;
                if (currentDelayMonths == 0 || calculatedDueDate.isBefore(minDueDate)) {
                    dueDate = minDueDate;
                } else {
                    dueDate = calculatedDueDate;
                }

                billService.createAccommodationBill(
                        event.getAssignmentId(),
                        null, // Đơn gia hạn không gắn với ApplicationId (Registration) của năm đầu
                        event.getStudentId(),
                        billAmount,
                        dueDate
                );
                currentDelayMonths += currentChunkMonths;
            }

            log.info("[BillGenerationListener] Successfully created chunked accommodation bills for extensionId={}",
                    event.getExtensionId());

        } catch (Exception e) {
            log.error("[BillGenerationListener] Failed to create bill for extensionId={}. Reason: {}",
                    event.getExtensionId(), e.getMessage(), e);
        }
    }
}
