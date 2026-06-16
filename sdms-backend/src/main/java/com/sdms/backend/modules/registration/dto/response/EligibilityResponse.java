package com.sdms.backend.modules.registration.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EligibilityResponse {

    private UUID eligibilityId;

    private String cccd;

    private String fullName;
}