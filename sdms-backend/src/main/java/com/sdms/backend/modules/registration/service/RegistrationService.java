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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Mục tiêu/Nghiệp vụ: Quản lý các đợt đăng ký KTX và kiểm tra điều kiện (Eligibility) của sinh viên trước khi họ được phép tạo đơn.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegistrationService {

    private final RegistrationPeriodRepository registrationPeriodRepository;
    private final RegistrationEligibilityRepository registrationEligibilityRepository;
    private final RegistrationOtpService registrationOtpService;

    /**
     * Lấy đợt đăng ký đang active (Đã bọc lót chống lỗi Overlap thời gian).
     */
    private RegistrationPeriod getActivePeriod() {
        LocalDateTime now = LocalDateTime.now();

        List<RegistrationPeriod> activePeriods = registrationPeriodRepository
                .findByIsActiveTrueAndStartDateBeforeAndEndDateAfter(now, now);

        if (activePeriods.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Hiện tại không có đợt đăng ký nào đang mở.");
        }

        return activePeriods.get(0);
    }

    /**
     * Lấy thông tin đợt đăng ký đang active cho client.
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
     * Kiểm tra điều kiện đăng ký của sinh viên.
     */
    public CheckEligibilityResponse checkEligibility(CheckEligibilityRequest request) {
        RegistrationPeriod activePeriod = getActivePeriod();

        // 1. Xác thực OTP trước khi cho phép kiểm tra danh sách
        registrationOtpService.verifyOtp(request.getEmail(), request.getOtp());

        // 2. Nếu là đợt tự do, mặc định hợp lệ
        if (activePeriod.getRegistrationType() == RegistrationType.OPEN_REGISTRATION) {
            return CheckEligibilityResponse.builder()
                    .eligible(true)
                    .periodId(activePeriod.getPeriodId())
                    .periodName(activePeriod.getPeriodName())
                    .registrationType(activePeriod.getRegistrationType().name())
                    // Đợt tự do thường áp dụng cho tất cả đối tượng cư dân cũ + mới
                    .target("ALL")
                    .message("Xác thực thành công. Đợt đăng ký tự do đang mở.")
                    .build();
        }

        // 3. Nếu là đợt có giới hạn, kiểm tra danh sách eligible
        Optional<RegistrationEligibility> eligibilityOpt = registrationEligibilityRepository
                .findByRegistrationPeriod_PeriodIdAndEmail(
                        activePeriod.getPeriodId(),
                        request.getEmail()
                );

        if (eligibilityOpt.isPresent()) {
            RegistrationEligibility eligibility = eligibilityOpt.get();
            return CheckEligibilityResponse.builder()
                    .eligible(true)
                    .periodId(activePeriod.getPeriodId())
                    .periodName(activePeriod.getPeriodName())
                    .registrationType(activePeriod.getRegistrationType().name())
                    .fullName(eligibility.getFullName())
                    .target(eligibility.getTarget() != null ? eligibility.getTarget().name() : "ALL")
                    .message("Xác thực thành công. Bạn đủ điều kiện đăng ký.")
                    .build();
        } else {
            return CheckEligibilityResponse.builder()
                    .eligible(false)
                    .periodId(activePeriod.getPeriodId())
                    .periodName(activePeriod.getPeriodName())
                    .registrationType(activePeriod.getRegistrationType().name())
                    .message("Xác thực thành công nhưng email của bạn không nằm trong danh sách cho đợt này.")
                    .build();
        }
    }
}