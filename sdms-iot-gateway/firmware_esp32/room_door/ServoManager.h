#ifndef SERVO_MANAGER_H
#define SERVO_MANAGER_H

#include <ESP32Servo.h>
#include "Config.h"

Servo doorServo;
bool isDoorOpen = false;

void initServo() {
    ESP32PWM::allocateTimer(0);
    ESP32PWM::allocateTimer(1);
    ESP32PWM::allocateTimer(2);
    ESP32PWM::allocateTimer(3);
    
    doorServo.setPeriodHertz(50); // Servo chuẩn 50Hz
    doorServo.attach(SERVO_PIN, 500, 2400); 
    
    doorServo.write(0); // Khóa cửa mặc định (Góc 0)
    Serial.println("[Servo] Initialized. Door locked.");
}

void openDoor() {
    Serial.println("[Servo] Opening door...");
    doorServo.write(90); // Mở cửa (Góc 90)
    isDoorOpen = true;
    
    // Đợi một khoảng thời gian rồi tự động đóng
    delay(RELAY_OPEN_DURATION);
    
    Serial.println("[Servo] Closing door...");
    doorServo.write(0); // Đóng cửa
    isDoorOpen = false;
}

#endif // SERVO_MANAGER_H
