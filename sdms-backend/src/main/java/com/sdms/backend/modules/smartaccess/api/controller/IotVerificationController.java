package com.sdms.backend.modules.smartaccess.api.controller;

import com.sdms.backend.modules.notification.service.InAppNotificationService;
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
import com.sdms.backend.modules.system.service.SystemConfigService;
import com.sdms.backend.modules.smartaccess.domain.repository.GateRepository;
import com.sdms.backend.modules.smartaccess.domain.entity.Gate;
import com.sdms.backend.modules.smartaccess.domain.enums.GateType;

import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;
import com.sdms.backend.modules.smartaccess.api.dto.request.OfflineLogBatchRequest;

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
    private final SystemConfigService systemConfigService;
    private final InAppNotificationService inAppNotificationService;
    private final GateRepository gateRepository;
    
    /**
     * API nhận yêu cầu xác thực thẻ RFID từ thiết bị IoT ESP32.
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
        UUID gateId = gateIdStr != null ? UUID.fromString(gateIdStr.trim()) : UUID.randomUUID();
        String eventId = UUID.randomUUID().toString();
        
        // --- DUAL VERIFICATION LOGIC PRE-CHECK ---
        LocalTime nowTime = LocalTime.now();
        LocalTime dualAuthStart = LocalTime.parse(systemConfigService.getConfigValue("DUAL_AUTH_START", "18:00"));
        LocalTime dualAuthEnd = LocalTime.parse(systemConfigService.getConfigValue("DUAL_AUTH_END", "06:00"));

        boolean isDualAuthTime = false;
        if (dualAuthStart.isBefore(dualAuthEnd)) {
            isDualAuthTime = !nowTime.isBefore(dualAuthStart) && !nowTime.isAfter(dualAuthEnd);
        } else {
            isDualAuthTime = !nowTime.isBefore(dualAuthStart) || !nowTime.isAfter(dualAuthEnd);
        }

        VerificationMethod finalMethod = VerificationMethod.RFID;
        Optional<Gate> gateOpt = gateRepository.findById(gateId);
        boolean isBuildingGate = gateOpt.isPresent() && gateOpt.get().getGateType() == GateType.BUILDING_GATE;

        // Check if grace period applies
        var studentSnapshot = eligibilityOpt.get();
        boolean isGracePeriodBypass = false;
        if (isBuildingGate && isDualAuthTime && Boolean.FALSE.equals(studentSnapshot.getIsFaceRegistered())) {
            String gracePeriodStr = systemConfigService.getConfigValue("FACE_GRACE_PERIOD_DAYS", "3");
            try {
                int graceDays = Integer.parseInt(gracePeriodStr);
                if (studentSnapshot.getCheckInAt() != null) {
                    java.time.LocalDateTime graceDeadline = studentSnapshot.getCheckInAt().plusDays(graceDays);
                    if (java.time.LocalDateTime.now().isBefore(graceDeadline)) {
                        isGracePeriodBypass = true;
                    }
                }
            } catch (Exception e) {
                log.error("[IoT] Invalid Grace Period config", e);
            }
        }

        boolean requireDualAuth = isBuildingGate && isDualAuthTime && !isGracePeriodBypass;

        // Tối ưu tài nguyên Cloudinary theo yêu cầu Admin:
        // - NẾU xác thực 1 bước (chỉ quẹt thẻ): Up ảnh lên Cloud để Admin check xem có quẹt dùm không.
        // - NẾU xác thực 2 bước (quẹt thẻ + quét mặt): AI sẽ quét, KHÔNG CẦN LƯU LÊN CLOUD để đỡ tốn dung lượng.
        String snapshotUrl = null;
        if (snapshot != null && !snapshot.isEmpty()) {
            if (!requireDualAuth) {
                try {
                    snapshotUrl = cloudinaryService.uploadFile(snapshot, "smart_access_snapshots");
                    log.info("[IoT] Snapshot saved to Cloudinary (1-step Auth): {}", snapshotUrl);
                } catch (Exception e) {
                    log.error("[IoT] Failed to upload snapshot to Cloudinary", e);
                }
            } else {
                log.info("[IoT] Skipping Cloudinary upload for Dual Auth. Image will be sent directly to AI.");
            }
        }
        
        if (requireDualAuth) {
            log.info("[IoT] Dual Authentication required for RFID {}", rfidCode);

            
            if (!isGracePeriodBypass) {
                if (snapshot == null || snapshot.isEmpty()) {
                    log.warn("[IoT] Missing snapshot for dual authentication.");
                    accessEvaluationService.logFailedAccess(studentId, gateId, VerificationMethod.RFID_AND_FACE, snapshotUrl, "DUAL_AUTH_MISSING_FACE");
                    return new ApiResponse<>(false, "Thiếu ảnh khuôn mặt cho xác thực kép", Map.of("status", "DENIED"), "DUAL_AUTH_MISSING_FACE");
                }
                
                // Thực hiện xác minh khuôn mặt thông qua module Face AI
                try {
                    var faceResult = faceVerificationService.verifyFace(gateIdStr, snapshot);
                    
                    /*
                     * RÀNG BUỘC KIỂM TRA CHÉO (DUAL-AUTH CHECK)
                     * 1. Khuôn mặt phải đạt ngưỡng tin cậy (isMatch = true)
                     * 2. Khuôn mặt đó phải thuộc về MỘT sinh viên (matchedStudentId != null)
                     * 3. ID của sinh viên sở hữu khuôn mặt PHẢI TRÙNG KHỚP với ID của thẻ RFID vừa quẹt.
                     * Nếu sai bất kỳ điều kiện nào -> Chặn cửa, báo lỗi "Râu ông nọ cắm cằm bà kia".
                     */
                    if (!faceResult.isMatch() || faceResult.matchedStudentId() == null || !faceResult.matchedStudentId().equals(studentId)) {
                        log.warn("[IoT] DUAL AUTH FAILED: Face does not match RFID for student {}", studentId);
                        accessEvaluationService.logFailedAccess(studentId, gateId, VerificationMethod.RFID_AND_FACE, snapshotUrl, "DUAL_AUTH_MISMATCH");
                        return new ApiResponse<>(false, "Khuôn mặt không khớp thẻ (Xác thực kép thất bại)", Map.of("status", "DENIED"), "DUAL_AUTH_MISMATCH");
                    }
                    finalMethod = VerificationMethod.RFID_AND_FACE;
                } catch (Exception e) {
                    log.error("[IoT] Face verification error during Dual Auth", e);
                    accessEvaluationService.logFailedAccess(studentId, gateId, VerificationMethod.RFID_AND_FACE, snapshotUrl, "FACE_VERIFICATION_ERROR");
                    return new ApiResponse<>(false, "Lỗi xác thực khuôn mặt", Map.of("status", "DENIED"), "FACE_VERIFICATION_ERROR");
                }
            }
        }

        eventPublisher.publishEvent(new IdentityVerifiedEvent(
                eventId,
                studentId,
                gateId,
                finalMethod,
                snapshotUrl
        ));

        return ApiResponse.success(
                "Đã nhận yêu cầu xác thực thẻ",
                Map.of("status", "PROCESSING", "eventId", eventId)
        );
    }

    /**
     * API tải danh sách thẻ RFID trắng (whitelist) cho chế độ dự phòng ngoại tuyến (offline fallback).
     */
    @Operation(summary = "Lấy danh sách thẻ trắng", description = "Cung cấp danh sách thẻ RFID hợp lệ cho IoT lưu trữ Offline")
    @GetMapping("/rfid-whitelist")
    public ApiResponse<Map<String, Object>> getRfidWhitelist() {
        log.info("[IoT] Fetching RFID Whitelist for offline mode sync");
        java.util.Map<java.util.UUID, java.util.List<String>> rfids = eligibilityEvaluationService.getActiveRfidWhitelistsByBuilding();
        
        // Cấp thêm cấu hình Thẻ Master (Master Card) để ESP32 lưu vào bộ nhớ Offline (EEPROM/Flash)
        String masterCardUid = systemConfigService.getConfigValue("MASTER_CARD_UID", "FF FF FF FF");
        
        return ApiResponse.success(
            "Lấy danh sách whitelist thành công",
            Map.of(
                "count", rfids.size(), 
                "data", rfids,
                "masterCardUid", masterCardUid
            )
        );
    }

    /**
     * API nhận ảnh khuôn mặt từ ESP32 để xác thực.
     * Xử lý đồng bộ: Chờ phản hồi từ AI và đánh giá chính sách ra vào.
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
                UUID gateId = gateIdStr != null ? UUID.fromString(gateIdStr.trim()) : UUID.randomUUID();
                AccessDecision decision = accessEvaluationService.evaluateAccessSync(result.matchedStudentId(), gateId, VerificationMethod.FACE_AI);
                
                // 3. Return immediate result to ESP32 to trigger Relay
                if (decision == AccessDecision.GRANTED) {
                    return ApiResponse.success(
                        "Khuôn mặt hợp lệ và được phép ra vào",
                        Map.of("status", "GRANTED", "studentId", result.matchedStudentId(), "confidence", result.confidenceScore())
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
            return new ApiResponse<>(
                false,
                "Hệ thống AI gặp sự cố",
                Map.of("status", "ERROR"),
                "IOT_INTERNAL_SERVER_ERROR"
            );
        }
    }

    /**
     * API xác thực mã PIN cho cửa phòng (dùng cho ESP32 DevKit V1 kết nối với Keypad).
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
            gateId = UUID.fromString(gateIdStr.trim());
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

    /**
     * API báo cáo lỗi phần cứng từ ESP32 (VD: Camera ngắt kết nối, đầu đọc RFID hỏng).
     * Không yêu cầu xác thực JWT (vì thiết bị không lưu JWT), thay vào đó dùng chung API Key.
     */
    @Operation(summary = "Báo lỗi phần cứng", description = "ESP32 gửi cảnh báo khi phát hiện sự cố cảm biến/đầu đọc. Tạo thông báo khẩn cho Admin.")
    @PostMapping("/report/hardware-error")
    public ApiResponse<Map<String, String>> reportHardwareError(
            @RequestParam("gateId") String gateId,
            @RequestParam("gateName") String gateName,
            @RequestParam("component") String component,
            @RequestParam("detail") String detail) {

        log.error("[IoT] Hardware error reported — Gate: {}, Component: {}, Detail: {}", gateName, component, detail);

        try {
            inAppNotificationService.notifyHardwareError(gateId, gateName, component, detail);
        } catch (Exception e) {
            log.error("[IoT] Failed to create hardware error notification", e);
        }

        return ApiResponse.success("Đã ghi nhận sự cố phần cứng và thông báo Admin", Map.of("status", "RECEIVED"));
    }

    /**
     * API đồng bộ lịch sử quét thẻ ngoại tuyến từ ESP32 (được gọi khi thiết bị có mạng trở lại).
     */
    @Operation(summary = "Đồng bộ log offline", description = "ESP32 gửi danh sách lịch sử quét thẻ khi mất mạng lên server để lưu lại")
    @PostMapping("/offline-log-batch")
    public ApiResponse<Map<String, String>> syncOfflineLogs(
            @RequestBody OfflineLogBatchRequest request) {

        log.info("[IoT] Received offline log sync batch: gateId={}, logsCount={}", 
            request.gateId(), request.logs() != null ? request.logs().size() : 0);

        try {
            accessEvaluationService.processOfflineLogBatch(request);
            return ApiResponse.success("Đồng bộ log offline thành công", Map.of("status", "SYNCED"));
        } catch (Exception e) {
            log.error("[IoT] Failed to process offline logs", e);
            return new ApiResponse<>(false, "Lỗi đồng bộ log offline", Map.of("status", "ERROR"), "IOT_OFFLINE_SYNC_ERROR");
        }
    }
}
