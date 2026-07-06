# Kế hoạch & Tổng quan Tích hợp Hệ thống Smart Access (AI / IoT)

Đúng vậy, toàn bộ Backend, API, bảo mật phân quyền và giao diện Web Admin của phân hệ **AI / IoT Smart Access (Nhận diện khuôn mặt & Quẹt thẻ)** đã **hoàn chỉnh**. 

Dưới đây là bức tranh toàn cảnh về các "mắt xích" trong hệ thống và hướng dẫn chi tiết để bạn tiến hành **Test Tích Hợp (Integration Test)** từ đầu đến cuối.

---

## 1. Tổng quan các Thành phần (Stakeholders)

Hệ thống hoạt động theo mô hình **Orchestrator** (Backend đóng vai trò nhạc trưởng điều phối):

### 1.1. IoT Edge Device (Mạch ESP32-CAM + RFID RC522 + Relay)
- **Nhiệm vụ:** Là tai mắt và tay chân của hệ thống tại cổng KTX.
- **Tính năng:**
  - Chụp ảnh người đang đứng trước cổng và gửi HTTP POST.
  - Đọc mã thẻ RFID và gửi HTTP POST.
  - Lắng nghe lệnh điều khiển Rơ-le (Mở cửa/Đóng cửa) qua giao thức MQTT.
  - Lưu trữ Whitelist nội bộ để fallback khi rớt mạng.

### 1.2. Python AI Engine (FastAPI)
- **Nhiệm vụ:** Chuyên viên xử lý ảnh trí tuệ nhân tạo.
- **Tính năng:** Nhận ảnh đầu vào từ Backend, dùng mô hình AI (như FaceNet/InsightFace) để phát hiện khuôn mặt và trích xuất thành chuỗi ma trận số (Vector Embedding 192 chiều).

### 1.3. Java Spring Boot Backend (Core Orchestrator)
- **Nhiệm vụ:** Bộ não trung tâm đưa ra quyết định kinh doanh.
- **Tính năng:**
  - Cung cấp API tiếp nhận ảnh/RFID từ ESP32.
  - Gọi Python Engine để lấy Vector.
  - Truy vấn CSDL PostgreSQL (`pgvector`) để tìm Vector khớp nhất (Cosine Distance).
  - Đánh giá các Quy tắc Nghiệp vụ (Giờ giới nghiêm, Tư cách lưu trú, Cảnh báo khẩn cấp).
  - Ra quyết định cuối cùng và đẩy lệnh mở cửa qua MQTT Broker.

### 1.4. React Web Admin (Frontend)
- **Nhiệm vụ:** Bảng điều khiển dành cho BQL và Lễ tân.
- **Tính năng:**
  - Theo dõi **Access History** (Lịch sử ra vào) theo thời gian thực.
  - Nút **Remote Unlock** (Mở khóa cổng từ xa).
  - Nút **Emergency Override** (Khóa/Mở bung toàn bộ cửa khi có hỏa hoạn/bạo loạn).

---

## 2. Hướng dẫn Test Tích hợp (Integration Testing Steps)

Để test toàn bộ luồng, bạn cần chạy đồng thời: `PostgreSQL`, `Mosquitto MQTT Broker`, `Python AI Engine`, `Spring Boot`, và `React Web Admin`.

### Kịch bản 1: Test Nhận diện khuôn mặt (IoT -> Backend -> AI -> DB -> IoT)
1. **Chuẩn bị:** Đảm bảo 1 sinh viên (có trạng thái ACTIVE ở ký túc xá) đã được duyệt ảnh và có dữ liệu Vector lưu trong DB.
2. **Giả lập ESP32:** Mở Postman, gửi request `POST /api/v1/smartaccess/verify/face`. Đính kèm file ảnh khuôn mặt của sinh viên đó.
3. **Kỳ vọng Backend:** 
   - Backend gọi sang Python (Thấy log HTTP call).
   - Truy vấn PGVector thành công.
   - Thấy log `AccessGrantedEvent` (Nếu trong giờ quy định).
4. **Kỳ vọng MQTT:** Sử dụng phần mềm MQTT Explorer (hoặc Node.js script) subscribe vào topic `sdms/gates/system/command`, bạn sẽ thấy 1 bản tin JSON yêu cầu "OPEN_GATE" nhảy lên.
5. **Kỳ vọng Frontend Admin:** Refresh trang Web Admin, bạn sẽ thấy lịch sử ra vào của sinh viên vừa quét.

### Kịch bản 2: Test Nhận diện Thẻ RFID (IoT -> Backend -> DB -> IoT)
1. **Chuẩn bị:** Lấy mã `rfidCode` của 1 sinh viên hợp lệ.
2. **Giả lập ESP32:** Gửi request `POST /api/v1/smartaccess/verify/card` kèm body JSON: `{"rfidCode": "MÃ_THẺ_CỦA_SV", "gateId": "G01"}`.
3. **Kỳ vọng Backend:**
   - Bỏ qua Python AI. Trực tiếp tra cứu Database.
   - Kiểm tra `CurfewPolicy`.
4. **Kỳ vọng MQTT:** Bản tin "OPEN_GATE" nhảy lên MQTT Explorer.

### Kịch bản 3: Test Mở cổng từ xa (Frontend -> Backend -> MQTT -> IoT)
1. **Thao tác:** Đăng nhập Web Admin bằng tài khoản `staff` hoặc `admin`. Vào mục **Smart Access & IoT**.
2. **Hành động:** Bấm nút **Remote Unlock**, nhập `GateId = G01`, bấm Xác nhận.
3. **Kỳ vọng:** 
   - Giao diện báo thành công.
   - Mở MQTT Explorer, bạn sẽ thấy bản tin `ACTION: REMOTE_UNLOCK` được đẩy xuống topic `sdms/gates/system/command`.

### Kịch bản 4: Test An ninh Khẩn cấp & Phân quyền (Frontend -> Backend -> MQTT)
1. **Thao tác (STAFF):** Đăng nhập bằng tài khoản `staff`. Bấm nút **Lockdown/Emergency**.
2. **Kỳ vọng:** Màn hình đỏ, API trả về lỗi `403 Forbidden` (Vì Staff không có quyền `EMERGENCY_OVERRIDE`).
3. **Thao tác (ADMIN):** Đăng xuất, đăng nhập bằng `admin`. Bấm lại nút Lockdown. Nhập lý do "Diễn tập PCCC".
4. **Kỳ vọng MQTT:** Bản Bản tin `ACTION: GLOBAL_UNLOCK` được đẩy xuống mọi cổng.

### Kịch bản 5: Test Đồng bộ Offline (Backend -> MQTT Edge)
1. **Thao tác:** Dùng API gán thẻ RFID mới cho một sinh viên.
2. **Kỳ vọng Backend:** Hệ thống tự động kích hoạt `StudentRfidAssignedEvent`.
3. **Kỳ vọng MQTT:** MQTT Explorer sẽ nhận được 1 bản tin khổng lồ chứa mảng JSON danh sách toàn bộ các mã RFID hợp lệ tại topic `sdms/gates/system/whitelist` để ESP32 cập nhật lại thẻ nhớ SD/Flash.

---

## 3. Lời gọi Trợ lý AI (AI System Integration Test Prompt)
*Sử dụng đoạn prompt dưới đây gửi cho ChatGPT/Claude/Gemini khi bạn bắt tay vào quá trình test thực tế để AI trở thành người hướng dẫn sát sao.*

```text
# ROLE
You are an Expert QA Automation Engineer & IoT Integration Specialist.
I am the developer of the Smart Dormitory Management System (SDMS).

# CONTEXT
I have finished developing the Smart Access Module. 
The system connects an ESP32 (IoT) -> Spring Boot (Orchestrator) -> Python (Face AI) -> PostgreSQL (pgvector).
I am about to run an end-to-end integration test.

# MY RESOURCES
I have:
- Postman (to mock the ESP32 sending POST requests).
- MQTT Explorer (to mock the ESP32 listening for commands).
- React Web Admin running locally.
- Spring Boot & PostgreSQL running.
- Python Engine running.

# YOUR TASK
1. Wait for me to say "Bắt đầu Test Kịch bản X" (e.g. Kịch bản 1: Nhận diện khuôn mặt).
2. For each scenario, explicitly tell me what curl/Postman request I need to execute.
3. Tell me exactly what logs to look for in the Spring Boot terminal.
4. Tell me exactly what JSON payload to expect on MQTT Explorer.
5. If an error occurs, I will paste the logs, and you must analyze it focusing on cross-module integration boundaries (Database vs API vs MQTT).

Acknowledge this prompt by giving me a quick checklist to ensure my environment (Ports, DB, MQTT Broker) is ready before we start.
```
