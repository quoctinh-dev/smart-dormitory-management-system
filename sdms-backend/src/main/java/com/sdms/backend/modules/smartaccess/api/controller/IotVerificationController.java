package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.sdms.backend.modules.smartaccess.event.IdentityVerifiedEvent;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;
import com.sdms.backend.modules.smartaccess.domain.enums.AccessDecision;
import com.sdms.backend.modules.smartaccess.application.service.AccessEvaluationService;
import com.sdms.backend.modules.smartaccess.application.service.EligibilityEvaluationService;
import com.sdms.backend.modules.face.service.FaceVerificationService;
import com.sdms.backend.modules.upload.service.CloudinaryService;
import com.sdms.backend.common.response.ApiResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/smartaccess")
@RequiredArgsConstructor
@Tag(name = "Xác thực IoT (IoT Verification)", description = "API dành riêng cho thiết bị IoT (ESP32) để xác thực Thẻ từ, Khuôn mặt, và Mã PIN")
public class IotVerificationController {

    private final ApplicationEventPublisher eventPublisher;
    private final AccessEvaluationService accessEvaluationService;
    private final FaceVerificationService faceVerificationService;
    private final EligibilityEvaluationService eligibilityEvaluationService;
    private final CloudinaryService cloudinaryService;
    /**
     * Endpoint for IoT ESP32 to send RFID card verification requests.
     */
    @Operation(summary = "Xác thực thẻ RFID", description = "IoT gửi mã thẻ RFID để xác thực mở cổng")
    @PostMapping("/verify/card")
    public ApiResponse<Map<String, String>> verifyCard(
            @RequestParam("rfid") String rfidCode,
            @RequestParam("gateId") String gateIdStr,
            @RequestParam(value = "snapshot", required = false) MultipartFile snapshot) {

        log.info("[IoT] Received RFID verification request: rfid={}, gateId={}, hasSnapshot={}", 
            rfidCode, gateIdStr, snapshot != null && !snapshot.isEmpty());

        // Validate RFID code exists and belongs to an ACTIVE student
        var eligibilityOpt = eligibilityEvaluationService.evaluateEligibilityByRfid(rfidCode);
        if (eligibilityOpt.isEmpty()) {
            log.warn("[IoT] RFID verification failed for card: {}. Not found or inactive.", rfidCode);
            return new ApiResponse<>(
                    false,
                    "Thẻ không hợp lệ hoặc không hoạt động",
                    Map.of("status", "DENIED"),
                    "IOT_CARD_NOT_FOUND"
            );
        }

        UUID studentId = eligibilityOpt.get().getStudentId();
        UUID gateId = gateIdStr != null ? UUID.fromString(gateIdStr) : UUID.randomUUID();
        String eventId = UUID.randomUUID().toString();
        
        // Upload snapshot to Cloudinary and get URL, then pass it to the Event/Service
        String snapshotUrl = null;
        if (snapshot != null && !snapshot.isEmpty()) {
            try {
                snapshotUrl = cloudinaryService.uploadFile(snapshot, "smart_access_snapshots");
                log.info("[IoT] Snapshot saved to Cloudinary: {}", snapshotUrl);
            } catch (Exception e) {
                log.error("[IoT] Failed to upload snapshot to Cloudinary", e);
            }
        }

        eventPublisher.publishEvent(new IdentityVerifiedEvent(
                eventId,
                studentId,
                gateId,
                VerificationMethod.RFID,
                snapshotUrl
        ));

        return ApiResponse.success(
                "Đã nhận yêu cầu xác thực thẻ",
                Map.of("status", "PROCESSING", "eventId", eventId)
        );
    }

    /**
     * Endpoint for IoT ESP32 to download the RFID whitelist for offline fallback mode.
     */
    @Operation(summary = "Lấy danh sách thẻ trắng", description = "Cung cấp danh sách thẻ RFID hợp lệ cho IoT lưu trữ Offline")
    @GetMapping("/rfid-whitelist")
    public ApiResponse<Map<String, Object>> getRfidWhitelist() {
        log.info("[IoT] Fetching RFID Whitelist for offline mode sync");
        java.util.List<String> rfids = eligibilityEvaluationService.getActiveRfidWhitelists();
        
        return ApiResponse.success(
            "Lấy danh sách whitelist thành công",
            Map.of("count", rfids.size(), "data", rfids)
        );
    }

    /**
     * Endpoint for IoT ESP32 to send Face Image verification requests.
     * Synchronous processing: Wait for AI response and access policy evaluation.
     */
    @Operation(summary = "Xác thực khuôn mặt", description = "IoT gửi ảnh khuôn mặt để AI phân tích và quyết định mở cổng")
    @PostMapping("/verify/face")
    public ApiResponse<Map<String, Object>> verifyFace(
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
                    return ApiResponse.success(
                        "Khuôn mặt hợp lệ và được phép ra vào",
                        Map.of("status", "GRANTED", "profileId", result.matchedProfileId(), "confidence", result.confidenceScore())
                    );
                } else {
                    return new ApiResponse<>(
                        false,
                        "Khuôn mặt đúng nhưng bị chặn bởi chính sách (Giờ giới nghiêm, v.v.)",
                        Map.of("status", "DENIED"),
                        "IOT_ACCESS_DENIED_POLICY"
                    );
                }
            } else {
                return new ApiResponse<>(
                    false,
                    "Không nhận diện được khuôn mặt",
                    Map.of("status", "DENIED"),
                    "IOT_FACE_UNRECOGNIZED"
                );
            }
        } catch (Exception e) {
            log.error("[IoT] Exception during face verification: {}", e.getMessage());
            // Trả về ApiResponse thất bại thay vì ném ra lỗi HTTP 500
            return new ApiResponse<>(
                false,
                "Hệ thống AI gặp sự cố",
                Map.of("status", "ERROR"),
                "IOT_INTERNAL_SERVER_ERROR"
            );
        }
    }

    /**
     * Endpoint for IoT ESP32 DevKit V1 (Room Door) to verify PIN code.
     * Used by keypad-based room door devices.
     */
    @Operation(summary = "Xác thực mã PIN", description = "IoT gửi mã PIN của cửa phòng để xác thực")
    @PostMapping("/verify/pin")
    public ApiResponse<Map<String, String>> verifyPin(@RequestBody Map<String, String> payload) {
        String pinCode = payload.get("pinCode");
        String gateIdStr = payload.get("gateId");

        log.info("[IoT] Received PIN verification request: gateId={}", gateIdStr);

        if (pinCode == null || pinCode.isBlank()) {
            return new ApiResponse<>(
                false, "Mã PIN không được để trống", Map.of("status", "DENIED"), "IOT_INVALID_PIN"
            );
        }

        UUID gateId;
        try {
            gateId = UUID.fromString(gateIdStr);
        } catch (Exception e) {
            return new ApiResponse<>(
                false, "Mã cổng (Gate ID) không hợp lệ", Map.of("status", "DENIED"), "UNREGISTERED_OR_INACTIVE_GATE"
            );
        }

        // Evaluate PIN against the room's assigned students
        var eligibilityOpt = eligibilityEvaluationService.evaluateEligibilityByPin(pinCode, gateId);
        if (eligibilityOpt.isEmpty()) {
            log.warn("[IoT] PIN verification failed for gateId={}. No matching active student.", gateIdStr);
            return new ApiResponse<>(
                false, "Mã PIN sai hoặc bạn không ở phòng này",
                Map.of("status", "DENIED"), "IOT_PIN_NOT_FOUND"
            );
        }

        UUID studentId = eligibilityOpt.get().getStudentId();
        AccessDecision decision = accessEvaluationService.evaluateAccessSync(studentId, gateId, VerificationMethod.PIN);

        if (decision == AccessDecision.GRANTED) {
            log.info("[IoT] PIN GRANTED for studentId={} at gateId={}", studentId, gateIdStr);
            return ApiResponse.success(
                "Xác thực mã PIN thành công, cho phép mở cửa",
                Map.of("status", "GRANTED", "studentId", studentId.toString())
            );
        } else {
            log.warn("[IoT] PIN matched but ACCESS DENIED by policy for studentId={}", studentId);
            return new ApiResponse<>(
                false, "Từ chối truy cập do chính sách an ninh",
                Map.of("status", "DENIED"), "IOT_ACCESS_DENIED_POLICY"
            );
        }
    }
}
