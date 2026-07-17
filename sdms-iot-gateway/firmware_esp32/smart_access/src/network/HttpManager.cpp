#include "HttpManager.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "../config/Config.h"
#include "../drivers/RelayController.h"

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

void HttpManager::verifyCard(String rfidCode, camera_fb_t *fb) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[HTTP] WiFi not connected. Cannot verify card.");
        return;
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
        return;
    }

    memcpy(body, head.c_str(), head.length());
    if (imageLen > 0) {
        memcpy(body + head.length(), fb->buf, fb->len);
    }
    memcpy(body + head.length() + imageLen, tail.c_str(), tail.length());

    int httpCode = http.sendRequest("POST", body, totalLen);
    free(body);
    
    if (httpCode > 0) {
        String response = http.getString();
        Serial.println("[HTTP] Card Verify Response: " + response);
    } else {
        Serial.printf("[HTTP] Failed to verify card. HTTP Code: %d\n", httpCode);
    }
    
    http.end();
}
