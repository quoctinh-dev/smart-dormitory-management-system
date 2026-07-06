#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ================= CẤU HÌNH WIFI =================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ================= CẤU HÌNH API =================
// Đổi IP này thành IP máy tính chạy Spring Boot (VD: 192.168.1.100)
String serverUrl = "http://192.168.1.xxx:8080/api/v1/smartaccess/verify/face";
String gateId = "123e4567-e89b-12d3-a456-426614174000"; // Thay bằng UUID thật của cổng

// ================= CẤU HÌNH PHẦN CỨNG =================
// AI Thinker ESP32-CAM (OV2640) bị giới hạn GPIO.
// IO4 dính tới đèn Flash lớn, dùng IO12 cho Relay và IO13 cho nút nhấn (không dùng chế độ SD 4-line)
#define RELAY_PIN 12     // Chân điều khiển Relay mở cửa (An toàn)
#define BUTTON_PIN 13    // Chân nút nhấn chụp ảnh
#define FLASH_LED_PIN 4  // Chân đèn Flash (chỉ dùng để nhá sáng chụp đêm)

// Cấu hình chân cho ESP32-CAM (AI-Thinker)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Mặc định khóa cửa
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // 1. Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nĐã kết nối WiFi!");

  // 2. Khởi tạo Camera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // TỐI ƯU THEO HARDWARE DIAGNOSTIC: 
  // Dùng VGA (640x480) để đảm bảo độ nét cho AI, file size ~40KB gửi mạng cực nhanh.
  // Không cần fb_count = 2 vì ta không livestream, chụp 1 tấm rồi hủy.
  if(psramFound()){
    config.frame_size = FRAMESIZE_VGA; 
    config.jpeg_quality = 12; // 0-63, số nhỏ ảnh đẹp. 12 là cân bằng nhất.
    config.fb_count = 1;      // Dùng 1 buffer để ảnh luôn là ảnh mới nhất, tiết kiệm RAM.
  } else {
    // Fallback nếu mạch lỗi PSRAM
    config.frame_size = FRAMESIZE_QVGA; 
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Khởi tạo camera thất bại: 0x%x", err);
    return;
  }
  Serial.println("Camera đã sẵn sàng!");
}

void loop() {
  // Chờ người dùng bấm nút để chụp
  if (digitalRead(BUTTON_PIN) == LOW) {
    Serial.println("Đã bấm nút! Đang chụp ảnh...");
    delay(200); // Chống dội phím (debounce)
    
    // 1. Chụp ảnh - Cần dọn rác khung hình rác (nếu có) trước khi chụp thật
    // Do fb_count=1, gọi fb_get lần 1 để xả buffer cũ (nếu lưu cặn), lần 2 là ảnh real-time
    camera_fb_t * dummy_fb = esp_camera_fb_get();
    if(dummy_fb) esp_camera_fb_return(dummy_fb);

    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Lỗi: Không thể chụp ảnh");
      return;
    }
    Serial.printf("Đã chụp ảnh. Kích thước file: %d bytes\n", fb->len);

    // Bật nhẹ đèn Flash nếu cần sáng (Tùy chọn)
    // digitalWrite(FLASH_LED_PIN, HIGH); delay(50); digitalWrite(FLASH_LED_PIN, LOW);

    // 2. Gửi ảnh lên Spring Boot
    sendImageToBackend(fb);

    // 3. Trả lại buffer cho camera
    esp_camera_fb_return(fb);
    
    delay(3000); // Đợi 3 giây trước khi cho phép chụp tiếp
  }
}

void sendImageToBackend(camera_fb_t * fb) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Lỗi: Mất kết nối WiFi");
    return;
  }

  HTTPClient http;
  String fullUrl = serverUrl + "?gateId=" + gateId;
  http.begin(fullUrl);
  
  // Cấu hình Header cho Multipart/form-data
  String boundary = "----ESP32Boundary123456789";
  http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

  // Tạo phần Header của file
  String head = "--" + boundary + "\r\n";
  head += "Content-Disposition: form-data; name=\"file\"; filename=\"face.jpg\"\r\n";
  head += "Content-Type: image/jpeg\r\n\r\n";
  
  // Tạo phần đuôi (Footer)
  String tail = "\r\n--" + boundary + "--\r\n";

  // Tính tổng dung lượng Request
  size_t totalLength = head.length() + fb->len + tail.length();

  // Mở connection
  http.setTimeout(10000); // Chờ tối đa 10s
  int httpCode = http.sendRequest("POST", (uint8_t *)head.c_str(), head.length(), (uint8_t *)fb->buf, fb->len, (uint8_t *)tail.c_str(), tail.length());

  // Xử lý phản hồi từ Spring Boot
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    Serial.println("Phản hồi từ Server: " + payload);

    // Parse JSON
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      String status = doc["status"];
      if (status == "GRANTED") {
        Serial.println("✅ CHO PHÉP VÀO! Bật Relay mở cửa...");
        openDoor();
      } else if (status == "DENIED") {
        Serial.println("❌ TỪ CHỐI! " + doc["message"].as<String>());
        // Nháy đèn đỏ / kêu còi
      } else {
        Serial.println("⚠️ LỖI HỆ THỐNG: " + doc["message"].as<String>());
      }
    } else {
      Serial.println("Lỗi đọc JSON phản hồi");
    }
  } else {
    Serial.printf("Lỗi gọi API. HTTP Code: %d\n", httpCode);
  }
  
  http.end();
}

void openDoor() {
  digitalWrite(RELAY_PIN, HIGH); // Bật relay
  delay(5000);                   // Mở cửa trong 5 giây
  digitalWrite(RELAY_PIN, LOW);  // Khóa lại
  Serial.println("Đã khóa cửa lại.");
}
