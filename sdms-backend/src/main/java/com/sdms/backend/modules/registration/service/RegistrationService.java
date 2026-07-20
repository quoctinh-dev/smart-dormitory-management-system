package com.sdms.backend.modules.registration.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.registration.dto.request.CheckEligibilityRequest;
import com.sdms.backend.modules.registration.dto.response.CheckEligibilityResponse;
import com.sdms.backend.modules.registration.dto.response.RegistrationPeriodResponse;
import com.sdms.backend.modules.registration.entity.RegistrationEligibility;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.enums.RegistrationType;
import com.sdms.backend.modules.registration.repository.RegistrationEligibilityRepository;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service quản lý nghiệp vụ đăng ký Ký túc xá.
 * <p>
 * Đảm nhận vai trò điều phối thông tin các đợt đăng ký đang hoạt động và kiểm tra
 * điều kiện (Eligibility) của sinh viên trước khi cho phép tạo đơn chính thức.
 * </p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegistrationService {

    private final RegistrationPeriodRepository registrationPeriodRepository;
    private final RegistrationEligibilityRepository registrationEligibilityRepository;
    private final RegistrationOtpService registrationOtpService;
    private final DormitoryApplicationRepository applicationRepository;

    /**
     * Truy xuất đợt đăng ký đang trong thời gian hoạt động (Active).
     *
     * @return {@link RegistrationPeriod} Đợt đăng ký hợp lệ hiện tại
     * @throws AppException Nếu không tìm thấy đợt đăng ký nào đang mở (RESOURCE_NOT_FOUND)
     */
    private RegistrationPeriod getActivePeriod() {
        LocalDateTime now = LocalDateTime.now();

        List<RegistrationPeriod> activePeriods = registrationPeriodRepository
                .findByIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(now, now);

        if (activePeriods.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hiện tại không có đợt đăng ký nào đang mở.");
        }

        // Đã bọc lót cơ chế chống Overlap thời gian ở tầng Admin cấu hình, lấy bản ghi đầu tiên
        return activePeriods.get(0);
    }

    /**
     * Lấy thông tin chi tiết của đợt đăng ký đang hoạt động để hiển thị lên Client.
     *
     * @return {@link RegistrationPeriodResponse} DTO chứa thông tin tổng quan của đợt đăng ký
     */
    public RegistrationPeriodResponse getActiveRegistrationPeriod() {
        RegistrationPeriod p = getActivePeriod();
        return new RegistrationPeriodResponse(
                p.getPeriodId(),
                p.getPeriodName(),
                p.getRegistrationType(),
                p.getStartDate(),
                p.getEndDate(),
                p.getIsActive(),
                p.getStayStartDate(),
                p.getStayEndDate()
        );
    }

    /**
     * Tiếp nhận yêu cầu gửi mã OTP xác thực email từ sinh viên.
     * <p>
     * Trước khi gửi OTP, hệ thống sẽ kiểm tra xem sinh viên đã có đơn đăng ký nào
     * hợp lệ trong đợt này hay chưa để tránh spam dữ liệu.
     * </p>
     *
     * @param email Email trường cấp của sinh viên cần nhận OTP
     * @throws AppException Nếu sinh viên đã có đơn đăng ký hợp lệ xử lý trong đợt (DATA_CONFLICT)
     */
    public void requestOtp(String email) {
        RegistrationPeriod activePeriod = getActivePeriod();

        // Kiểm tra xem sinh viên đã nộp đơn cho đợt này chưa
        validateExistingApplication(email, activePeriod.getPeriodId());

        registrationOtpService.generateAndSendOtp(email);
    }

    /**
     * Thẩm định điều kiện đăng ký Ký túc xá của sinh viên.
     * <p>
     * Luồng xử lý bao gồm:
     * 1. Xác thực mã OTP gửi qua Email.<br>
     * 2. Kiểm tra trùng lặp đơn đăng ký trong cùng một đợt.<br>
     * 3. Phân tách nghiệp vụ kiểm tra điều kiện theo từng loại hình tuyển sinh:
     *    - Đợt GIA HẠN (CURRENT_RESIDENT): Mặc định được phép qua bước này (Hệ thống sẽ check sâu hơn ở tầng tạo đơn).<br>
     *    - Đợt GIỚI HẠN: Kiểm tra sự tồn tại trong danh sách Whitelist (RegistrationEligibility).<br>
     *    - Đợt TỰ DO (OPEN_REGISTRATION): Nếu nằm trong Whitelist thì lấy thông tin cấu hình sẵn, nếu không vẫn cho qua dưới diện tự do.
     * </p>
     *
     * @param request DTO chứa Email, OTP cần thẩm định
     * @return {@link CheckEligibilityResponse} Kết quả thẩm định chi tiết cùng thông tin sinh viên đi kèm (nếu có)
     */
    public CheckEligibilityResponse checkEligibility(CheckEligibilityRequest request) {
        RegistrationPeriod activePeriod = getActivePeriod();
        String email = request.getEmail();

        // 1. Xác thực OTP
        registrationOtpService.verifyOtp(email, request.getOtp());

        // 2. Kiểm tra trạng thái đơn đăng ký cũ trong đợt
        validateExistingApplication(email, activePeriod.getPeriodId());

        // 3. Xử lý nghiệp vụ theo loại hình đợt đăng ký (RegistrationType)

        // Trường hợp 3.1: Đợt dành cho sinh viên đang nội trú gia hạn hợp đồng
        if (activePeriod.getRegistrationType() == RegistrationType.CURRENT_RESIDENT) {
            return buildBaseResponse(activePeriod, true, "CURRENT_RESIDENT", "Xác thực thành công. Đợt gia hạn đang mở.")
                    .build();
        }

        // Trường hợp 3.2: Kiểm tra danh sách Whitelist được phê duyệt trước
        Optional<RegistrationEligibility> eligibilityOpt = registrationEligibilityRepository
                .findByRegistrationPeriod_PeriodIdAndEmail(activePeriod.getPeriodId(), email);

        if (eligibilityOpt.isPresent()) {
            RegistrationEligibility eligibility = eligibilityOpt.get();
            return buildBaseResponse(activePeriod, true,
                    eligibility.getTarget() != null ? eligibility.getTarget().name() : "ALL",
                    "Xác thực thành công. Bạn đủ điều kiện đăng ký.")
                    .fullName(eligibility.getFullName())
                    .cccd(eligibility.getCccd())
                    .studentCode(eligibility.getStudentCode())
                    .build();
        }

        // Trường hợp 3.3: Đợt đăng ký đại trà/tự do (Không nằm trong Whitelist vẫn được đăng ký)
        if (activePeriod.getRegistrationType() == RegistrationType.OPEN_REGISTRATION) {
            return buildBaseResponse(activePeriod, true, "ALL", "Xác thực thành công. Đợt đăng ký tự do đang mở.")
                    .build();
        }

        // Trường hợp 3.4: Không thỏa mãn bất kỳ điều kiện nào của đợt giới hạn
        return buildBaseResponse(activePeriod, false, null, "Xác thực thành công nhưng email của bạn không nằm trong danh sách cho đợt này.")
                .build();
    }

    /**
     * Hàm Helper kiểm tra đơn đăng ký trùng lặp của sinh viên trong một đợt.
     */
    private void validateExistingApplication(String email, UUID periodId) {
        Optional<DormitoryApplication> existingApp = applicationRepository
                .findByEmailAndRegistrationPeriod_PeriodId(email, periodId);

        if (existingApp.isPresent() && existingApp.get().getStatus() != ApplicationStatus.PENDING) {
            throw new AppException(ErrorCode.DATA_CONFLICT,
                    "Bạn đã nộp đơn đăng ký cho đợt này rồi. Vui lòng vào trang Tra cứu trạng thái để xem thông tin.");
        }
    }

    /**
     * Hàm Helper khởi tạo Builder chung cho kết quả trả về CheckEligibilityResponse.
     */
    private CheckEligibilityResponse.CheckEligibilityResponseBuilder buildBaseResponse(
            RegistrationPeriod period, boolean isEligible, String target, String message) {
        return CheckEligibilityResponse.builder()
                .eligible(isEligible)
                .periodId(period.getPeriodId())
                .periodName(period.getPeriodName())
                .registrationType(period.getRegistrationType().name())
                .target(target)
                .message(message);
    }
}