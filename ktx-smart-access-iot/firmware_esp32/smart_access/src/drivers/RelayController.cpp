#include "../drivers/RelayController.h"
#include "../config/Pins.h"
#include "../config/Config.h"

unsigned long RelayController::unlockStartTime = 0;
bool RelayController::isUnlocked = false;

void RelayController::init() {
    if (ENABLE_RELAY) {
        pinMode(RELAY_PIN, OUTPUT);
        digitalWrite(RELAY_PIN, LOW); // Mặc định khóa
        Serial.println("[Relay] Initialized and LOCKED.");
    }
}

void RelayController::unlock() {
    if (!ENABLE_RELAY) return;
    
    digitalWrite(RELAY_PIN, HIGH);
    isUnlocked = true;
    unlockStartTime = millis();
    Serial.println("[Relay] UNLOCKED! Door is open.");
}

void RelayController::lock() {
    if (!ENABLE_RELAY) return;
    
    digitalWrite(RELAY_PIN, LOW);
    isUnlocked = false;
    Serial.println("[Relay] LOCKED! Door is closed.");
}

void RelayController::maintain() {
    if (isUnlocked) {
        unsigned long currentMillis = millis();
        // Tự động khóa lại sau RELAY_OPEN_DURATION (5 giây) mà không dùng delay()
        if (currentMillis - unlockStartTime >= RELAY_OPEN_DURATION) {
            lock();
        }
    }
}
