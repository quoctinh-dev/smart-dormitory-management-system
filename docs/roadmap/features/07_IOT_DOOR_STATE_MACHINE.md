# ROADMAP 07: IOT DOOR STATE MACHINE (CƠ CHẾ ĐÓNG MỞ CỔNG & KHẨN CẤP)

> **THÔNG TIN QUẢN TRỊ (GOVERNANCE):**
> - **Cấp độ:** Future Roadmap & System Architecture.
> - **Mục tiêu:** Chính thức hóa các luồng nghiệp vụ đóng/mở cửa vật lý của mạch ESP32 để xử lý chuẩn xác 3 trạng thái: Bình thường (Auto-Close), Khóa tử thủ (Lockdown) và Sơ tán (Evacuation).

---

## 1. VISION (TẦM NHÌN)
Hệ thống Smart Access hiện tại đã xử lý rất tốt luồng "Mở cửa". Tuy nhiên, khâu "Đóng cửa" và "Khóa cửa" cần được quy chuẩn thành một Máy Trạng Thái (State Machine) rõ ràng trên cả Backend và Firmware C++ của ESP32. Điều này đảm bảo an ninh tuyệt đối trong các tình huống bình thường lẫn khủng hoảng (cháy nổ, bạo động).

## 2. BUSINESS FLOW (LUỒNG NGHIỆP VỤ ĐÓNG/MỞ)

Hệ thống định nghĩa 3 trạng thái vật lý của Relay (Khóa từ):

### 2.1. Trạng thái 1: AUTO-CLOSE (Chế độ vận hành bình thường)
- **Kích hoạt khi:** Sinh viên quẹt mặt thành công (AI = TRUE, Policy = GRANTED), HOẶC Admin bấm nút "Mở cổng từ xa".
- **Hành vi (Behavior):** 
  - Mạch ESP32 cấp điện cho Relay mở chốt.
  - Khởi động bộ đếm lùi `RELAY_OPEN_DURATION` (Mặc định: 5000 mili-giây).
  - Hết 5 giây, mạch TỰ ĐỘNG ngắt Relay để khóa cửa lại. Không cần tương tác từ User/Admin.

### 2.2. Trạng thái 2: GLOBAL LOCKDOWN (Phong tỏa / Tử thủ)
- **Kích hoạt khi:** Có kẻ gian đột nhập, bạo động. Admin bấm nút "Tác Động Khẩn Cấp -> LOCKDOWN" trên Web.
- **Hành vi (Behavior):**
  - Mạch ESP32 nhận lệnh qua MQTT.
  - Ngắt điện Relay ngay lập tức để ép cửa vào trạng thái **KHÓA CHẶT (FORCE_CLOSE)**.
  - Đóng băng toàn bộ Sensor: Bỏ qua tín hiệu từ Camera AI và Đầu đọc thẻ RFID. Bất kể ai quẹt mặt đúng cũng bị từ chối cấp quyền mở.
  - Chỉ kết thúc khi Admin phát lệnh "CLEAR_EMERGENCY" từ Web.

### 2.3. Trạng thái 3: EVACUATION (Sơ tán hỏa hoạn)
- **Kích hoạt khi:** Xảy ra cháy nổ, cúp điện hệ thống. Admin bấm nút "Tác Động Khẩn Cấp -> UNLOCK" trên Web (Có thể chỉ chọn 1 Tòa nhà cụ thể).
- **Hành vi (Behavior):**
  - Mạch ESP32 nhận lệnh qua MQTT.
  - Cấp điện liên tục cho Relay (hoặc ngắt điện tùy cấu hình khóa Fail-Safe).
  - Ép cửa vào trạng thái **MỞ TOANG (FORCE_OPEN)** vô thời hạn, hủy bỏ bộ đếm lùi 5 giây.
  - Sinh viên có thể tự do ùa ra ngoài thoát hiểm mà không cần xác thực khuôn mặt.

---

## 3. IMPLEMENTATION ROADMAP (LỘ TRÌNH TRIỂN KHAI CODE)

### Phase 1: Nâng cấp Firmware ESP32 (sdms-iot-gateway)
- Viết lại module `GateController.cpp` bằng State Machine Pattern (Enum: `NORMAL_MODE`, `LOCKDOWN_MODE`, `EVACUATION_MODE`).
- Chỉnh sửa `mqtt_callback` để lắng nghe thêm Topic khẩn cấp.
- Đấu nối chuông báo động (Buzzer): Kêu bíp dài liên tục nếu ở chế độ `EVACUATION`.

### Phase 2: Đồng bộ Backend (sdms-backend)
- Nâng cấp `EmergencyOverrideService` để lưu trạng thái khẩn cấp của từng tòa nhà vào Database (Bảng `building_status`).
- Phát MQTT message `CLEAR_EMERGENCY` khi trạng thái khủng hoảng đã qua.

### Phase 3: Bổ sung UX Web Admin (sdms-frontend)
- Khi một Tòa nhà đang trong trạng thái LOCKDOWN hoặc EVACUATION, viền của bảng điều khiển trên Web Admin sẽ chớp nháy màu Đỏ để cảnh báo Admin rằng hệ thống đang bị can thiệp vật lý, chặn mọi luồng mở bình thường.

---

## 4. BỘ KÍCH HOẠT CHO AGENT (TRIGGER PROMPT)
*Khi đội ngũ phát triển sẵn sàng triển khai tính năng này, hãy copy đoạn Prompt dưới đây giao cho AI Agent:*

> "Hãy đọc kỹ tài liệu `docs/roadmap/features/07_IOT_DOOR_STATE_MACHINE.md`. Yêu cầu đầu tiên của bạn là vào thư mục `sdms-iot-gateway` và tái cấu trúc lại `GateController.cpp` thành một State Machine hỗ trợ 3 trạng thái: NORMAL_AUTO_CLOSE, FORCE_LOCKDOWN, và FORCE_EVACUATION dựa trên các message MQTT nhận được."
