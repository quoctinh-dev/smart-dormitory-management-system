package com.sdms.backend.modules.registration.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.registration.dto.request.CheckEligibilityRequest;
import com.sdms.backend.modules.registration.dto.request.SendOtpRequest;
import com.sdms.backend.modules.registration.dto.response.CheckEligibilityResponse;
import com.sdms.backend.modules.registration.dto.response.RegistrationPeriodResponse;
import com.sdms.backend.modules.registration.service.RegistrationOtpService;
import com.sdms.backend.modules.registration.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
@Tag(name = "Đăng ký lưu trú (Registration)", description = "API cho sinh viên đăng ký lưu trú")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final RegistrationOtpService registrationOtpService;

    @Operation(summary = "Yêu cầu gửi mã OTP để xác thực Email trước khi đăng ký")
    @PostMapping("/request-otp")
    public ApiResponse<Void> requestOtp(@Valid @RequestBody SendOtpRequest request) {
        registrationService.requestOtp(request.getEmail());
        return ApiResponse.success("Mã OTP đã được gửi đến email của bạn", null);
    }

    @Operation(summary = "Kiểm tra điều kiện đăng ký của sinh viên (Kèm xác thực OTP)")
    @PostMapping("/check-eligibility")
    public ApiResponse<CheckEligibilityResponse> checkEligibility(
            @Valid @RequestBody CheckEligibilityRequest request
    ) {
        return ApiResponse.success(
                "Kiểm tra điều kiện thành công",
                registrationService.checkEligibility(request)
        );
    }

    @Operation(summary = "Lấy thông tin đợt đăng ký đang mở")
    @GetMapping("/active")
    public ApiResponse<RegistrationPeriodResponse> getActivePeriod() {
        return ApiResponse.success(
                "Lấy đợt đăng ký đang mở thành công",
                registrationService.getActiveRegistrationPeriod()
        );
    }
}