# SDMS - KỊCH BẢN KIỂM THỬ TÍCH HỢP TOÀN DIỆN (FULL END-TO-END TEST)

Tài liệu này là Kim Chỉ Nam dành cho việc Kiểm thử tích hợp (Integration Test) toàn bộ Hệ thống Smart Access, kết nối hoàn chỉnh 4 thành phần: **Mobile App <-> Spring Boot Backend <-> Python AI <-> ESP32 IoT**.

Bất kỳ lập trình viên nào (hoặc AI Agent nào) khi tiếp nhận dự án ở giai đoạn sau đều phải đọc tài liệu này để hiểu rõ ngữ cảnh và cách hệ thống giao tiếp.

---

## 1. NGỮ CẢNH HỆ THỐNG ĐÃ HOÀN THIỆN (CURRENT CONTEXT)
Tính đến thời điểm hiện tại, khối **IoT (ESP32-CAM)** đã được lập trình chuẩn Clean Architecture và cấu hình hoàn chỉnh các tính năng sau:
*   **Camera OV2640:** Tối ưu hóa bộ nhớ PSRAM, kích thước ảnh VGA (640x480), JPEG Quality = 12, Frame Buffer = 1 (Tự động xả rác trước khi chụp để lấy ảnh thực).
*   **Giao thức Mạng (Non-blocking):** Kết nối WiFi và MQTT có khả năng tự động khôi phục (Auto-reconnect) khi rớt mạng, không block luồng xử lý chính.
*   **Xử lý Lệnh MQTT:** Lắng nghe topic `sdms/gates/{gateId}/command` để mở cửa. Tự động báo cáo `Heartbeat` lên `sdms/gates/{gateId}/status` mỗi 30s.
*   **Xử lý Ảnh HTTP:** Bắn ảnh qua giao thức `HTTP Multipart Form-Data` lên Spring Boot, tự động bóc tách JSON (`GRANTED`/`DENIED`) để điều khiển Relay (Chân IO12).
*   *Lưu ý: Tính năng RFID MFRC522 hiện đang bị vô hiệu hóa (`ENABLE_RFID = false` trong `Config.h`) do chưa lắp phần cứng thực tế.*

---

## 2. ĐIỀU KIỆN TIỀN QUYẾT TRƯỚC KHI TEST (PREREQUISITES)
Để kịch bản test này hoạt động, toàn bộ hệ sinh thái phải được khởi động:
1.  **Mosquitto MQTT Broker** đang chạy (Port 1883).
2.  **Python AI Engine** đang chạy và đã kết nối thành công với Spring Boot. Đã huấn luyện (train) sẵn ít nhất 1 khuôn mặt của sinh viên.
3.  **Spring Boot Backend** đang chạy (Port 8080).
4.  **Mobile App (Flutter/React Native)** đang chạy trên máy ảo hoặc điện thoại thật.
5.  **ESP32-CAM** đã được nạp code và kết nối chung mạng WiFi (LAN) với máy tính chạy Server. Đã khai báo đúng IP trong file `Config.h`.

---

## 3. CÁC KỊCH BẢN KIỂM THỬ THỰC TẾ (TEST SCENARIOS)

### 🟢 SCENARIO 1: GIÁM SÁT TRẠNG THÁI THIẾT BỊ (HEARTBEAT)
**Mục tiêu:** Đảm bảo ESP32 luôn "sống" và Backend nhận biết được thiết bị online.
1.  **Hành động:** Cấp điện cho ESP32.
2.  **Kỳ vọng trên ESP32:** Màn hình Serial in ra `[WiFi] Connected successfully!` và `[MQTT] Connected to Broker!`.
3.  **Kỳ vọng trên Backend:** Cứ mỗi 30 giây, Spring Boot console in ra dòng log:
    `[DEVICE ONLINE] Received Heartbeat/Status from Topic: sdms/gates/{gateId}/status | Payload: {"deviceId":"ESP32_CAM_001","status":"ONLINE",...}`
4.  **Kỳ vọng trên App (Nếu có):** Biểu tượng Cổng bảo vệ chuyển từ màu xám (Offline) sang màu xanh lá (Online).

### 🔵 SCENARIO 2: ĐIỀU KHIỂN MỞ CỬA TỪ XA BẰNG APP (REMOTE UNLOCK)
**Mục tiêu:** Ban quản lý dùng Mobile App mở cửa khẩn cấp cho sinh viên.
1.  **Hành động (Trên App):** Người dùng bấm nút **"Mở Cổng"**.
2.  **Luồng đi:** App gửi HTTP POST -> Spring Boot -> Spring Boot đẩy MQTT JSON (`{"command":"UNLOCK"}`) xuống Broker.
3.  **Kỳ vọng trên ESP32:** 
    *   Serial nhận được tin nhắn và báo `[MQTT] Valid UNLOCK command received. Triggering Relay...`
    *   Chân IO12 kích điện áp `HIGH`, đèn LED sáng (hoặc rơ-le kêu "cạch").
    *   Đúng 5 giây sau, chân IO12 tự kích `LOW`, đóng cửa lại.

### 🔴 SCENARIO 3: NHẬN DIỆN KHUÔN MẶT CÓ ĐÁNH GIÁ CHÍNH SÁCH (FACE ID + POLICY)
**Mục tiêu:** Sinh viên đi ngang qua cổng, hệ thống AI quét mặt và Backend quyết định cho phép vào hay không dựa trên giờ giới nghiêm.
1.  **Hành động (Tại Cổng):** Sinh viên kích hoạt chụp ảnh (Nhấn nút cứng tại chân IO13, hoặc bộ đếm thời gian 15s tự động chụp).
2.  **Luồng đi 1 (Thiết bị):** ESP32 chụp ảnh và gửi HTTP POST Multipart kèm `gateId` lên Spring Boot (`/api/v1/smartaccess/verify/face`).
3.  **Luồng đi 2 (Backend & AI):** 
    *   Spring Boot chuyển ảnh sang Python AI.
    *   Python AI trả về Profile ID và độ chính xác (Confidence).
    *   Spring Boot kiểm tra Profile ID này có đóng tiền phòng chưa, có đang bị cấm túc không, có vi phạm giờ giới nghiêm không.
4.  **Kỳ vọng trên ESP32 (Nếu HỢP LỆ):** 
    *   Spring Boot trả về JSON `{"status": "GRANTED"}`.
    *   Serial ESP32 in ra: `[AI RESULT] ✅ FACE MATCHED! Access Granted.`
    *   Relay (Chân 12) bật 5 giây để mở cửa.
5.  **Kỳ vọng trên ESP32 (Nếu BỊ CẤM/SAI MẶT):**
    *   Spring Boot trả về JSON `{"status": "DENIED"}`.
    *   Serial ESP32 in ra: `[AI RESULT] ❌ ACCESS DENIED!`
    *   Relay KHÔNG bật, cửa vẫn đóng.

---
**TÀI LIỆU NÀY ĐẢM BẢO MỌI THÀNH VIÊN TRONG TEAM SDMS (HOẶC AI AGENT) ĐỀU NẮM RÕ LUỒNG DỮ LIỆU ĐỂ BẮT LỖI (DEBUG) CHÍNH XÁC KHI RÁP NỐI HỆ THỐNG.**

---

## 🤖 [AI AGENT INSTRUCTION PROMPT]
*If you are an AI Agent reading this document to continue developing the SDMS system, you MUST strictly adhere to the following rules:*
1. **IoT Firmware is FROZEN:** The ESP32-CAM firmware (in `ktx-smart-access-iot/firmware_esp32/smart_access/`) is fully implemented, hardware-verified, and strictly follows Clean Architecture (src/config, src/drivers, src/network). **DO NOT refactor, flatten, or modify the IoT C++ code** unless explicitly requested by the user to fix a bug or add a new hardware sensor.
2. **Backend is the SSOT (Single Source of Truth):** The Spring Boot Backend controls all logic. The ESP32 is merely a dumb Edge Device that sends images and listens for commands. If a business rule changes (e.g., curfew time), modify the Spring Boot Backend, NOT the ESP32.
3. **Integration Strategy:** When you are tasked to build the Python AI or the Mobile App, ensure your API endpoints and MQTT payloads strictly match the formats described in this document.
4. **Hardware Testing Constraint:** The user relies on the "Auto-capture every 15s" timer for testing because they lack physical push buttons. Do not remove this timer from `smart_access.ino` without asking the user.
