package com.sdms.backend.modules.smartaccess.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class IdentityVerifiedEvent {
    private final String eventId;
    private final UUID studentId;
    private final UUID gateId;
    private final VerificationMethod method;
}
