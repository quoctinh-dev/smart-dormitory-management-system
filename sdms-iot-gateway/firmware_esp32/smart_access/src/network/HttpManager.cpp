#include "HttpManager.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "../config/Config.h"
#include "../drivers/RelayController.h"
#include "../storage/OfflineWhitelist.h"
#include "../storage/OfflineAccessLog.h"

String HttpManager::uploadFace(camera_fb_t *fb) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[HTTP] Error: WiFi not connected. Cannot upload face.");
        return "WIFI_ERROR";
    }

    if (fb == nullptr || fb->len == 0) {
        Serial.println("[HTTP] Error: Empty frame buffer.");
        return "CAMERA_ERROR";
    }

    Serial.println("[HTTP] Starting Multipart Upload to Backend...");

    HTTPClient http;
    String fullUrl = BACKEND_BASE_URL + "/verify/face?gateId=" + GATE_ID;
    http.begin(fullUrl);
    
    // Cấu hình Timeout (rất quan trọng)
    http.setTimeout(HTTP_TIMEOUT);

    // Cấu hình Header cho Multipart/form-data
    String boundary = "----ESP32Boundary123456789";
    http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

    // Tạo phần Header của file
    String head = "--" + boundary + "\r\n";
    head += "Content-Disposition: form-data; name=\"file\"; filename=\"face.jpg\"\r\n";
    head += "Content-Type: image/jpeg\r\n\r\n";
    
    // Tạo phần đuôi (Footer)
    String tail = "\r\n--" + boundary + "--\r\n";

    // Gộp tất cả vào 1 buffer trong PSRAM để gửi đi 1 lần
    size_t totalLen = head.length() + fb->len + tail.length();
    uint8_t *body = (uint8_t*)ps_malloc(totalLen);
    
    if (body == nullptr) {
        Serial.println("[HTTP] Error: PSRAM malloc failed for HTTP payload!");
        http.end();
        return "MALLOC_ERROR";
    }

    // Copy data vào buffer
    memcpy(body, head.c_str(), head.length());
    memcpy(body + head.length(), fb->buf, fb->len);
    memcpy(body + head.length() + fb->len, tail.c_str(), tail.length());

    // Mở connection và gửi
    int httpCode = http.sendRequest("POST", body, totalLen);

    // Giải phóng PSRAM ngay lập tức
    free(body);

    String finalResult = "ERROR";

    // Xử lý phản hồi từ Spring Boot
    if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("[HTTP] Server Response: " + payload);

        // Parse JSON
        StaticJsonDocument<512> doc;
        DeserializationError error = deserializeJson(doc, payload);

        if (!error) {
            bool success = doc["success"];
            String message = doc["message"];
            
            if (success) {
                String status = doc["data"]["status"];
                if (status == "GRANTED") {
                    Serial.println("[AI RESULT] ✅ FACE MATCHED! Access Granted.");
                    RelayController::unlock(); // Gọi Relay
                    finalResult = "GRANTED";
                } else {
                    // Mặc dù success=true nhưng AI trả về status=DENIED 
                    // (chẳng hạn nhận dạng sai nhưng API không throw exception)
                    Serial.println("[AI RESULT] ❌ ACCESS DENIED! " + message);
                    finalResult = "DENIED:" + message;
                }
            } else {
                String errorCode = doc["errorCode"];
                Serial.println("[AI RESULT] ⚠️ SERVER ERROR: " + errorCode + " - " + message);
                finalResult = "DENIED:" + message;
            }
        } else {
            Serial.println("[HTTP] Failed to parse JSON response");
            finalResult = "JSON_ERROR";
        }
    } else {
        String payload = http.getString();
        Serial.printf("[HTTP] Failed to call API. HTTP Code: %d\n", httpCode);
        Serial.println("[HTTP] Payload: " + payload);
        
        StaticJsonDocument<512> doc;
        DeserializationError error = deserializeJson(doc, payload);
        if (!error && doc.containsKey("message")) {
            finalResult = "API_ERROR:" + String(doc["message"].as<const char*>());
        } else {
            finalResult = "HTTP_ERROR_" + String(httpCode);
        }
    }
    
    http.end();
    return finalResult;
}

bool HttpManager::verifyCard(String rfidCode, camera_fb_t *fb) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[HTTP] WiFi not connected. Cannot verify card.");
        return false;
    }

    HTTPClient http;
    String fullUrl = BACKEND_BASE_URL + "/verify/card";
    http.begin(fullUrl);
    http.setTimeout(HTTP_TIMEOUT);

    String boundary = "----ESP32Boundary987654321";
    http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

    // Xây dựng body (String part)
    String head = "--" + boundary + "\r\n";
    head += "Content-Disposition: form-data; name=\"rfid\"\r\n\r\n";
    head += rfidCode + "\r\n";
    
    head += "--" + boundary + "\r\n";
    head += "Content-Disposition: form-data; name=\"gateId\"\r\n\r\n";
    head += GATE_ID + "\r\n";

    if (fb != nullptr && fb->len > 0) {
        head += "--" + boundary + "\r\n";
        head += "Content-Disposition: form-data; name=\"snapshot\"; filename=\"snapshot.jpg\"\r\n";
        head += "Content-Type: image/jpeg\r\n\r\n";
    }

    String tail = "\r\n--" + boundary + "--\r\n";

    size_t imageLen = (fb != nullptr) ? fb->len : 0;
    size_t totalLen = head.length() + imageLen + tail.length();

    uint8_t *body = (uint8_t*)ps_malloc(totalLen);
    if (body == nullptr) {
        Serial.println("[HTTP] Error: PSRAM malloc failed for verifyCard payload!");
        http.end();
        return false;
    }

    memcpy(body, head.c_str(), head.length());
    if (imageLen > 0) {
        memcpy(body + head.length(), fb->buf, fb->len);
    }
    memcpy(body + head.length() + imageLen, tail.c_str(), tail.length());

    int httpCode = http.sendRequest("POST", body, totalLen);
    free(body);
    
    bool success = false;
    if (httpCode > 0) {
        String response = http.getString();
        Serial.println("[HTTP] Card Verify Response: " + response);
        // Server phản hồi thành công (dù thẻ đúng hay sai), nghĩa là không bị rớt mạng
        success = true;
    } else {
        Serial.printf("[HTTP] Failed to verify card. HTTP Code: %d\n", httpCode);
        success = false;
    }
    
    http.end();
    return success;
}

// ==============================================================================
// fetchAndSaveWhitelist() — Kéo RFID Whitelist từ Backend, lưu vào NVS
// API: GET /api/v1/smartaccess/rfid-whitelist?buildingId=<BUILDING_ID>
// ==============================================================================
int HttpManager::fetchAndSaveWhitelist() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[HTTP] Whitelist sync skipped: WiFi not connected.");
        return -1;
    }

    Serial.println("[HTTP] Fetching RFID Whitelist from Backend...");

    HTTPClient http;
    String url = BACKEND_BASE_URL + "/rfid-whitelist?buildingId=" + BUILDING_ID;
    http.begin(url);
    http.setTimeout(HTTP_TIMEOUT);
    http.addHeader("Accept", "application/json");

    int httpCode = http.GET();

    if (httpCode != HTTP_CODE_OK) {
        Serial.printf("[HTTP] Whitelist fetch failed. HTTP Code: %d\n", httpCode);
        http.end();
        return -1;
    }

    String payload = http.getString();
    http.end();

    Serial.printf("[HTTP] Whitelist response received (%d bytes).\n", payload.length());

    // Delegate parse & save to OfflineWhitelist
    int saved = OfflineWhitelist::saveFromJson(payload);
    if (saved >= 0) {
        Serial.printf("[HTTP] ✅ Whitelist sync complete: %d UIDs stored.\n", saved);
    } else {
        Serial.println("[HTTP] ❌ Whitelist sync failed: JSON parse or API error.");
    }
    return saved;
}

// ==============================================================================
// syncOfflineLogs() — Đẩy lịch sử quẹt thẻ lúc offline lên Backend
// API: POST /api/v1/smartaccess/offline-log-batch
// ==============================================================================
void HttpManager::syncOfflineLogs() {
    if (WiFi.status() != WL_CONNECTED) return;
    
    // Phải include OfflineAccessLog ở trên đầu file
    if (!OfflineAccessLog::hasPending()) return;

    Serial.println("[HTTP] Synchronizing offline logs to Backend...");
    
    String logsJson = OfflineAccessLog::getBatchJson();
    String payload = "{\"gateId\":\"" + GATE_ID + "\",\"currentMillis\":" + String(millis()) + ",\"logs\":" + logsJson + "}";

    HTTPClient http;
    http.begin(BACKEND_BASE_URL + "/offline-log-batch");
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT);

    int httpCode = http.POST(payload);

    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
        Serial.println("[HTTP] ✅ Offline logs synced successfully.");
        OfflineAccessLog::clear();
    } else {
        Serial.printf("[HTTP] ❌ Failed to sync offline logs. HTTP Code: %d\n", httpCode);
        String response = http.getString();
        Serial.println("[HTTP] Response: " + response);
    }
    
    http.end();
}

