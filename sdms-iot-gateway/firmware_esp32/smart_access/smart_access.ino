// ==============================================================================
// SDMS SMART ACCESS - ESP32-CAM AI Thinker
// Sprint 2 | Firmware v1.0.0
//
// Features:
//   - Camera OV2640 with PSRAM (face capture + HTTP upload to AI Backend)
//   - RFID RC522 (card-based gate access)
//   - Servo motor (door latch control)
//   - WiFi auto-reconnect (non-blocking)
//   - MQTT (remote unlock command + heartbeat)
//   - Web UI (live stream + capture trigger)
//
// Capture is triggered ONLY via the web server endpoint (/capture).
// No physical button is used.
// ==============================================================================

#include <Arduino.h>
#include "src/config/Config.h"
#include "src/config/Pins.h"
#include "src/drivers/RelayController.h"
#include "src/drivers/CameraDriver.h"
#include "src/network/WiFiManager.h"
#include "src/network/MqttManager.h"
#include "src/network/StreamServer.h"
#include "src/drivers/RfidDriver.h"

// Helper macro for memory diagnostics
#define PRINT_MEM(label) \
    Serial.printf("[MEM] %s | Heap=%u Largest=%u PSRAM=%u\n", \
        (label), \
        ESP.getFreeHeap(), \
        heap_caps_get_largest_free_block(MALLOC_CAP_8BIT), \
        ESP.getFreePsram())

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n=======================================");
    Serial.println("  SDMS SMART ACCESS");
    Serial.println("  Device : " + DEVICE_ID);
    Serial.println("  Version: " + FIRMWARE_VERSION);
    Serial.println("=======================================\n");

    // 1. Servo / Door Latch
    RelayController::init();
    PRINT_MEM("After Servo");

    // 2. Camera
    CameraDriver::init();
    PRINT_MEM("After Camera");

    // 3. RFID
    if (ENABLE_RFID) {
        RfidDriver::init();
    } else {
        Serial.println("[RFID] Disabled by config.");
    }
    PRINT_MEM("After RFID");

    // 4. Network
    WiFiManager::init();
    PRINT_MEM("After WiFi");

    MqttManager::init();

    Serial.println("[System] Setup complete. Entering main loop...\n");
}

void loop() {
    // Maintain WiFi (non-blocking reconnect)
    WiFiManager::maintainConnection();

    if (WiFiManager::isConnected()) {
        // Start HTTP servers once after WiFi is up
        static bool serverStarted = false;
        if (!serverStarted) {
            StreamServer::init();
            PRINT_MEM("After HTTP Server");
            serverStarted = true;
        }

        // Maintain MQTT
        MqttManager::maintainConnection();
    }

    // Hardware state machine
    RelayController::maintain();
    RfidDriver::maintain();
    }
