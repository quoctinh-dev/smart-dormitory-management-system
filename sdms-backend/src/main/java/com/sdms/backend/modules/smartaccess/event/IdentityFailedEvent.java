package com.sdms.backend.modules.smartaccess.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class IdentityFailedEvent {
    private final String eventId;
    private final UUID gateId;
    private final VerificationMethod method;
    
    // GOVERNANCE NOTE:
    // Biometric details (e.g. spoofing score) belong to Face Module.
    // Smart Access only requires the fact that it failed.
}
