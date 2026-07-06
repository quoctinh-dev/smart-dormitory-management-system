/*
 * ============================================================
 * SDMS ESP32 Diagnostic Toolkit
 * Step 01 - System Information
 * ------------------------------------------------------------
 * Purpose:
 *   Collect fundamental system information of ESP32.
 *
 * Compatible:
 *   - ESP32-WROOM
 *   - ESP32-WROVER
 *   - ESP32-CAM
 *   - ESP32-S2
 *   - ESP32-S3
 *   - ESP32-C3 (Some fields may differ)
 * ============================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include "esp_system.h"
#include "esp_spi_flash.h"
#include "rom/rtc.h"

#define REPORT_WIDTH 60

//============================================================
// Utility
//============================================================

void printSeparator() {
    Serial.println("============================================================");
}

void printSection(const String &title) {
    Serial.println();
    Serial.print("[ ");
    Serial.print(title);
    Serial.println(" ]");
    Serial.println("------------------------------------------------------------");
}

void printItem(const String &key, const String &value) {
    Serial.printf("%-25s : %s\n", key.c_str(), value.c_str());
}

void printItem(const String &key, uint32_t value) {
    Serial.printf("%-25s : %u\n", key.c_str(), value);
}

void printItem(const String &key, uint64_t value) {
    Serial.printf("%-25s : %llu\n", key.c_str(), value);
}

//============================================================
// Reset Reason
//============================================================

String getResetReason(int cpu) {

    RESET_REASON reason = rtc_get_reset_reason(cpu);

    switch (reason) {

        case POWERON_RESET: return "POWERON_RESET";
        case SW_RESET: return "SW_RESET";
        case OWDT_RESET: return "OWDT_RESET";
        case DEEPSLEEP_RESET: return "DEEPSLEEP_RESET";
        case SDIO_RESET: return "SDIO_RESET";
        case TG0WDT_SYS_RESET: return "TG0WDT_SYS_RESET";
        case TG1WDT_SYS_RESET: return "TG1WDT_SYS_RESET";
        case RTCWDT_SYS_RESET: return "RTCWDT_SYS_RESET";
        case INTRUSION_RESET: return "INTRUSION_RESET";
        case TGWDT_CPU_RESET: return "TGWDT_CPU_RESET";
        case SW_CPU_RESET: return "SW_CPU_RESET";
        case RTCWDT_CPU_RESET: return "RTCWDT_CPU_RESET";
        case EXT_CPU_RESET: return "EXT_CPU_RESET";
        case RTCWDT_BROWN_OUT_RESET: return "BROWN_OUT_RESET";
        case RTCWDT_RTC_RESET: return "RTC_RESET";
        default: return "UNKNOWN";
    }
}

//============================================================
// Header
//============================================================

void printHeader() {

    printSeparator();
    Serial.println("      SDMS ESP32 DIAGNOSTIC TOOLKIT");
    Serial.println("         STEP 01 - SYSTEM INFORMATION");
    printSeparator();
}

//============================================================
// Board Information
//============================================================

void printBoardInformation() {

    printSection("BOARD");

#ifdef ARDUINO_BOARD
    printItem("Board Name", ARDUINO_BOARD);
#else
    printItem("Board Name", "Unknown");
#endif

#ifdef ESP_ARDUINO_VERSION_MAJOR
    String version =
        String(ESP_ARDUINO_VERSION_MAJOR) + "." +
        String(ESP_ARDUINO_VERSION_MINOR) + "." +
        String(ESP_ARDUINO_VERSION_PATCH);

    printItem("Arduino Core", version);
#else
    printItem("Arduino Core", "Unknown");
#endif

    printItem("Compile Date", __DATE__);
    printItem("Compile Time", __TIME__);
}

//============================================================
// Chip Information
//============================================================

void printChipInformation() {

    printSection("CHIP");

    printItem("Chip Model", ESP.getChipModel());

    printItem("Chip Revision",
              String(ESP.getChipRevision()));

    printItem("CPU Cores",
              String(ESP.getChipCores()));

    printItem("CPU Frequency",
              String(ESP.getCpuFreqMHz()) + " MHz");

    printItem("XTAL Frequency",
              String(getXtalFrequencyMhz()) + " MHz");

#if ESP_IDF_VERSION_MAJOR
    printItem("ESP-IDF Version", ESP.getSdkVersion());
#endif
}

//============================================================
// Flash Information
//============================================================

void printFlashInformation() {

    printSection("FLASH");

    printItem("Flash Size",
        String(ESP.getFlashChipSize() / (1024 * 1024)) + " MB");

    printItem("Flash Speed",
        String(ESP.getFlashChipSpeed() / 1000000) + " MHz");

#if defined(ARDUINO_ARCH_ESP32)
    printItem("Flash Mode", "Not Available");
    printItem("Flash Chip ID", "Not Available");
#endif
}

//============================================================
// Boot Information
//============================================================

void printBootInformation() {

    printSection("BOOT");

    printItem("Reset Reason CPU0",
        getResetReason(0));

    printItem("Reset Reason CPU1",
        getResetReason(1));

    printItem("Sketch Size",
        String(ESP.getSketchSize() / 1024) + " KB");

    printItem("Free Sketch Space",
        String(ESP.getFreeSketchSpace() / (1024 * 1024)) + " MB");
}

//============================================================
// SDK Information
//============================================================

void printSDKInformation() {

    printSection("SDK");

    printItem("SDK Version",
        ESP.getSdkVersion());

#ifdef ESP_IDF_VERSION
    printItem("ESP-IDF",
        ESP.getSdkVersion());
#endif
}

//============================================================
// Runtime Information
//============================================================

void printRuntimeInformation() {

    printSection("RUNTIME");

    printItem("Millis",
        String(millis()) + " ms");

    printItem("Uptime",
        String(millis() / 1000) + " s");
}

//============================================================
// Footer
//============================================================

void printFooter() {

    printSeparator();
    Serial.println("System Information Completed.");
    printSeparator();
}

//============================================================
// Arduino
//============================================================

void setup() {

    Serial.begin(115200);

    delay(3000);

    printHeader();

    printBoardInformation();

    printChipInformation();

    printFlashInformation();

    printBootInformation();

    printSDKInformation();

    printRuntimeInformation();

    printFooter();
}

void loop() {

}