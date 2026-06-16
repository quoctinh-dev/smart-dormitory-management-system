package com.sdms.backend.modules.registration.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckEligibilityResponse {

    private Boolean eligible;

    private String periodName;

    private String registrationType;

    private String fullName;

    private String message;
}
