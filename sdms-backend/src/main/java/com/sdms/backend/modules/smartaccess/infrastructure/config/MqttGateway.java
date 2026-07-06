package com.sdms.backend.modules.smartaccess.infrastructure.config;

import org.springframework.integration.annotation.MessagingGateway;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
@MessagingGateway(defaultRequestChannel = "mqttOutboundChannel")
public interface MqttGateway {

    /**
     * Publishes a message to a specific MQTT topic.
     *
     * @param topic   The MQTT topic (e.g., "sdms/gates/gate-id/command")
     * @param payload The message payload (e.g., JSON string)
     */
    void sendToMqtt(@Header(MqttHeaders.TOPIC) String topic, String payload);
}
