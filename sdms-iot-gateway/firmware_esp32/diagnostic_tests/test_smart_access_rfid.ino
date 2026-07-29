#include <SPI.h>
#include <MFRC522.h>

// ==== CONFIGURATION PINOUT ====
// ESP32-CAM VSPI Pins for RFID
#define RST_PIN  22
#define SS_PIN   21
#define MOSI_PIN 23
#define MISO_PIN 19
#define SCK_PIN  18

#define RELAY_PIN 2

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
    Serial.begin(115200);
    while (!Serial);
    
    Serial.println("\n--- BẮT ĐẦU TEST PHẦN CỨNG SMART ACCESS (RFID) ---");

    SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
    mfrc522.PCD_Init();
    delay(4);
    mfrc522.PCD_DumpVersionToSerial(); // Kiểm tra kết nối Module

    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);

    Serial.println("Đưa thẻ RFID lại gần bộ đọc...");
}

void loop() {
    // Chỉ đọc nếu có thẻ mới
    if (!mfrc522.PICC_IsNewCardPresent()) {
        return;
    }

    if (!mfrc522.PICC_ReadCardSerial()) {
        return;
    }

    Serial.print("Phát hiện UID Thẻ: ");
    String content= "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
        Serial.print(mfrc522.uid.uidByte[i], HEX);
        content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " "));
        content.concat(String(mfrc522.uid.uidByte[i], HEX));
    }
    Serial.println();
    content.toUpperCase();

    // Kích hoạt Relay để chứng minh có thẻ là nhảy Relay
    Serial.println("=> MỞ CỔNG (Kích Relay trong 2 giây)");
    digitalWrite(RELAY_PIN, HIGH);
    delay(2000);
    digitalWrite(RELAY_PIN, LOW);
    Serial.println("=> ĐÓNG CỔNG");

    // Dừng đọc thẻ này để tránh loop
    mfrc522.PICC_HaltA();
    delay(1000); // Chờ 1 giây trước khi đọc thẻ mới
}
