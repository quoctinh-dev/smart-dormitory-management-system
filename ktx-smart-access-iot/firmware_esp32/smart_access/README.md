# SDMS Smart Access - ESP32 Firmware

Đây là mã nguồn điều khiển phần cứng ESP32-CAM cho hệ thống Smart Dormitory Management System (Đồ án tốt nghiệp).

## CẤU TRÚC MỚI (PHẲNG - FLATTEN)
Để Arduino IDE có thể hiển thị TẤT CẢ các file code dưới dạng Tab (thẻ) trên cùng màn hình, toàn bộ cấu trúc thư mục con đã được gỡ bỏ. Tất cả các file `.h` và `.cpp` đều nằm cùng cấp với file `smart_access.ino`.

Khi bạn mở file `smart_access.ino`, Arduino IDE sẽ tự động mở thêm mười mấy tab bên cạnh như `Config.h`, `MqttManager.cpp`... Bạn chỉ cần bấm vào tab `Config.h` để sửa thông tin mạng là xong!

## HƯỚNG DẪN NẠP CODE & CHẠY THỰC TẾ

### 1. Chuẩn bị Thư viện
Vào `Sketch` -> `Include Library` -> `Manage Libraries` trong Arduino IDE và cài:
1. **PubSubClient** (Nick O'Leary)
2. **ArduinoJson** (Benoit Blanchon - Bản 6.x hoặc 7.x)

### 2. Cấu hình Mạng & Hệ thống
Mở Tab `Config.h` trên Arduino IDE, tìm dòng sau và sửa lại cho đúng với máy tính của bạn:
```cpp
const char* WIFI_SSID = "Tên_WiFi";
const char* WIFI_PASSWORD = "Mật_Khẩu";

// IP máy tính chạy Spring Boot
const String BACKEND_BASE_URL = "http://192.168.1.100:8080/api/v1/smartaccess";

// IP máy tính chạy Broker Mosquitto
const char* MQTT_BROKER_HOST = "192.168.1.100"; 
```

### 3. Sơ đồ Cắm Dây (Hardware)
* **GPIO 12:** Điều khiển Rơ-le (Relay) mở cửa.
* **GPIO 13:** Chân Nút bấm (Button) - Nối với Nút bấm, đầu còn lại nối GND. 
  *(Nếu không có nút, cứ cầm 1 cọng dây điện cắm vào GND, rồi quẹt đầu kia vào lỗ chân IO 13 là chụp ảnh).*
* **GPIO 4:** Đèn Flash siêu sáng (Có sẵn trên board).

### 4. Luồng Chạy Thực Tế (Test Flow)
1. **Khởi động:** ESP32 vào WiFi, gửi Heartbeat lên MQTT mỗi 30s.
2. **Quẹt chân 13 (Chụp ảnh):** Mạch lập tức chụp ảnh, bóp dung lượng xuống 20KB và ném thẳng lên hàm `/verify/face` của Spring Boot.
3. **Phản hồi:** AI báo `GRANTED`, mạch xuất điện HIGH ra chân 12 trong đúng 5 giây để mở cửa, sau đó tự khóa lại.
4. **Mở từ xa:** Trên máy tính bắn lệnh `UNLOCK` vào MQTT, mạch lập tức mở cửa mà không cần chụp ảnh.

---
*Developed for SDMS Graduation Thesis*
