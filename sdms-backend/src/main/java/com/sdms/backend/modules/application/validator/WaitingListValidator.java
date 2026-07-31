package com.sdms.backend.modules.application.validator;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Validator chuyên trách quản lý quy trình Hàng đợi (Waiting List) và Thăng hạng hồ sơ.
 * <p>
 * Đảm bảo tính nhất quán một chiều của luồng hồ sơ, ngăn chặn vòng lặp thăng hạng vô hạn,
 * và xác thực các điều kiện giải phóng tài nguyên phòng khi hết hạn thanh toán.
 */
@Component
public class WaitingListValidator {

    /**
     * Kiểm tra điều kiện gia nhập Hàng đợi (Waiting List Eligibility).
     * <p>
     * Chỉ những hồ sơ đã qua vòng xét duyệt của Hội đồng tuyển sinh (APPROVED)
     * nhưng KTX đã hết giường trống mới đủ điều kiện chuyển sang danh sách chờ.
     *
     * @param application Hồ sơ đăng ký KTX cần kiểm tra
     * @throws AppException Nếu hồ sơ không ở trạng thái APPROVED (ErrorCode.VALIDATION_FAILED)
     */
    public void validateWaitingListEligibility(DormitoryApplication application) {
        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Lỗi xét duyệt. Chỉ hồ sơ ở trạng thái 'APPROVED' mới đủ điều kiện vào hàng đợi.");
        }
    }

    /**
     * Kiểm tra tính hợp lệ của ứng viên trước khi Thăng hạng (Promote Candidate).
     * <p>
     * Xác thực hồ sơ đang thực sự nằm trong danh sách chờ (WAITING_LIST)
     * và chặn đứng nguy cơ thăng hạng lặp lại bằng cách kiểm tra cờ {@code waitingListUsed}.
     *
     * @param application Hồ sơ ứng viên cần thăng hạng
     * @throws AppException Nếu hồ sơ không nằm trong danh sách chờ hoặc đã từng được thăng hạng trước đó
     */
    public void validatePromotionCandidate(DormitoryApplication application) {
        if (application.getStatus() != ApplicationStatus.WAITING_LIST) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Lỗi thăng hạng. Hồ sơ ứng viên không còn ở trạng thái 'WAITING_LIST'.");
        }

        if (Boolean.TRUE.equals(application.getWaitingListUsed())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Vi phạm chính sách. Hồ sơ này đã sử dụng lượt thăng hạng duy nhất trong vòng đời.");
        }
    }

    /**
     * Kiểm tra điều kiện thu hồi/giải phóng chỗ ở do hết hạn thanh toán (Payment Expiration).
     * <p>
     * Ràng buộc chặt chẽ tính toàn vẹn dữ liệu:
     * 1. Trạng thái giữ chỗ phải là RESERVED.
     * 2. Phải có liên kết tới hồ sơ gốc (DormitoryApplication).
     * 3. Thời hạn thanh toán (paymentDeadline) không được null.
     * 4. Thời điểm hiện tại phải vượt quá thời hạn thanh toán quy định.
     *
     * @param assignment Phiên giữ chỗ phòng của sinh viên
     * @throws AppException Nếu không thỏa mãn bất kỳ điều kiện thu hồi tài nguyên nào ở trên
     */
    public void validateCanExpire(StudentHousingAssignment assignment) {
        // 1. Kiểm tra trạng thái cốt lõi của phiên gán phòng
        if (assignment.getStatus() != AssignmentStatus.RESERVED) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Lỗi vòng đời. Chỉ các bản ghi ở trạng thái 'RESERVED' mới có thể thực hiện thu hồi.");
        }

        // 2. Đảm bảo mối liên kết thực thể (Foreign Key) bắt buộc phải tồn tại
        DormitoryApplication application = assignment.getApplication();
        if (application == null) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi toàn vẹn dữ liệu. Bản ghi giữ chỗ thiếu tham chiếu tới Hồ sơ đăng ký gốc.");
        }

        // 3. Khóa chặt trường điều hướng thời gian, loại bỏ hoàn toàn khả năng lọt bản ghi null deadline
        if (application.getPaymentDeadline() == null) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi vận hành. Phiên giữ chỗ thiếu mốc thời gian hạn chót thanh toán (paymentDeadline).");
        }

        // 4. Đối soát mốc thời gian thực tế để cho phép kích hoạt lệnh hủy giữ chỗ
        if (LocalDateTime.now().isBefore(application.getPaymentDeadline())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chưa đủ điều kiện. Thời hạn thanh toán cho phiên giữ chỗ này vẫn chưa quá hạn.");
        }
    }
}