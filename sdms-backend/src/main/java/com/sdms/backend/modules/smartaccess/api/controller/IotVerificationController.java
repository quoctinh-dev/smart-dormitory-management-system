package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.event.IdentityVerifiedEvent;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/smartaccess")
@RequiredArgsConstructor
public class IotVerificationController {

    private final ApplicationEventPublisher eventPublisher;

    /**
     * Endpoint for IoT ESP32 to send RFID card verification requests.
     */
    @PostMapping("/verify/card")
    public ResponseEntity<Map<String, String>> verifyCard(@RequestBody Map<String, String> payload) {
        String rfidCode = payload.get("rfid");
        String gateIdStr = payload.get("gateId");

        log.info("[IoT] Received RFID verification request: rfid={}, gateId={}", rfidCode, gateIdStr);

        // For now, we simulate a successful lookup to ensure structural readiness.
        UUID fakeStudentId = UUID.randomUUID(); 
        UUID gateId = gateIdStr != null ? UUID.fromString(gateIdStr) : UUID.randomUUID();
        String eventId = UUID.randomUUID().toString();

        eventPublisher.publishEvent(new IdentityVerifiedEvent(
                eventId,
                fakeStudentId,
                gateId,
                VerificationMethod.RFID
        ));

        return ResponseEntity.ok(Map.of(
                "status", "PROCESSING",
                "message", "Verification request received and event dispatched",
                "eventId", eventId
        ));
    }
}
