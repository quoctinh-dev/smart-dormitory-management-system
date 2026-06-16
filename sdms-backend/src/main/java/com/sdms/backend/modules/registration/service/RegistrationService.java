package com.sdms.backend.modules.registration.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.registration.dto.request.CheckEligibilityRequest;
import com.sdms.backend.modules.registration.dto.response.CheckEligibilityResponse;
import com.sdms.backend.modules.registration.entity.RegistrationEligibility;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.enums.RegistrationType;
import com.sdms.backend.modules.registration.repository.RegistrationEligibilityRepository;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegistrationService {

    private final RegistrationPeriodRepository registrationPeriodRepository;
    private final RegistrationEligibilityRepository registrationEligibilityRepository;

    /**
     * Lấy đợt đăng ký đang active.
     */
    private RegistrationPeriod getActivePeriod() {
        LocalDateTime now = LocalDateTime.now();
        return registrationPeriodRepository
                .findByIsActiveTrueAndStartDateBeforeAndEndDateAfter(now, now)
                .orElseThrow(() -> new AppException(
                        "Hiện tại không có đợt đăng ký nào đang mở.",
                        HttpStatus.NOT_FOUND
                ));
    }

    /**
     * Kiểm tra điều kiện đăng ký của sinh viên.
     */
    public CheckEligibilityResponse checkEligibility(CheckEligibilityRequest request) {
        RegistrationPeriod activePeriod = getActivePeriod();

        // 1. Nếu là đợt tự do, mặc định hợp lệ
        if (activePeriod.getRegistrationType() == RegistrationType.OPEN_REGISTRATION) {
            return CheckEligibilityResponse.builder()
                    .eligible(true)
                    .periodName(activePeriod.getPeriodName())
                    .registrationType(activePeriod.getRegistrationType().name())
                    .message("Đợt đăng ký tự do, tất cả sinh viên đều đủ điều kiện.")
                    .build();
        }

        // 2. Nếu là đợt có giới hạn, kiểm tra danh sách eligible
        Optional<RegistrationEligibility> eligibilityOpt = registrationEligibilityRepository
                .findByRegistrationPeriod_PeriodIdAndCccd(
                        activePeriod.getPeriodId(),
                        request.getCccd()
                );

        if (eligibilityOpt.isPresent()) {
            RegistrationEligibility eligibility = eligibilityOpt.get();
            return CheckEligibilityResponse.builder()
                    .eligible(true)
                    .periodName(activePeriod.getPeriodName())
                    .registrationType(activePeriod.getRegistrationType().name())
                    .fullName(eligibility.getFullName())
                    .message("Bạn đủ điều kiện tham gia đợt đăng ký này.")
                    .build();
        } else {
            return CheckEligibilityResponse.builder()
                    .eligible(false)
                    .periodName(activePeriod.getPeriodName())
                    .registrationType(activePeriod.getRegistrationType().name())
                    .message("Bạn không có trong danh sách đủ điều kiện của đợt đăng ký này.")
                    .build();
        }
    }
}
