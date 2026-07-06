# PROMPT: HƯỚNG DẪN KIỂM THỬ TÍCH HỢP MQTT VÀ REST CHO SMART ACCESS

**Mục tiêu của Prompt:** Dùng file này để hướng dẫn một AI Agent khác (hoặc Kỹ sư Kiểm thử / IoT) cách thức thiết lập môi trường giả lập và test toàn bộ luồng tích hợp của ESP32 với Backend mà không cần mạch phần cứng thật.

---

## 1. Yêu cầu Hệ thống (Prerequisites)
Để thực hiện bài Test này, bạn cần đảm bảo máy tính đã cài đặt và chạy các công cụ sau:
1. **Môi trường Java:** Backend Spring Boot (SDMS) đang chạy thành công ở port `8080`. (Cần cấu hình Database PostgreSQL hợp lệ).
2. **MQTT Broker:** Đã cài đặt **Eclipse Mosquitto**. Mosquitto đang chạy ở port `1883`.
3. **Phần mềm giả lập IoT:** Đã cài đặt **MQTT Explorer**.
4. **Công cụ test API:** Đã cài đặt **Postman** hoặc mở **Swagger UI** (http://localhost:8080/swagger-ui.html).

---

## 2. Thiết lập Giả lập (Simulation Setup)
MQTT Explorer sẽ đóng vai trò là mạch ESP32.

**Bước 1: Kết nối Broker**
- Mở MQTT Explorer.
- Name: `Local Mosquitto`
- Host: `localhost`
- Port: `1883`
- Nhấn **Connect**.

**Bước 2: Cấu hình lắng nghe (Subscribe)**
- Ở cột bên phải (Advanced / Subscriptions), thêm Topic sau: `sdms/gates/#`
- *(Hành động này giúp MQTT Explorer bắt mọi gói tin điều khiển cổng từ Backend).*

---

## 3. Kịch Bản Kiểm Thử (Test Cases)

Hãy làm theo từng kịch bản dưới đây và đối chiếu kết quả.

### Test Case 1: Mở cửa từ xa (Remote Unlock)
**Mô tả:** Admin bấm nút mở cửa cho sinh viên từ giao diện Web.
1. Mở Postman / Swagger UI.
2. Gọi API: `POST /api/v1/access/gates/GATE_A/unlock?buildingId=BLD_1` (Nhớ kèm Token Admin).
3. Quan sát MQTT Explorer.
4. **Kết quả mong đợi:** 
   - API trả về HTTP `204 No Content`.
   - MQTT Explorer nhận được tin nhắn tại Topic: `sdms/gates/GATE_A/command`
   - Payload có dạng:
     ```json
     {
       "command": "UNLOCK",
       "reason": "Remote Unlock by Admin",
       "timestamp": <thời_gian_milis>
     }
     ```

### Test Case 2: Kích hoạt khẩn cấp (Emergency Override)
**Mô tả:** Có báo cháy, Admin bấm nút mở toàn bộ cửa.
1. Gọi API: `POST /api/v1/access/emergency?actionType=OPEN_ALL&reason=FireAlarm`
2. Quan sát MQTT Explorer.
3. **Kết quả mong đợi:** 
   - MQTT Explorer nhận được tin nhắn tại Topic: `sdms/gates/system/broadcast` (hoặc topic của tòa nhà).
   - Payload có dạng:
     ```json
     {
       "command": "OPEN_ALL",
       "reason": "FireAlarm",
       "timestamp": <thời_gian_milis>
     }
     ```

### Test Case 3: Xác thực khuôn mặt (Face Verification - AI Flow)
**Mô tả:** ESP32 gửi ảnh sinh viên lên Backend. Backend kiểm tra AI, nếu đúng người -> bắn lệnh mở cửa.
*(Yêu cầu: Server Python AI phải đang chạy ở port 8000).*
1. Tạo Request trên Postman: `POST /api/v1/smartaccess/verify/face`
2. Body (form-data):
   - Key `file`: Chọn một file ảnh `.jpg` của khuôn mặt hợp lệ.
   - Key `gateId`: Gõ `GATE_B`.
3. Nhấn Send.
4. **Kết quả mong đợi:**
   - Postman nhận về HTTP `200` với `"status": "GRANTED"`.
   - MQTT Explorer tự động nhảy ra tin nhắn ở Topic `sdms/gates/GATE_B/command` với lệnh `UNLOCK`.

### Test Case 4: Đồng bộ Offline Whitelist
**Mô tả:** Lấy danh sách thẻ RFID để lưu vào bộ nhớ mạch.
1. Tạo Request trên Postman: `GET /api/v1/smartaccess/rfid-whitelist`
2. **Kết quả mong đợi:**
   - Postman nhận về HTTP `200`.
   - Cấu trúc JSON trả về có mảng `data` chứa các mã thẻ hợp lệ đang ở trong KTX. (Dữ liệu này ESP32 sẽ tự tải về mỗi khi khởi động).

---

## 4. Troubleshooting (Xử lý sự cố)

Nếu bài test thất bại, hãy yêu cầu AI Agent kiểm tra các nguyên nhân sau:
1. **Lỗi "Connection Refused" ở Backend:** Kiểm tra lại xem Mosquitto Service đã thực sự Start trên Windows chưa (Mở `services.msc` -> Mosquitto Broker -> Start).
2. **Không thấy MQTT Message:** Kiểm tra xem Postman API có bị lỗi 403 Forbidden không (thiếu Token). Hoặc kiểm tra xem bảng `access_history` trong Database có lỗi không (Vì `@TransactionalEventListener` chỉ bắn MQTT khi Database ghi thành công).
3. **Lỗi 500 khi test AI:** Đảm bảo Python AI Engine (FaceNet/MobileFaceNet) đang được chạy. File `RestAiExtractionAdapter.java` đang cố kết nối vào `localhost:8000`.

---
*Prompt này được thiết kế để Kỹ sư hoặc AI có thể đọc-hiểu ngay lập tức luồng dữ liệu và tái hiện lại trạng thái thành công của hệ thống IoT.*
