#include "RfidDriver.h"
#include <SPI.h>
#include <MFRC522.h>
#include "../config/Config.h"
#include "../config/Pins.h"
#include "../network/HttpManager.h"
#include "../storage/OfflineWhitelist.h"
#include "../storage/OfflineAccessLog.h"
#include "../drivers/RelayController.h"
#include "CameraDriver.h"
#include <WiFi.h>

// RC522 instance using validated HSPI pins
static MFRC522 mfrc522(RFID_SS_PIN, RFID_RST_PIN);
String RfidDriver::diagnosticMessage = "NOT_INITIALIZED";

void RfidDriver::init() {
    if (!ENABLE_RFID) {
        diagnosticMessage = "DISABLED";
        return;
    }

    // HSPI: SCK=15, MISO=13, MOSI=2, SS=14
    SPI.begin(RFID_SCK_PIN, RFID_MISO_PIN, RFID_MOSI_PIN, RFID_SS_PIN);
    mfrc522.PCD_Init();
    delay(50);

    byte v = mfrc522.PCD_ReadRegister(mfrc522.VersionReg);
    Serial.printf("[RFID] RC522 Firmware Version: 0x%02X", v);

    if (v == 0x00 || v == 0xFF) {
        diagnosticMessage = "SPI_ERROR_0x" + String(v, HEX);
        Serial.println(" --> ERROR: SPI communication failed! Check wiring and 3.3V supply.");
    } else {
        diagnosticMessage = "OK_0x" + String(v, HEX);
        Serial.println(" --> OK");
    }

    // MFRC522 library accepts RST_PIN = -1 when RST is tied to 3.3V on PCB.
    // This avoids GPIO4 (Flash LED) glowing permanently when RST is HIGH.
    Serial.println("[RFID] RC522 initialized on HSPI (SCK=15, MISO=13, MOSI=2, SS=14, RST→3V3).");
}

String RfidDriver::getDiagnostic() {
    return diagnosticMessage;
}

void RfidDriver::maintain() {
    if (!ENABLE_RFID) return;
    if (!mfrc522.PICC_IsNewCardPresent()) return;
    if (!mfrc522.PICC_ReadCardSerial()) return;

    // Build UID string
    String uid = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
        uid += String(mfrc522.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();

    mfrc522.PICC_HaltA();
    Serial.println("[RFID] Card detected. UID: " + uid);

    // =========================================================
    // ONLINE MODE: WiFi có kết nối → gửi lên Backend xác thực
    // =========================================================
    bool onlineSuccess = false;
    camera_fb_t* fb = nullptr;
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("[RFID] [ONLINE] Sending to Backend for verification...");
        fb = CameraDriver::capture();
        onlineSuccess = HttpManager::verifyCard(uid, fb);
    }
    
    // Nếu rớt mạng cục bộ (mất WiFi) HOẶC đứt cáp quang (có WiFi nhưng gọi API xịt)
    if (!onlineSuccess) {
        Serial.println("[RFID] [OFFLINE] No WiFi or Server unreachable. Checking offline whitelist...");
        if (OfflineWhitelist::contains(uid)) {
            Serial.println("[RFID] [OFFLINE] ✅ UID found in offline whitelist. GRANTED.");
            RelayController::unlock();
            // Log gắn gọn — sẽ được đồng bộ lên server sau khi WiFi phục hồi
            OfflineAccessLog::push(uid, millis(), "OFFLINE_GRANT");
        } else {
            Serial.println("[RFID] [OFFLINE] ❌ UID not in whitelist. DENIED.");
        }
    }

    if (fb != nullptr) {
        CameraDriver::release(fb);
    }
}

