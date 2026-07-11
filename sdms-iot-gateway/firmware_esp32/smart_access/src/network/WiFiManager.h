#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>

class WiFiManager {
public:
    static void init();
    static void maintainConnection();
    static bool isConnected();

private:
    static unsigned long lastReconnectAttempt;
};

#endif // WIFI_MANAGER_H
