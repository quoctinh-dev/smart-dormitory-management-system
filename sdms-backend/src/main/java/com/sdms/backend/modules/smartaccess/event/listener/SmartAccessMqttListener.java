package com.sdms.backend.modules.smartaccess.event.listener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sdms.backend.modules.smartaccess.event.GateCommandEvent;
import com.sdms.backend.modules.smartaccess.infrastructure.config.MqttGateway;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.sdms.backend.modules.smartaccess.application.service.EligibilityEvaluationService;
import com.sdms.backend.modules.student.event.StudentCheckedOutEvent;
import com.sdms.backend.modules.student.event.StudentRfidAssignedEvent;
import org.springframework.context.event.EventListener;

import java.util.List;
import java.util.Map;

/**
 * Mục tiêu/Nghiệp vụ: Lắng nghe sự kiện yêu cầu điều khiển cổng (Remote Unlock/Emergency)
 * và đẩy lệnh xuống ESP32 thông qua giao thức MQTT.
 * 
 * Giải pháp Công nghệ: Sử dụng @TransactionalEventListener(phase = AFTER_COMMIT) 
 * để đảm bảo lệnh chỉ được đẩy đi NẾU VÀ CHỈ NẾU transaction ghi nhận lịch sử vào DB thành công.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SmartAccessMqttListener {

    private final MqttGateway mqttGateway;
    private final ObjectMapper objectMapper;
    private final EligibilityEvaluationService eligibilityService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleGateCommand(GateCommandEvent event) {
        String topic = String.format("sdms/gates/%s/command", event.getGateId());
        
        try {
            // Chuẩn hóa payload JSON gửi xuống ESP32
            String payload = objectMapper.writeValueAsString(Map.of(
                    "command", event.getCommand(),
                    "reason", event.getReason(),
                    "timestamp", System.currentTimeMillis()
            ));

            mqttGateway.sendToMqtt(topic, payload);
            log.info("Successfully published MQTT message to topic {}: {}", topic, payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize MQTT payload for gate {}", event.getGateId(), e);
        } catch (Exception e) {
            log.error("Failed to publish MQTT message to gate {}. Is broker running?", event.getGateId(), e);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSystemEmergency(com.sdms.backend.modules.smartaccess.event.SystemEmergencyEvent event) {
        String topic = event.getBuildingId() != null 
                ? String.format("sdms/gates/building/%s/command", event.getBuildingId()) 
                : "sdms/gates/system/broadcast";
        
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "command", event.getActionType(),
                    "reason", event.getReason(),
                    "timestamp", System.currentTimeMillis()
            ));

            mqttGateway.sendToMqtt(topic, payload);
            log.warn("🚨 EMERGENCY ACTION 🚨 Published MQTT message to topic {}: {}", topic, payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize MQTT payload for emergency", e);
        } catch (Exception e) {
            log.error("Failed to publish emergency MQTT message. Is broker running?", e);
        }
    }

    /**
     * Đồng bộ Offline RFID Whitelist khi có thay đổi liên quan đến thẻ hoặc trạng thái cư trú.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStudentCheckedOut(StudentCheckedOutEvent event) {
        log.info("Student {} checked out. Syncing RFID whitelist to edge devices.", event.getStudentId());
        syncWhitelistToEdge();
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStudentRfidAssigned(StudentRfidAssignedEvent event) {
        log.info("RFID assigned for student {}. Syncing RFID whitelist to edge devices.", event.getStudentId());
        syncWhitelistToEdge();
    }

    private void syncWhitelistToEdge() {
        String topic = "sdms/gates/system/whitelist";
        try {
            List<String> activeRfids = eligibilityService.getActiveRfidWhitelists();
            String payload = objectMapper.writeValueAsString(Map.of(
                    "type", "WHITELIST_SYNC",
                    "count", activeRfids.size(),
                    "data", activeRfids,
                    "timestamp", System.currentTimeMillis()
            ));

            mqttGateway.sendToMqtt(topic, payload);
            log.info("Successfully published full RFID whitelist to edge devices.");
        } catch (Exception e) {
            log.error("Failed to sync RFID whitelist via MQTT", e);
        }
    }
}
