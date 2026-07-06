package com.sdms.backend.modules.smartaccess.event.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DeviceStatusMqttListener implements MessageHandler {

    /**
     * Lắng nghe các tin nhắn từ MQTT Broker gửi tới (Ví dụ: Heartbeat từ ESP32)
     */
    @Override
    @ServiceActivator(inputChannel = "mqttInboundChannel")
    public void handleMessage(Message<?> message) throws MessagingException {
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        String payload = message.getPayload().toString();

        log.info("[DEVICE ONLINE] Received Heartbeat/Status from Topic: {} | Payload: {}", topic, payload);
        
        // Trong phạm vi Đồ án Tốt nghiệp, ta chỉ cần log ra màn hình console 
        // để chứng minh luồng Inbound MQTT hoạt động tốt. 
        // (Không cần lưu vào Database hay vẽ Dashboard phức tạp).
    }
}
