package com.sdms.backend.modules.room.scheduler;

import com.sdms.backend.modules.student.entity.CheckoutRequest;
import com.sdms.backend.modules.student.enums.CheckoutStatus;
import com.sdms.backend.modules.student.repository.CheckoutRequestRepository;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class HousingAssignmentScheduler {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final HousingAssignmentService housingAssignmentService;
    private final CheckoutRequestRepository checkoutRequestRepository;

    /**
     * [LUẬT LƯU TRÚ ĐÚNG HẠN]
     * Chạy vào lúc 00:01 mỗi ngày.
     * Tìm tất cả các sinh viên đang ở (OCCUPIED) nhưng Kỳ đăng ký đã kết thúc.
     * Tự động Checkout và thu hồi quyền (FaceID/Thẻ) mà KHÔNG CẦN SINH VIÊN LÀM ĐƠN.
     */
    @Scheduled(cron = "0 1 0 * * ?") // 00:01 AM every day
    public void autoCheckoutExpiredAssignments() {
        log.info("[BATCH JOB] Bắt đầu quét các hợp đồng lưu trú đã hết hạn...");
        
        // Tìm các assignment đang ở (OCCUPIED) mà stayEndDate của Đợt đăng ký đã qua
        List<StudentHousingAssignment> expiredAssignments = assignmentRepository
                .findByStatusAndApplication_RegistrationPeriod_StayEndDateBefore(AssignmentStatus.OCCUPIED, java.time.LocalDateTime.now());

        if (expiredAssignments.isEmpty()) {
            log.info("[BATCH JOB] Không có hợp đồng nào hết hạn hôm nay.");
            return;
        }

        int count = 0;
        for (StudentHousingAssignment assignment : expiredAssignments) {
            try {
                log.info("Auto checking out assignment {} for student {}", 
                    assignment.getAssignmentId(), 
                    assignment.getStudent().getStudentCode());
                    
                // 1. Tạo một Đơn Checkout tự động để lưu lịch sử cho Admin thấy trên Web
                CheckoutRequest autoRequest = new CheckoutRequest();
                autoRequest.setStudent(assignment.getStudent());
                autoRequest.setAssignment(assignment);
                autoRequest.setIntendedCheckoutDate(java.time.LocalDateTime.now());
                autoRequest.setReason("Hệ thống tự động Checkout do hết hạn lưu trú");
                autoRequest.setStatus(CheckoutStatus.COMPLETED); // Đánh dấu hoàn tất luôn vì không có hoàn tiền
                checkoutRequestRepository.save(autoRequest);

                // 2. Gọi hàm checkOut có sẵn (đã bao gồm giải phóng giường và bắn Event thu hồi RFID)
                housingAssignmentService.checkOut(assignment.getAssignmentId());
                count++;
            } catch (Exception e) {
                log.error("Lỗi khi auto checkout assignment {}: {}", assignment.getAssignmentId(), e.getMessage());
            }
        }
        
        log.info("[BATCH JOB] Đã tự động Checkout thành công {}/{} hợp đồng hết hạn.", count, expiredAssignments.size());
    }
}
