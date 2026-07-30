/**
 * ==============================================================================
 * DỰ ÁN: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ THÔNG MINH (SDMS)
 * CỤM IOT: SMART ACCESS CONTROL (CỔNG CHÍNH)
 * NỀN TẢNG: ESP32-CAM AI Thinker
 *
 * CHỨC NĂNG CỐT LÕI:
 * 1. Chụp ảnh khuôn mặt & Gửi HTTP POST lên AI Backend (Face Verification).
 * 2. Đọc thẻ RFID RC522 (Xác thực 2 bước: RFID + Face).
 * 3. Livestream Camera trực tiếp qua WebServer nội bộ.
 * 4. Nhận lệnh Mở Cửa Từ Xa (Remote Unlock) qua MQTT.
 * 5. Lưu Log ngoại tuyến & Mở khóa dự phòng bằng Offline Whitelist (SPIFFS/NVS).
 * ==============================================================================
 */

#include <Arduino.h>
#include "src/config/Config.h"
#include "src/config/Pins.h"
#include "src/drivers/RelayController.h"
#include "src/drivers/CameraDriver.h"
#include "src/network/WiFiManager.h"
#include "src/network/MqttManager.h"
#include "src/network/StreamServer.h"
#include "src/network/HttpManager.h"
#include "src/drivers/RfidDriver.h"
#include "src/storage/OfflineWhitelist.h"
#include "src/storage/OfflineAccessLog.h"

// ==============================================================================
// MACROS & TIỆN ÍCH CHẨN ĐOÁN BỘ NHỚ
// ==============================================================================

/**
 * @brief Macro in chỉ số bộ nhớ chi tiết giúp theo dõi RAM/PSRAM và phát hiện sớm rò rỉ bộ nhớ (Memory Leak).
 * @param label Tên mốc chẩn đoán (Checkpoint name).
 */
#define PRINT_MEM(label) \
    Serial.printf("[MEM] %-20s | Free Heap: %7u B | Max Alloc Block: %7u B | Free PSRAM: %7u B\n", \
        (label), \
        ESP.getFreeHeap(), \
        heap_caps_get_largest_free_block(MALLOC_CAP_8BIT), \
        ESP.getFreePsram())

// ==============================================================================
// HÀM KHỞI TẠO HỆ THỐNG (SETUP)
// ==============================================================================

void setup() {
    // Khởi tạo giao tiếp Serial với baudrate 115200 tiêu chuẩn
    Serial.begin(115200);
    delay(1000); // Chờ Serial Monitor ổn định

    Serial.println("\n=======================================");
    Serial.println("  SDMS SMART ACCESS");
    Serial.println("  Device : " + DEVICE_ID);
    Serial.println("  Version: " + FIRMWARE_VERSION);
    Serial.println("=======================================\n");

    // [BƯỚC 1]: CƠ CẤU CHẤP HÀNH & AN TOÀN BẢO MẬT
    // Khởi tạo Chốt cửa/Relay đầu tiên để đảm bảo cổng luôn KHÓA an toàn ngay khi cấp nguồn
    RelayController::init();
    PRINT_MEM("After Servo");

    // [BƯỚC 2]: DRIVER CAMERA & PSRAM
    // Khởi tạo OV2640, cấu hình Framebuffer và độ phân giải hình ảnh cho AI Verification
    CameraDriver::init();
    PRINT_MEM("After Camera");

    // [BƯỚC 3]: ĐẦU ĐỌC THẺ RFID
    // Khởi tạo MFRC522 nếu được bật trong cấu hình
    if (ENABLE_RFID) {
        RfidDriver::init();
    } else {
        Serial.println("[RFID] Disabled by config.");
    }
    PRINT_MEM("After RFID");

    // [BƯỚC 4]: LƯU TRỮ DỰ PHÒNG NGOẠI TUYẾN (NVS / FLASH)
    // Mở bộ nhớ không bốc hơi để đọc Whitelist đã lưu và chuẩn bị bộ đệm Log ngoại tuyến
    OfflineWhitelist::begin();
    OfflineAccessLog::begin();
    PRINT_MEM("After NVS Storage");

    // [BƯỚC 5]: HẠ TẦNG KẾT NỐI MẠNG
    // Khởi tạo trình quản lý WiFi và MQTT Client
    WiFiManager::init();
    PRINT_MEM("After WiFi");

    MqttManager::init();

    Serial.println("[System] Setup complete. Entering main loop...\n");
}

// ==============================================================================
// VÒNG LẶP CHÍNH (MAIN LOOP)
// ==============================================================================

void loop() {
    // Duy trì kết nối WiFi (Tự động kết nối lại theo cơ chế non-blocking)
    WiFiManager::maintainConnection();

    // Khối xử lý các tác vụ yêu cầu kết nối Mạng / Cloud
    if (WiFiManager::isConnected()) {

        // 1. Khởi chạy HTTP Server cho Camera Livestream (Chỉ khởi chạy đúng 1 lần khi có mạng)
        static bool serverStarted = false;
        if (!serverStarted) {
            StreamServer::init();
            PRINT_MEM("After HTTP Server");
            serverStarted = true;
        }

        // 2. Tải & Lưu Whitelist từ Cloud ngay lần đầu tiên kết nối WiFi thành công
        static bool firstSyncDone = false;
        if (!firstSyncDone) {
            Serial.println("[System] WiFi ready. Performing initial whitelist sync...");
            HttpManager::fetchAndSaveWhitelist();
            firstSyncDone = true;
        }

        // 3. Kiểm tra và đẩy các Access Log lưu tạm trong NVS (lúc mất mạng) lên Backend
        static unsigned long lastOfflineLogSync = 0;
        if (OfflineAccessLog::hasPending()) {
            unsigned long now = millis();
            if (now - lastOfflineLogSync >= 10000 || lastOfflineLogSync == 0) { // Retry mỗi 10 giây
                HttpManager::syncOfflineLogs();
                lastOfflineLogSync = millis();
            }
        }

        // 4. Đồng bộ lại Whitelist định kỳ từ Cloud (vd: mỗi 6 giờ)
        static unsigned long lastWhitelistSync = 0;
        unsigned long now = millis();
        if (now - lastWhitelistSync >= WHITELIST_SYNC_INTERVAL) {
            lastWhitelistSync = now;
            Serial.println("[System] Periodic whitelist sync triggered.");
            HttpManager::fetchAndSaveWhitelist();
        }

        // 5. Duy trì kết nối MQTT Client (Nhận lệnh Mở Cửa Từ Xa / Remote Unlock)
        MqttManager::maintainConnection();
    }

    // TÁC VỤ PHẦN CỨNG (Hardware State Machine)
    // Xử lý bộ đếm thời gian tự động khóa cửa và liên tục quét thẻ RFID
    RelayController::maintain();
    RfidDriver::maintain();
}