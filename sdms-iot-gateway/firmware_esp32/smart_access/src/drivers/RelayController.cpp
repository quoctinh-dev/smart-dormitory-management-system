#include "RelayController.h"
#include "../config/Pins.h"
#include "../config/Config.h"
#include <ESP32Servo.h>

static Servo chotCua;
unsigned long RelayController::unlockStartTime = 0;
bool RelayController::isUnlocked = false;

void RelayController::init() {
    if (!ENABLE_SERVO) {
        Serial.println("[Servo] Disabled by config.");
        return;
    }
    // Drive pin LOW to ensure Flash LED (shared line) stays off at boot
    pinMode(SERVO_PIN, OUTPUT);
    digitalWrite(SERVO_PIN, LOW);
    Serial.println("[Servo] Initialized. Door latch in idle state.");
}

void RelayController::unlock() {
    if (!ENABLE_SERVO) return;

    Serial.println("[Servo] --> UNLOCK (pulling latch in)");
    chotCua.attach(SERVO_PIN, 500, 2400);
    chotCua.write(180);
    delay(150);
    chotCua.write(94);   // Stop (neutral for 360-degree servo)
    delay(50);
    chotCua.detach();
    digitalWrite(SERVO_PIN, LOW);

    isUnlocked = true;
    unlockStartTime = millis();
}

void RelayController::lock() {
    if (!ENABLE_SERVO) return;

    Serial.println("[Servo] --> LOCK (pushing latch out)");
    chotCua.attach(SERVO_PIN, 500, 2400);
    chotCua.write(0);
    delay(150);
    chotCua.write(94);   // Stop
    delay(50);
    chotCua.detach();
    digitalWrite(SERVO_PIN, LOW);

    isUnlocked = false;
}

void RelayController::maintain() {
    if (!isUnlocked) return;
    if (millis() - unlockStartTime >= RELAY_OPEN_DURATION) {
        lock();
    }
}
