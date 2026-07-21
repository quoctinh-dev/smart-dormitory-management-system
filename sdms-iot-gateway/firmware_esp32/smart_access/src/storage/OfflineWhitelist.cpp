#include "OfflineWhitelist.h"
#include <Preferences.h>
#include <ArduinoJson.h>

// ==============================================================================
// NVS Key Definitions
// Namespace "sdms_wl" (~10KB limit) lưu CSV string của các UID
// VD: "A1B2C3D4,B2C3D4E5,C3D4E5F6"
// ==============================================================================
const char* OfflineWhitelist::NVS_NAMESPACE = "sdms_wl";
const char* OfflineWhitelist::KEY_UIDS      = "uids";
const char* OfflineWhitelist::KEY_COUNT     = "count";
const char* OfflineWhitelist::KEY_SYNC_TS   = "sync_ts";

unsigned long OfflineWhitelist::_lastSyncMs = 0;

// ==============================================================================
// begin() — Khởi tạo NVS namespace
// ==============================================================================
void OfflineWhitelist::begin() {
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, true); // read-only để kiểm tra
    int storedCount = prefs.getInt(KEY_COUNT, 0);
    unsigned long storedTs = prefs.getULong(KEY_SYNC_TS, 0);
    prefs.end();

    if (storedTs > 0) {
        _lastSyncMs = storedTs; // Phục hồi timestamp từ lần sync trước
    }

    Serial.println("[Whitelist] NVS initialized.");
    Serial.printf("[Whitelist] Stored UIDs: %d | Last Sync: %lu ms ago\n",
                  storedCount, storedTs);
}

// ==============================================================================
// contains() — Kiểm tra UID trong CSV lưu trong NVS
// Tìm kiếm: ",UID," hoặc "UID," ở đầu hoặc ",UID" ở cuối
// ==============================================================================
bool OfflineWhitelist::contains(const String& uid) {
    if (uid.isEmpty()) return false;

    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, true); // read-only
    String csv = prefs.getString(KEY_UIDS, "");
    prefs.end();

    if (csv.isEmpty()) {
        Serial.println("[Whitelist] NVS empty — no offline access possible.");
        return false;
    }

    // Chuẩn hóa UID về uppercase trước khi so sánh
    String upperUid = uid;
    upperUid.toUpperCase();

    // Thêm delimiters để tìm chính xác (tránh "A1B2" match "A1B2C3")
    String haystack = "," + csv + ",";
    String needle   = "," + upperUid + ",";

    bool found = haystack.indexOf(needle) >= 0;
    Serial.printf("[Whitelist] Lookup UID=%s → %s\n",
                  upperUid.c_str(), found ? "FOUND" : "NOT FOUND");
    return found;
}

// ==============================================================================
// saveFromJson() — Parse JSON từ HTTP GET /rfid-whitelist
//
// Backend response format (thực tế):
// {
//   "success": true,
//   "data": {
//     "count": 1,
//     "data": {
//       "<building-uuid>": ["UID1", "UID2", ...],
//       "<building-uuid-2>": ["UID3", ...]
//     }
//   }
// }
// ESP32 gộp tất cả UID từ mọi building vào 1 NVS (thiết bị cổng chỉ cần biết ai được vào)
// ==============================================================================
int OfflineWhitelist::saveFromJson(const String& jsonPayload) {
    // DynamicJsonDocument trong PSRAM — đủ lớn cho 1000 UID
    DynamicJsonDocument doc(16384);
    DeserializationError err = deserializeJson(doc, jsonPayload);

    if (err) {
        Serial.printf("[Whitelist] JSON parse error: %s\n", err.c_str());
        return -1;
    }

    // Kiểm tra API envelope
    bool success = doc["success"] | false;
    if (!success) {
        String errorCode = doc["errorCode"] | "UNKNOWN";
        String message   = doc["message"]   | "";
        Serial.printf("[Whitelist] API Error: [%s] %s\n",
                      errorCode.c_str(), message.c_str());
        return -1;
    }

    // Backend trả về: data.data = {"<uuid>": ["UID1", "UID2", ...]}
    // Là JsonObject: iterate từng building, gộp hết vào 1 CSV
    JsonObject buildingMap = doc["data"]["data"].as<JsonObject>();
    if (buildingMap.isNull()) {
        Serial.println("[Whitelist] No 'data.data' object found in HTTP response.");
        return -1;
    }

    String csv = "";
    int savedCount = 0;
    const int MAX_UIDS = 1000;

    for (JsonPair kv : buildingMap) {
        // kv.key() = buildingId UUID string, kv.value() = array of UIDs
        JsonArray uidsArray = kv.value().as<JsonArray>();
        if (uidsArray.isNull()) continue;

        for (JsonVariant v : uidsArray) {
            if (savedCount >= MAX_UIDS) {
                Serial.printf("[Whitelist] WARNING: Reached max limit of %d UIDs. Truncating.\n", MAX_UIDS);
                goto done_building_loop; // Break outer loop
            }
            String uid = v.as<String>();
            uid.toUpperCase();
            if (!csv.isEmpty()) csv += ",";
            csv += uid;
            savedCount++;
        }
    }
    done_building_loop:

    if (savedCount == 0) {
        Serial.println("[Whitelist] WARNING: No UIDs found in response. Check if any students have RFID assigned.");
    }

    // Lưu vào NVS
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, false); // read-write
    prefs.putString(KEY_UIDS, csv);
    prefs.putInt(KEY_COUNT, savedCount);
    _lastSyncMs = millis();
    prefs.putULong(KEY_SYNC_TS, _lastSyncMs);
    prefs.end();

    Serial.printf("[Whitelist] ✅ Saved %d UIDs to NVS (HTTP sync).\n", savedCount);
    return savedCount;
}

// ==============================================================================
// saveFromMqttJson() — Parse payload từ MQTT PUSH (Backend → ESP32)
//
// Backend push topic: sdms/gates/building/<buildingId>/whitelist
// Payload format:
// {
//   "type": "WHITELIST_SYNC",
//   "count": 2,
//   "data": ["A1B2C3D4", "B2C3D4E5", ...],
//   "timestamp": 1234567890
// }
// ==============================================================================
int OfflineWhitelist::saveFromMqttJson(const String& jsonPayload) {
    DynamicJsonDocument doc(16384);
    DeserializationError err = deserializeJson(doc, jsonPayload);

    if (err) {
        Serial.printf("[Whitelist] MQTT JSON parse error: %s\n", err.c_str());
        return -1;
    }

    String type = doc["type"] | "";
    if (type != "WHITELIST_SYNC") {
        Serial.printf("[Whitelist] Unexpected MQTT type: %s\n", type.c_str());
        return -1;
    }

    JsonArray uidsArray = doc["data"].as<JsonArray>();
    if (uidsArray.isNull()) {
        Serial.println("[Whitelist] No 'data' array in MQTT whitelist payload.");
        return -1;
    }

    String csv = "";
    int savedCount = 0;
    const int MAX_UIDS = 1000;

    for (JsonVariant v : uidsArray) {
        if (savedCount >= MAX_UIDS) break;
        String uid = v.as<String>();
        uid.toUpperCase();
        if (!csv.isEmpty()) csv += ",";
        csv += uid;
        savedCount++;
    }

    // Lưu vào NVS (APPEND: gộp với các building đã lưu trước)
    // Đơn giản hóa: overwrite toàn bộ vì ESP32 thường thuộc 1 building
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, false);
    prefs.putString(KEY_UIDS, csv);
    prefs.putInt(KEY_COUNT, savedCount);
    _lastSyncMs = millis();
    prefs.putULong(KEY_SYNC_TS, _lastSyncMs);
    prefs.end();

    Serial.printf("[Whitelist] ✅ Saved %d UIDs to NVS (MQTT push).\n", savedCount);
    return savedCount;
}

// ==============================================================================
// count() — Số UID đang lưu
// ==============================================================================
int OfflineWhitelist::count() {
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, true);
    int c = prefs.getInt(KEY_COUNT, 0);
    prefs.end();
    return c;
}

// ==============================================================================
// lastSyncMillis() — Timestamp của lần sync cuối
// ==============================================================================
unsigned long OfflineWhitelist::lastSyncMillis() {
    return _lastSyncMs;
}

// ==============================================================================
// clear() — Xóa toàn bộ whitelist trong NVS
// ==============================================================================
void OfflineWhitelist::clear() {
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, false);
    prefs.clear();
    prefs.end();
    _lastSyncMs = 0;
    Serial.println("[Whitelist] NVS cleared.");
}

// ==============================================================================
// printAll() — In danh sách UID ra Serial (debug)
// ==============================================================================
void OfflineWhitelist::printAll() {
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, true);
    String csv = prefs.getString(KEY_UIDS, "");
    int c = prefs.getInt(KEY_COUNT, 0);
    prefs.end();

    Serial.printf("[Whitelist] --- Stored UIDs (%d) ---\n", c);
    if (csv.isEmpty()) {
        Serial.println("[Whitelist]   (empty)");
        return;
    }

    // In từng UID
    int start = 0;
    int idx = 0;
    while (start < (int)csv.length()) {
        int comma = csv.indexOf(',', start);
        String uid = (comma == -1) ? csv.substring(start) : csv.substring(start, comma);
        Serial.printf("[Whitelist]   [%d] %s\n", idx++, uid.c_str());
        if (comma == -1) break;
        start = comma + 1;
    }
    Serial.println("[Whitelist] ----------------------------");
}
