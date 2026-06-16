package com.sdms.backend.modules.registration.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.registration.dto.request.CheckEligibilityRequest;
import com.sdms.backend.modules.registration.dto.response.CheckEligibilityResponse;
import com.sdms.backend.modules.registration.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/check-eligibility")
    public ResponseEntity<ApiResponse<CheckEligibilityResponse>>
    checkEligibility(
            @Valid
            @RequestBody
            CheckEligibilityRequest request
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Kiểm tra điều kiện thành công",
                        registrationService.checkEligibility(request)
                )
        );
    }
}