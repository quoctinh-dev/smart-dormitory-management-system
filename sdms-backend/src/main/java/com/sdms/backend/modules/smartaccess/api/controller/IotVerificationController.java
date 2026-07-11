package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.event.IdentityVerifiedEvent;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;
import com.sdms.backend.modules.smartaccess.domain.enums.AccessDecision;
import com.sdms.backend.modules.smartaccess.application.service.AccessEvaluationService;
import com.sdms.backend.modules.smartaccess.application.service.EligibilityEvaluationService;
import com.sdms.backend.modules.face.service.FaceVerificationService;
import com.sdms.backend.common.response.ApiResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/smartaccess")
@RequiredArgsConstructor
public class IotVerificationController {

    private final ApplicationEventPublisher eventPublisher;
    private final AccessEvaluationService accessEvaluationService;
    private final FaceVerificationService faceVerificationService;
    private final EligibilityEvaluationService eligibilityEvaluationService;
    /**
     * Endpoint for IoT ESP32 to send RFID card verification requests.
     */
    @PostMapping("/verify/card")
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyCard(@RequestBody Map<String, String> payload) {
        String rfidCode = payload.get("rfid");
        String gateIdStr = payload.get("gateId");

        log.info("[IoT] Received RFID verification request: rfid={}, gateId={}", rfidCode, gateIdStr);

        // Validate RFID code exists and belongs to an ACTIVE student
        var eligibilityOpt = eligibilityEvaluationService.evaluateEligibilityByRfid(rfidCode);
        if (eligibilityOpt.isEmpty()) {
            log.warn("[IoT] RFID verification failed for card: {}. Not found or inactive.", rfidCode);
            return ResponseEntity.ok(new ApiResponse<>(
                    false,
                    "Card not recognized or inactive",
                    Map.of("status", "DENIED"),
                    "IOT_CARD_NOT_FOUND"
            ));
        }

        UUID studentId = eligibilityOpt.get().getStudentId();
        UUID gateId = gateIdStr != null ? UUID.fromString(gateIdStr) : UUID.randomUUID();
        String eventId = UUID.randomUUID().toString();

        eventPublisher.publishEvent(new IdentityVerifiedEvent(
                eventId,
                studentId,
                gateId,
                VerificationMethod.RFID
        ));

        return ResponseEntity.ok(ApiResponse.success(
                "Verification request received and event dispatched",
                Map.of("status", "PROCESSING", "eventId", eventId)
        ));
    }

    /**
     * Endpoint for IoT ESP32 to download the RFID whitelist for offline fallback mode.
     */
    @GetMapping("/rfid-whitelist")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRfidWhitelist() {
        log.info("[IoT] Fetching RFID Whitelist for offline mode sync");
        java.util.List<String> rfids = eligibilityEvaluationService.getActiveRfidWhitelists();
        
        return ResponseEntity.ok(ApiResponse.success(
            "Whitelist fetched successfully",
            Map.of("count", rfids.size(), "data", rfids)
        ));
    }

    /**
     * Endpoint for IoT ESP32 to send Face Image verification requests.
     * Synchronous processing: Wait for AI response and access policy evaluation.
     */
    @PostMapping("/verify/face")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyFace(
            @RequestParam("file") MultipartFile file,
            @RequestParam("gateId") String gateIdStr) {
            
        log.info("[IoT] Received Face verification request from ESP32: gateId={}", gateIdStr);

        try {
            // 1. Delegate to Face Module for vector extraction and DB matching
            var result = faceVerificationService.verifyFace(gateIdStr, file);
            
            if (result.isMatch()) {
                // 2. Face matched! Now evaluate curfew and time window policies synchronously
                UUID gateId = gateIdStr != null ? UUID.fromString(gateIdStr) : UUID.randomUUID();
                AccessDecision decision = accessEvaluationService.evaluateAccessSync(result.matchedProfileId(), gateId, VerificationMethod.FACE_AI);
                
                // 3. Return immediate result to ESP32 to trigger Relay
                if (decision == AccessDecision.GRANTED) {
                    return ResponseEntity.ok(ApiResponse.success(
                        "Face match and policy allowed",
                        Map.of("status", "GRANTED", "profileId", result.matchedProfileId(), "confidence", result.confidenceScore())
                    ));
                } else {
                    return ResponseEntity.ok(new ApiResponse<>(
                        false,
                        "Face matched but access denied by policy",
                        Map.of("status", "DENIED"),
                        "IOT_ACCESS_DENIED_POLICY"
                    ));
                }
            } else {
                return ResponseEntity.ok(new ApiResponse<>(
                    false,
                    "Face not recognized",
                    Map.of("status", "DENIED"),
                    "IOT_FACE_UNRECOGNIZED"
                ));
            }
        } catch (Exception e) {
            log.error("[IoT] Exception during face verification: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ApiResponse<>(
                false,
                "AI Engine Down or Internal Error",
                Map.of("status", "ERROR"),
                "IOT_INTERNAL_SERVER_ERROR"
            ));
        }
    }

    /**
     * Endpoint for IoT ESP32 DevKit V1 (Room Door) to verify PIN code.
     * Used by keypad-based room door devices.
     */
    @PostMapping("/verify/pin")
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyPin(@RequestBody Map<String, String> payload) {
        String pinCode = payload.get("pinCode");
        String gateIdStr = payload.get("gateId");

        log.info("[IoT] Received PIN verification request: gateId={}", gateIdStr);

        if (pinCode == null || pinCode.isBlank()) {
            return ResponseEntity.ok(new ApiResponse<>(
                false, "PIN code is required", Map.of("status", "DENIED"), "IOT_INVALID_PIN"
            ));
        }

        UUID gateId;
        try {
            gateId = UUID.fromString(gateIdStr);
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(
                false, "Invalid gate ID", Map.of("status", "DENIED"), "UNREGISTERED_OR_INACTIVE_GATE"
            ));
        }

        // Evaluate PIN against the room's assigned students
        var eligibilityOpt = eligibilityEvaluationService.evaluateEligibilityByPin(pinCode, gateId);
        if (eligibilityOpt.isEmpty()) {
            log.warn("[IoT] PIN verification failed for gateId={}. No matching active student.", gateIdStr);
            return ResponseEntity.ok(new ApiResponse<>(
                false, "Incorrect PIN or no active assignment for this room",
                Map.of("status", "DENIED"), "IOT_PIN_NOT_FOUND"
            ));
        }

        UUID studentId = eligibilityOpt.get().getStudentId();
        AccessDecision decision = accessEvaluationService.evaluateAccessSync(studentId, gateId, VerificationMethod.PIN);

        if (decision == AccessDecision.GRANTED) {
            log.info("[IoT] PIN GRANTED for studentId={} at gateId={}", studentId, gateIdStr);
            return ResponseEntity.ok(ApiResponse.success(
                "PIN verified and access granted",
                Map.of("status", "GRANTED", "studentId", studentId.toString())
            ));
        } else {
            log.warn("[IoT] PIN matched but ACCESS DENIED by policy for studentId={}", studentId);
            return ResponseEntity.ok(new ApiResponse<>(
                false, "Access denied by security policy",
                Map.of("status", "DENIED"), "IOT_ACCESS_DENIED_POLICY"
            ));
        }
    }
}
