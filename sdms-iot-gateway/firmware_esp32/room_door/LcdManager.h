#ifndef LCD_MANAGER_H
#define LCD_MANAGER_H

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "Config.h"

/**
 * MODULE: QUẢN LÝ MÀN HÌNH LCD I2C
 * Chức năng: Hiển thị thông báo trạng thái (Ready, Nhập mã, Mở cửa, Lỗi mạng).
 * Tích hợp tính năng Non-blocking: Tự động xóa thông báo tạm thời sau N giây mà không dùng delay().
 */

// Địa chỉ I2C thông thường là 0x27 hoặc 0x3F. Kích thước 16x2.
LiquidCrystal_I2C lcd(0x27, 16, 2);

void initLcd() {
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
    lcd.init();
    lcd.backlight();
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("SYSTEM STARTING");
    lcd.setCursor(0, 1);
    lcd.print("SDMS ROOM DOOR");
    Serial.println("[LCD] Initialized.");
    delay(1000);
}

unsigned long lcdMessageClearTime = 0;
bool isLcdTemporary = false;

void lcdPrintMessage(String line1, String line2) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(line1);
    lcd.setCursor(0, 1);
    lcd.print(line2);
    isLcdTemporary = false;
}

void lcdPrintTempMessage(String line1, String line2, unsigned long durationMs) {
    lcdPrintMessage(line1, line2);
    isLcdTemporary = true;
    lcdMessageClearTime = millis() + durationMs;
}

void maintainLcd() {
    if (isLcdTemporary && millis() >= lcdMessageClearTime) {
        lcdPrintMessage("READY!", "Enter PIN...");
    }
}

#endif // LCD_MANAGER_H
