#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H

#include <Arduino.h>
#include <PubSubClient.h>

class MqttManager {
public:
    static void init();
    static void maintainConnection();
    static void sendHeartbeat();
    static void callback(char* topic, byte* payload, unsigned int length);

private:
    static unsigned long lastReconnectAttempt;
    static unsigned long lastHeartbeatTime;
    static void subscribeTopics();
};

#endif // MQTT_MANAGER_H
