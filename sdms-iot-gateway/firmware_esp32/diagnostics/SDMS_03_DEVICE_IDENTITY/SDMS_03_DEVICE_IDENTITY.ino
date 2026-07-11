/*
 * ============================================================
 * SDMS ESP32 Diagnostic Toolkit
 * STEP 03 - Device Identity
 * Compatible with Arduino ESP32 Core 3.x
 * ============================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <esp_chip_info.h>
#include <esp_mac.h>

void separator() {
    Serial.println("============================================================");
}

void section(const char *title) {
    Serial.println();
    Serial.print("[ ");
    Serial.print(title);
    Serial.println(" ]");
    Serial.println("------------------------------------------------------------");
}

void item(const char *key, const String &value) {
    Serial.printf("%-28s : %s\n", key, value.c_str());
}

String macToString(uint8_t mac[6]) {

    char buffer[18];

    sprintf(buffer,
            "%02X:%02X:%02X:%02X:%02X:%02X",
            mac[0],
            mac[1],
            mac[2],
            mac[3],
            mac[4],
            mac[5]);

    return String(buffer);
}

void printHeader() {

    separator();
    Serial.println("      SDMS ESP32 DIAGNOSTIC TOOLKIT");
    Serial.println("      STEP 03 - DEVICE IDENTITY");
    separator();
}

//////////////////////////////////////////////////////////
// CHIP INFORMATION
//////////////////////////////////////////////////////////

void printChipInformation() {

    section("CHIP INFORMATION");

    esp_chip_info_t chip;

    esp_chip_info(&chip);

    item("Chip Model", ESP.getChipModel());

    item("Chip Revision", String(ESP.getChipRevision()));

    item("CPU Cores", String(chip.cores));

    item("CPU Frequency",
         String(ESP.getCpuFreqMHz()) + " MHz");

    item("XTAL Frequency",
         String(getXtalFrequencyMhz()) + " MHz");

    String features = "";

    if (chip.features & CHIP_FEATURE_WIFI_BGN)
        features += "WiFi ";

    if (chip.features & CHIP_FEATURE_BT)
        features += "BT ";

    if (chip.features & CHIP_FEATURE_BLE)
        features += "BLE ";

    if (chip.features & CHIP_FEATURE_EMB_FLASH)
        features += "EmbeddedFlash ";

    if (chip.features & CHIP_FEATURE_EMB_PSRAM)
        features += "EmbeddedPSRAM ";

    if (features == "")
        features = "Unknown";

    item("Chip Features", features);
}

//////////////////////////////////////////////////////////
// MAC ADDRESS
//////////////////////////////////////////////////////////

void printMacInformation() {

    section("MAC ADDRESS");

    uint8_t mac[6];

    esp_read_mac(mac, ESP_MAC_WIFI_STA);
    item("WiFi STA MAC", macToString(mac));

    esp_read_mac(mac, ESP_MAC_WIFI_SOFTAP);
    item("WiFi AP MAC", macToString(mac));

#if SOC_BT_SUPPORTED
    esp_read_mac(mac, ESP_MAC_BT);
    item("Bluetooth MAC", macToString(mac));
#endif
}

//////////////////////////////////////////////////////////
// UNIQUE ID
//////////////////////////////////////////////////////////

void printUniqueID() {

    section("DEVICE IDENTIFIER");

    uint64_t chipid = ESP.getEfuseMac();

    item("eFuse MAC (HEX)",
         String((uint32_t)(chipid >> 32), HEX) +
         String((uint32_t)chipid, HEX));

    item("Chip ID (Decimal)",
         String((uint32_t)chipid));
}

//////////////////////////////////////////////////////////
// FLASH INFORMATION
//////////////////////////////////////////////////////////

void printFlash() {

    section("FLASH INFORMATION");

    item("Flash Size",
         String(ESP.getFlashChipSize() / (1024 * 1024)) + " MB");

    item("Flash Speed",
         String(ESP.getFlashChipSpeed() / 1000000) + " MHz");
}

//////////////////////////////////////////////////////////
// PSRAM
//////////////////////////////////////////////////////////

void printPSRAM() {

    section("PSRAM INFORMATION");

    if (psramFound()) {

        item("PSRAM", "FOUND");

        item("PSRAM Size",
             String(ESP.getPsramSize() / (1024 * 1024)) + " MB");
    }
    else {

        item("PSRAM", "NOT FOUND");
    }
}

//////////////////////////////////////////////////////////
// SDK
//////////////////////////////////////////////////////////

void printSDK() {

    section("SDK");

    item("SDK Version",
         ESP.getSdkVersion());

#ifdef ESP_ARDUINO_VERSION_MAJOR

    String version =
            String(ESP_ARDUINO_VERSION_MAJOR) + "." +
            String(ESP_ARDUINO_VERSION_MINOR) + "." +
            String(ESP_ARDUINO_VERSION_PATCH);

    item("Arduino Core", version);

#endif
}

//////////////////////////////////////////////////////////

void setup() {

    Serial.begin(115200);

    delay(3000);

    printHeader();

    printChipInformation();

    printMacInformation();

    printUniqueID();

    printFlash();

    printPSRAM();

    printSDK();

    separator();

    Serial.println("Device Identity Diagnostic Completed.");

    separator();
}

void loop() {

}