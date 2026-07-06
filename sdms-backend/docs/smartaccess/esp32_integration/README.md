# Tài liệu Tích hợp Mạch ESP32-CAM & RFID (Hardware/Firmware)

Thư mục này dành riêng cho việc thiết kế, đấu nối phần cứng và lập trình nhúng (C/C++ bằng ESP-IDF hoặc Arduino Framework) cho trạm kiểm soát ra vào tại cửa ký túc xá.

## 📖 Trình tự Đọc Tài Liệu

Tất cả các tài liệu trong thư mục này đã được đồng bộ hóa 100% với mã nguồn Spring Boot Backend để đảm bảo quá trình tích hợp không xảy ra xung đột. Hãy đọc theo thứ tự sau trước khi cầm mỏ hàn hay gõ code C++:

### 1️⃣ [01_hardware_pinout_design.md](./01_hardware_pinout_design.md)
- **Nội dung:** Sơ đồ chân cắm (GPIO Pinout) an toàn cho ESP32-CAM.
- **Tại sao phải đọc?** Vì mạch AI-Thinker cực kỳ thiếu chân (chân Camera dùng chung với thẻ SD). Nếu cắm nhầm Relay vào GPIO 4 (Chân đèn Flash) thì khi khởi động mạch có thể bị chập cháy hoặc không boot được.

### 2️⃣ [02_firmware_architecture.md](./02_firmware_architecture.md)
- **Nội dung:** Thiết kế kiến trúc phần mềm C/C++ (Clean Architecture cho nhúng).
- **Tại sao phải đọc?** Giúp code C++ của bạn không bị rối tinh rối mù thành một file `main.ino` khổng lồ. Tách biệt rõ ràng lớp Xử lý Camera, lớp Nút bấm, và lớp HTTP Request.

### 3️⃣ [03_api_integration_spec.md](./03_api_integration_spec.md)
- **Nội dung:** Khế ước giao tiếp API (API Contract) giữa ESP32, Spring Boot và Python.
- **Tại sao phải đọc?** Bạn cần biết chính xác URL là gì (`/api/v1/smartaccess/verify/face`), gửi Request Body dạng gì (`multipart/form-data`) và bóc tách dữ liệu JSON (`GRANTED` hay `DENIED`) như thế nào để bật Relay.

### 4️⃣ [04_offline_mode_strategy.md](./04_offline_mode_strategy.md)
- **Nội dung:** Kịch bản xử lý rớt mạng Wifi hoặc sập Server.
- **Tại sao phải đọc?** Đây là điểm "ăn tiền" của đồ án. Hướng dẫn cách ESP32 lắng nghe dữ liệu từ Mosquitto MQTT (`sdms/gates/system/whitelist`) lưu thẻ RFID vào thẻ nhớ, để khi rớt mạng, sinh viên quẹt thẻ vẫn mở được cửa.

### 5️⃣ [05_AI_PROMPT_FOR_FIRMWARE_DEV.md](./05_AI_PROMPT_FOR_FIRMWARE_DEV.md)
- **Nội dung:** Lời gọi Trợ lý AI (Prompt).
- **Tại sao phải đọc?** Khi bạn bước vào code mạch, hãy copy đoạn text trong file này ném cho AI. AI sẽ tự động đọc hiểu 4 file trên và đóng vai trò Kỹ sư phần cứng hỗ trợ bạn.

### 6️⃣ [06_MQTT_INTEGRATION_AUDIT.md](./06_MQTT_INTEGRATION_AUDIT.md) & [07_ESP32_INTEGRATION_SPECIFICATION.md](./07_ESP32_INTEGRATION_SPECIFICATION.md)
- **Nội dung:** Báo cáo kiểm toán mã nguồn Backend & Bản Đặc tả Tích hợp Giao thức chuẩn (REST + MQTT).
- **Tại sao phải đọc?** Đã quét qua toàn bộ Backend và xác nhận hệ thống Backend hiện tại 100% không còn file giả lập (Mock). Tất cả các API, luồng MQTT mở cửa (Remote Unlock & Emergency) đều đã được Fix bug và vận hành thành công. Đây là bản mô tả CHÍNH XÁC NHẤT những gì ESP32 cần giao tiếp.

### 7️⃣ [08_PROMPT_FOR_TESTING.md](./08_PROMPT_FOR_TESTING.md)
- **Nội dung:** Hướng dẫn kiểm thử toàn diện hệ thống.
- **Tại sao phải đọc?** Đi kèm với file `smartaccess-test.http` nằm ở thư mục root Backend, giúp Tester hoặc AI dễ dàng giả lập các luồng gửi/nhận IoT bằng một cú click chuột mà không cần chờ phần cứng.

---

## 🛠️ Code Mẫu (Template)

- **[esp32_firmware_template.ino](./esp32_firmware_template.ino)**: Một đoạn mã nguồn C++ hoàn chỉnh chứa đầy đủ logic khởi tạo Camera OV2640, chụp ảnh khi bấm nút, gửi File qua HTTP POST và phân tích JSON phản hồi để kích hoạt Relay. Bạn có thể chép đoạn code này nạp thẳng vào ESP32 để chạy thử lập tức nghiệm thu API!
- **`test_python_api.py`**: Script test cục bộ cho server AI.
- **`orientation/`**: Các prompt lịch sử phục vụ cho việc khôi phục ngữ cảnh AI nếu cần.

Chúc bạn đấu mạch thành công và không bị khét linh kiện! 🔥
