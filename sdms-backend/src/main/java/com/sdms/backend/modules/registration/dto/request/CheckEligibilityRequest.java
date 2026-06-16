package com.sdms.backend.modules.registration.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckEligibilityRequest {

    @NotBlank(message = "CCCD is required")
    private String cccd;
}