# TÀI LIỆU THIẾT KẾ KIẾN TRÚC FIRMWARE ESP32-CAM (SDMS)

**Phiên bản:** 1.0  
**Đối tượng:** Embedded Software Engineer (Vỹ)  
**Nền tảng:** AI Thinker ESP32-CAM (ESP-IDF / Arduino Framework)  
**Mô hình:** Edge Device (Capture & Upload) - Không xử lý AI tại biên.

---

## 1. Firmware Architecture (Clean Architecture cho Embedded)

Firmware được thiết kế phân lớp (Layered Architecture) giúp tách biệt phần cứng (Hardware) ra khỏi nghiệp vụ (Business Logic). 

- **Application Layer (Lớp Ứng dụng):** Chứa `main.ino` và vòng lặp `loop()`. Điều phối luồng hoạt động chính của hệ thống.
- **Service Layer (Lớp Nghiệp vụ):** Chứa logic vận hành của Smart Access (VD: `AccessControlService`). Xử lý nghiệp vụ gửi ảnh, nhận kết quả và quyết định mở cửa.
- **Hardware Abstraction Layer - HAL (Lớp Đệm Cứng):** Bao bọc các API của ESP-IDF. Bao gồm `CameraManager`, `WiFiManager`, `HttpClientWrapper`, `LedController`.
- **Driver Layer (Lớp Trình điều khiển):** Thư viện cấp thấp (`esp_camera.h`, `WiFi.h`, `HTTPClient.h`).

**Dependency Rule:** Lớp trên chỉ được gọi lớp dưới. Lớp dưới không được biết sự tồn tại của lớp trên (Dùng Callbacks/Events để phản hồi lên trên).

---

## 2. Folder Structure (Cấu trúc thư mục)

Khuyến nghị sử dụng **PlatformIO** (hoặc cấu hình lại thư mục Arduino IDE) theo cấu trúc chuẩn:

```text
src/
├── main.ino                  // Điểm bắt đầu (Setup & Loop)
├── config/
│   ├── Config.h              // KHÔNG HARDCODE. Chứa các biến cấu hình (SSID, API URL, GateID)
│   └── Pins.h                // Định nghĩa sơ đồ chân (GPIO)
├── driver/
│   ├── CameraDriver.cpp      // Bọc esp_camera.h
│   └── LedDriver.cpp         // Bọc digitalWrite()
├── network/
│   ├── WiFiManager.cpp       // Xử lý kết nối và Auto-Reconnect
│   └── ApiClient.cpp         // Gửi HTTP Multipart và parse JSON
├── service/
│   └── AccessService.cpp     // Ghép nối Camera + ApiClient + LedDriver
└── utils/
    ├── Logger.h              // Hàm in log chuẩn mực
    └── StateMachine.h        // Quản lý trạng thái hệ thống
```

---

## 3. Module Responsibilities (Trách nhiệm của từng Module)

- `Config / Pins`: Nơi duy nhất chứa các thông số môi trường. Muốn đổi IP backend hay đổi chân GPIO thì chỉ sửa ở đây.
- `CameraDriver`: Chỉ chịu trách nhiệm khởi tạo OV2640, chụp ảnh, giải phóng buffer. Không biết gì về WiFi.
- `LedDriver`: Bọc chân GPIO của Flash LED (hoặc Relay sau này). Cung cấp hàm `turnOn()`, `turnOff()`, `blink(times, delayMs)`.
- `ApiClient`: Nhận buffer ảnh từ ngoài, đóng gói `multipart/form-data`, đẩy lên Spring Boot và trả về chuỗi JSON thô.
- `AccessService`: Nhạc trưởng. Ra lệnh Camera chụp ảnh -> Gọi ApiClient gửi đi -> Đọc JSON `{"status": "GRANTED"}` -> Ra lệnh LedDriver nháy sáng.

---

## 4. State Machine (Trạng thái LED mô phỏng Relay)

Do hiện tại chưa có mạch Relay điện 220V/12V, ta dùng Flash LED (GPIO 4) để giả lập trạng thái đóng/mở cửa giúp dễ dàng Debug.

| State (Trạng thái) | LED Behavior (Hành vi LED) | Ý nghĩa (Description) |
| :--- | :--- | :--- |
| `BOOTING` | Nháy chậm (Chu kỳ 1s) | Mạch đang khởi động, setup camera và các chân GPIO. |
| `CONNECTING_WIFI` | Nháy nhanh (Chu kỳ 200ms) | Đang dò tìm và kết nối tới Access Point. |
| `READY` | TẮT hoàn toàn | Đã kết nối mạng, Camera sẵn sàng. Đang chờ tín hiệu. |
| `CAPTURING_IMAGE` | Sáng liên tục (Duy trì) | Đang bấm nút chụp ảnh và đóng gói dữ liệu ảnh. |
| `UPLOADING` | Nháy rất nhanh (Chu kỳ 100ms) | Đang truyền tải HTTP Multipart lên Spring Boot. |
| `ACCESS_GRANTED` | SÁNG LIÊN TỤC 5 GIÂY | Mở cửa thành công! (Thay thế Relay ON). |
| `ACCESS_DENIED` | Nháy 3 lần rõ rệt rồi tắt | Bị từ chối mở cửa (Sai mặt, quá giờ giới nghiêm). |
| `SYSTEM_ERROR` | Nháy liên tục không ngừng | Lỗi phần cứng (Hư camera, mất WiFi, AI Backend sập). |

---

## 5. Roadmap Development (Lộ trình phát triển 10 Bước)

- **STEP 1 - Hardware Diagnostic:** Viết code chớp tắt LED để xác minh GPIO hoạt động và board không hỏng.
- **STEP 2 - Camera Diagnostic:** Khởi tạo OV2640 (VGA 640x480). Đảm bảo không bị lỗi `psram alloc failed`.
- **STEP 3 - WiFi Manager:** Viết module kết nối mạng, có khả năng tự động Reconnect khi mất mạng.
- **STEP 4 - REST Client:** Gửi một chuỗi HTTP GET đơn giản lên Spring Boot để test kết nối LAN/Internet.
- **STEP 5 - Capture Image:** Viết hàm chụp ảnh, lấy kích thước file (bytes) in ra Serial Monitor.
- **STEP 6 - Upload Image:** Ghép nối Step 4 và Step 5. Đẩy form-data lên `/api/v1/smartaccess/verify/face`.
- **STEP 7 - Receive Verification Result:** Tích hợp `ArduinoJson` để bóc tách trường `status`.
- **STEP 8 - GPIO Output (LED State Machine):** Áp dụng bảng State Machine ở Phần 4 vào code.
- **STEP 9 - Relay Integration (Tương lai):** Khi có phần cứng khóa từ, đổi chân GPIO4 (Flash) sang GPIO12 (Relay).
- **STEP 10 - Production Firmware:** Clean code, tắt Serial Print (để tiết kiệm tài nguyên), đóng gói file `.bin`.

---

## 6. Best Practices

- **Memory Management:** Phải gọi `esp_camera_fb_return(fb)` ngay sau khi chụp và upload xong để giải phóng PSRAM. Tránh tràn RAM (Memory Leak).
- **Non-Blocking:** Hạn chế dùng `delay()` trong vòng lặp chính. Nên dùng `millis()` để tính toán thời gian chớp tắt LED giúp mạch không bị "đơ" khi đang xử lý mạng.
- **Watchdog Timer (WDT):** Kích hoạt WDT. Nếu mạch bị treo (treo kết nối HTTP, treo camera), WDT sẽ tự động Reset mạch cứng sau 10 giây.

---

## 7. Coding Standards

- Đặt tên biến: `camelCase` (vd: `cameraBuffer`).
- Đặt tên hằng số: `UPPER_SNAKE_CASE` (vd: `MAX_RETRIES`).
- Mọi hàm trả về lỗi nên dùng `enum ErrorCode` thay vì trả về `boolean` chung chung.
- Bọc toàn bộ các tham số môi trường trong `#ifndef CONFIG_H ... #define CONFIG_H`.

---

## 8. Error Handling Strategy

- **Lỗi Mất Mạng:** Catch lỗi kết nối, chuyển LED sang trạng thái `CONNECTING_WIFI` và gọi ngầm hàm Reconnect, không văng app.
- **Lỗi AI Down (HTTP 500):** Parse JSON thấy lỗi 500 hoặc Timeout, chuyển sang trạng thái `SYSTEM_ERROR` báo động cho sinh viên.
- **Lỗi Camera:** Nếu hàm `esp_camera_init` thất bại lúc boot, mạch sẽ nháy đèn báo lỗi và gọi lệnh `ESP.restart()`.

---

## 9. Retry Strategy

- Nếu HTTP Upload thất bại do mạng chập chờn: ESP32 sẽ thử lại tối đa **3 lần** (cách nhau 500ms).
- Nếu quá 3 lần vẫn lỗi -> Hủy quy trình, báo `SYSTEM_ERROR` và chờ nút bấm lần tiếp theo. Tránh việc mạch ráng upload mãi 1 tấm hình làm tắc nghẽn hàng đợi.

---

## 10. Future Extension Plan

Nhờ chia tách Module theo Clean Architecture, việc nâng cấp sau này rất dễ dàng:
- **Thêm Relay thật:** Chỉ cần sửa hằng số chân `LED_PIN` thành `RELAY_PIN` trong `Config.h`. `AccessService` không cần sửa 1 dòng nào.
- **Hỗ trợ thẻ RFID (Offline Mode):** Tạo thêm module `RfidDriver.cpp`. Lắp vào `AccessService` để quẹt thẻ song song với việc chụp ảnh.
- **Cấu hình WiFi qua Bluetooth (BLE Provisioning):** Cắm module `BleManager.cpp` để nhập WiFi bằng điện thoại thay vì hardcode trong file config.
- **OTA Update:** Tích hợp module `OtaManager.cpp` nhận lệnh từ Spring Boot để tự động tải file `.bin` nạp firmware từ xa.
