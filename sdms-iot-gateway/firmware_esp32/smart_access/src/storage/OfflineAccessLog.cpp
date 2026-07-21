#include "OfflineAccessLog.h"
#include <Preferences.h>
#include <ArduinoJson.h>

const char* OfflineAccessLog::NVS_NAMESPACE = "sdms_alog";
const char* OfflineAccessLog::KEY_HEAD      = "head";
const char* OfflineAccessLog::KEY_COUNT     = "count";

int OfflineAccessLog::_head = 0;
int OfflineAccessLog::_count = 0;

void OfflineAccessLog::begin() {
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, true);
    _head = prefs.getInt(KEY_HEAD, 0);
    _count = prefs.getInt(KEY_COUNT, 0);
    prefs.end();
    
    Serial.printf("[OfflineLog] NVS initialized. Pending logs: %d\n", _count);
}

void OfflineAccessLog::push(const String& uid, unsigned long timestamp, const String& action) {
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, false);
    
    // Format: "1234567,A1B2C3D4,OFFLINE_GRANT"
    String logEntry = String(timestamp) + "," + uid + "," + action;
    
    String key = "log_" + String(_head);
    prefs.putString(key.c_str(), logEntry);
    
    _head = (_head + 1) % MAX_LOGS;
    if (_count < MAX_LOGS) {
        _count++;
    }
    
    prefs.putInt(KEY_HEAD, _head);
    prefs.putInt(KEY_COUNT, _count);
    
    prefs.end();
    
    Serial.printf("[OfflineLog] Saved log: %s (count: %d)\n", logEntry.c_str(), _count);
}

bool OfflineAccessLog::hasPending() {
    return _count > 0;
}

int OfflineAccessLog::getPendingCount() {
    return _count;
}

String OfflineAccessLog::getBatchJson() {
    if (_count == 0) return "[]";
    
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, true);
    
    // JSON Array
    DynamicJsonDocument doc(4096);
    JsonArray arr = doc.to<JsonArray>();
    
    int startIndex = (_head - _count + MAX_LOGS) % MAX_LOGS;
    
    for (int i = 0; i < _count; i++) {
        int idx = (startIndex + i) % MAX_LOGS;
        String key = "log_" + String(idx);
        String entry = prefs.getString(key.c_str(), "");
        
        if (entry.length() > 0) {
            // Parse CSV: timestamp,uid,action
            int firstComma = entry.indexOf(',');
            int secondComma = entry.indexOf(',', firstComma + 1);
            
            if (firstComma != -1 && secondComma != -1) {
                unsigned long ts = entry.substring(0, firstComma).toInt();
                String uid = entry.substring(firstComma + 1, secondComma);
                String action = entry.substring(secondComma + 1);
                
                JsonObject obj = arr.createNestedObject();
                obj["uid"] = uid;
                obj["timestamp"] = ts;
                obj["action"] = action;
            }
        }
    }
    
    prefs.end();
    
    String result;
    serializeJson(doc, result);
    return result;
}

void OfflineAccessLog::clear() {
    Preferences prefs;
    prefs.begin(NVS_NAMESPACE, false);
    prefs.clear();
    prefs.end();
    
    _head = 0;
    _count = 0;
    Serial.println("[OfflineLog] Cleared pending logs.");
}
