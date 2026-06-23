package com.sdms.backend.modules.application.validator;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Validator chuyên trách quản lý trạng thái Hàng đợi và Thăng hạng (Waiting List Layer - SDMS V1).
 * Đảm bảo tính nhất quán một chiều của luồng hồ sơ, chặn đứng vòng lặp vô hạn và chuẩn bị hạ tầng cho ROOM-05 Job Engine.
 */
@Component
public class WaitingListValidator {

    /**
     * VALIDATION 1: Kiểm tra điều kiện gia nhập Hàng đợi (Waiting List Eligibility).
     * Chỉ hồ sơ đã qua vòng xét duyệt của Hội đồng tuyển sinh (APPROVED) nhưng KTX cạn kiệt giường trống mới được xếp hàng chờ.
     */
    public void validateWaitingListEligibility(DormitoryApplication application) {
        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new AppException(
                    "Admission error. Only applications with 'APPROVED' status are eligible to enter the waiting list queue.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * VALIDATION 2 & 4: Kiểm tra tính hợp lệ trước khi Thăng hạng (Promote Candidate) & Chặn Vòng lặp Vô hạn.
     * Xác thực hồ sơ đang thực sự xếp hàng chờ và chưa từng được thăng hạng thành công trong quá khứ.
     */
    public void validatePromotionCandidate(DormitoryApplication application) {
        if (application.getStatus() != ApplicationStatus.WAITING_LIST) {
            throw new AppException(
                    "Promotion error. Candidate application is no longer in active 'WAITING_LIST' status.",
                    HttpStatus.BAD_REQUEST
            );
        }

        if (Boolean.TRUE.equals(application.getWaitingListUsed())) {
            throw new AppException(
                    "Security restriction. This application has already utilized its single allowed waiting list promotion lifecycle loop.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * VALIDATION 3 & 6: Chốt chặn kiểm tra giải phóng giữ chỗ (Payment Expire Validation).
     * ISSUE FIXED: Siết chặt kiểm tra cấu trúc dữ liệu liên kết. Tuyệt đối không cho phép bỏ qua
     * nếu dữ liệu Deadline bị null, chặn đứng nguy cơ treo tài nguyên hệ thống vật lý.
     */
    public void validateCanExpire(StudentHousingAssignment assignment) {
        // 1. Kiểm tra trạng thái cốt lõi của phiên gán phòng
        if (assignment.getStatus() != AssignmentStatus.RESERVED) {
            throw new AppException(
                    "Lifecycle error. Cannot expire housing assignment. Only 'RESERVED' accounts are eligible for resource release.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // 2. Đảm bảo mối liên kết thực thể (Foreign Key Integrity) bắt buộc phải tồn tại
        DormitoryApplication application = assignment.getApplication();
        if (application == null) {
            throw new AppException(
                    "Data integrity violation. The housing assignment is missing its core reference to the original Dormitory Application.",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        // 3. Khóa chặt trường điều hướng thời gian, loại bỏ hoàn toàn khả năng lọt bản ghi null deadline
        if (application.getPaymentDeadline() == null) {
            throw new AppException(
                    "Operational failure. The active reservation is missing its mandatory payment deadline timestamp.",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        // 4. Đối soát mốc thời gian thực tế để cho phép kích hoạt lệnh hủy phòng
        if (LocalDateTime.now().isBefore(application.getPaymentDeadline())) {
            throw new AppException(
                    "Operational restriction. The designated payment deadline for this reservation has not been breached yet.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }
}