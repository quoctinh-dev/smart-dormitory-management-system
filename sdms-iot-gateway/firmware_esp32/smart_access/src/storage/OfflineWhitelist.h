#ifndef OFFLINE_WHITELIST_H
#define OFFLINE_WHITELIST_H

#include <Arduino.h>

/**
 * OfflineWhitelist — Quản lý danh sách thẻ RFID hợp lệ lưu trong NVS
 *
 * Lưu trữ: ESP32 Non-Volatile Storage (Preferences library)
 * - Không cần SD card, không cần GPIO thêm
 * - Tồn tại qua mất điện, reset, OTA
 * - Dung lượng: ~10KB → đủ cho ~1000 UID (mỗi UID 8 ký tự + dấu phẩy)
 *
 * Luồng hoạt động:
 *   Online:  Backend xác thực → Relay mở
 *   Offline: NVS kiểm tra UID → nếu có → Relay mở (Offline GRANT)
 */
class OfflineWhitelist {
public:
    /**
     * Khởi tạo NVS namespace "sdms_wl".
     * Gọi trong setup() trước WiFiManager::init().
     */
    static void begin();

    /**
     * Kiểm tra xem 1 UID có nằm trong whitelist không.
     * @param uid UID thẻ RFID (uppercase hex, VD: "A1B2C3D4")
     * @return true nếu được phép
     */
    static bool contains(const String& uid);

    /**
     * Lưu whitelist mới từ JSON trả về của Backend qua HTTP GET.
     * Backend format: {"success":true,"data":{"count":N,"data":{"<uuid>":["UID1",...]}}}
     * Gộp tất cả UID từ mọi building vào 1 NVS.
     * @param jsonPayload Cỗuỗi JSON response từ /rfid-whitelist
     * @return Số lượng UID đã lưu, -1 nếu parse lỗi
     */
    static int saveFromJson(const String& jsonPayload);

    /**
     * Lưu whitelist từ MQTT PUSH của Backend.
     * MQTT Push format: {"type":"WHITELIST_SYNC","count":N,"data":["UID1",...],"timestamp":...}
     * Topic: sdms/gates/building/<buildingId>/whitelist
     * @param jsonPayload Payload MQTT
     * @return Số lượng UID đã lưu, -1 nếu parse lỗi
     */
    static int saveFromMqttJson(const String& jsonPayload);

    /** Số UID đang lưu trong NVS */
    static int count();

    /** Millis() tại lần sync cuối cùng (0 nếu chưa sync lần nào) */
    static unsigned long lastSyncMillis();

    /** Xóa toàn bộ whitelist trong NVS */
    static void clear();

    /** In danh sách UID ra Serial (debug) */
    static void printAll();

private:
    static unsigned long _lastSyncMs;

    // NVS keys
    static const char* NVS_NAMESPACE;     // "sdms_wl"
    static const char* KEY_UIDS;          // "uids"   — CSV string of UIDs
    static const char* KEY_COUNT;         // "count"  — int32
    static const char* KEY_SYNC_TS;       // "sync_ts"— uint32 (millis epoch)
};

#endif // OFFLINE_WHITELIST_H
