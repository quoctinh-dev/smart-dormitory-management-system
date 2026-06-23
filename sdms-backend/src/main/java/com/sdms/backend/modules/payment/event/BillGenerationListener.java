package com.sdms.backend.modules.payment.event;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.payment.service.BillService;
import com.sdms.backend.modules.room.event.BedReservedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillGenerationListener {

    private final BillService billService;
    private final DormitoryApplicationRepository applicationRepository;

    @EventListener
    public void handleBedReserved(BedReservedEvent event) {
        log.info("Received BedReservedEvent for Application ID: {} and Assignment ID: {}", event.getApplicationId(), event.getAssignmentId());
        try {
            // Lấy thông tin hồ sơ để tính tiền
            DormitoryApplication application = applicationRepository.findById(event.getApplicationId())
                    .orElseThrow(() -> new AppException("Application not found", org.springframework.http.HttpStatus.NOT_FOUND));

            // TODO: Ở hệ thống thực tế, số tiền này phụ thuộc vào loại phòng. 
            // Tạm thời hardcode phí lưu trú 1 học kỳ
            BigDecimal amount = new BigDecimal("2500000");

            // Tạo Bill (Phase 4)
            billService.createAccommodationBill(event.getAssignmentId(), event.getApplicationId(), amount);
            log.info("Successfully created Accommodation Bill for Assignment ID: {}", event.getAssignmentId());

            // Đồng thời chuyển ApplicationStatus -> WAITING_PAYMENT
            application.setStatus(ApplicationStatus.WAITING_PAYMENT);
            // Có thể cho hạn đóng tiền 3 ngày
            application.setPaymentDeadline(java.time.LocalDateTime.now().plusDays(3));
            applicationRepository.save(application);
            
            log.info("Application {} status updated to WAITING_PAYMENT", event.getApplicationId());

        } catch (Exception e) {
            log.error("Failed to generate bill for BedReservedEvent: {}", e.getMessage());
        }
    }
}
