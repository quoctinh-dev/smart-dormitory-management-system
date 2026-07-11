#include "RfidDriver.h"
#include <SPI.h>
#include <MFRC522.h>
#include "../config/Config.h"
#include "../config/Pins.h"
#include "../network/HttpManager.h"

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

    HttpManager::verifyCard(uid);
}
