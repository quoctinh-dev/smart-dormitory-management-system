# TỔNG QUAN KIẾN TRÚC PHÂN HỆ SMART ACCESS

Phân hệ Kiểm soát Ra/Vào (Smart Access) trong Hệ thống Quản lý Ký túc xá (SDMS) được thiết kế theo mô hình **Hybrid Edge-Cloud**, đảm bảo tính khả dụng cao (High Availability) và khả năng chịu lỗi (Fault Tolerance) trong mọi tình huống.

## 1. CẤU TRÚC PHẦN CỨNG (IoT GATES)
Hệ thống quản lý 2 loại cổng chính với các nghiệp vụ khác biệt:

### 1.1. Cổng Tòa nhà (Building Gate) - `smart_access`
- **Chức năng:** Kiểm soát luồng sinh viên ra/vào khuôn viên Ký túc xá.
- **Phương thức xác thực:** Đa nhân tố. 
  - Ưu tiên 1: Nhận diện khuôn mặt (Camera AI - ESP32 CAM).
  - Ưu tiên 2: Thẻ từ (RFID RC522).
- **Trạng thái phần cứng:** Đề xuất sử dụng Khóa từ (Magnetic Lock) nối qua cổng Normally Closed (NC) của Rơ-le để đạt chuẩn **Fail-Safe** (Mất điện toàn nhà -> Cửa tự động mở để thoát hiểm).

### 1.2. Cửa Phòng (Room Door) - `room_door`
- **Chức năng:** Kiểm soát an ninh từng phòng ngủ cá nhân.
- **Phương thức xác thực:** Mã PIN (Keypad 4x4) và Màn hình LCD giao tiếp.
- **Trạng thái phần cứng:** Sử dụng thuật toán Non-blocking để không bị treo mạch khi chờ mạng hoặc hiển thị LCD, đảm bảo kết nối MQTT từ xa luôn ổn định.

---

## 2. LUỒNG NGHIỆP VỤ LÕI (CORE BUSINESS LOGIC)
Việc ra quyết định Mở/Đóng cửa được Backend Spring Boot xử lý thông qua mô hình **Strategy Pattern**, đánh giá chéo nhiều điều kiện (Eligibility):

1. **Sinh viên Nội trú (Boarding Resident):**
   - **Curfew Rule (Luật Giới nghiêm):** Cấm ra/vào sau 23:00 và trước 05:00 sáng.
   - **Late Return Request (Đơn xin về trễ):** Nếu vi phạm giờ giới nghiêm, hệ thống tự động kiểm tra xem sinh viên có Đơn xin phép đã được duyệt hay chưa.
   - **Late Deadline:** Dù có đơn, nếu về quá trễ (vượt qua Deadline 00:00) thì hệ thống vẫn từ chối mở cửa (báo động cho bảo vệ).
2. **Sinh viên Ngoại trú / Khách (Non-Boarding / Guest):**
   - **Time Window Rule (Khung giờ phép):** Chỉ được phép ra vào trong khung giờ hành chính (07:00 - 18:00). Ngoài giờ này, cửa tuyệt đối đóng.
3. **Room Assignment (Gán phòng):**
   - Cửa phòng nào thì chỉ người có hợp đồng ở phòng đó mới được mở. Không ai có quyền xâm phạm chéo.

---

## 3. CƠ CHẾ CHỊU LỖI & DỰ PHÒNG (FAULT TOLERANCE)
Đây là điểm sáng giá nhất của hệ thống, giúp đối phó với tình trạng Mất mạng cục bộ (WiFi) hoặc Đứt cáp quang biển (Server Timeout).

### 3.1. Fallback tại Cổng Tòa Nhà (Offline Whitelist)
- Hệ thống ESP32 luôn lưu trữ một bản sao (bộ nhớ NVS) danh sách thẻ RFID hợp lệ (Whitelist). 
- Khi rớt mạng (Offline), mạch tự động mở cửa cho những ai có thẻ nằm trong Whitelist. 

### 3.2. Fallback tại Cửa Phòng (Master PIN)
- Do cửa phòng không gắn RFID, hệ thống dự phòng bằng cơ chế **Master PIN** (`OFFLINE_MASTER_PIN`).
- Khi rớt mạng, mã PIN sinh viên bị vô hiệu (vì không có server xác thực), nhưng sinh viên có thể dùng mã Master (do Ban quản lý cấp phát khẩn cấp) để vào phòng.

### 3.3. Hậu Kiểm Nguội (Retroactive Audit)
Bất cứ khi nào cửa được mở trong trạng thái Mất mạng, mạch ESP32 đều lưu dấu thời gian (Timestamp) xuống bộ nhớ. Ngay khi có mạng lại, hệ thống chạy **Cơ chế Đồng bộ (Offline Sync)**:
- Backend nhận gói Log, tính toán lùi thời gian để biết chính xác người đó quẹt thẻ lúc mấy giờ.
- Nếu sinh viên quẹt thẻ Offline vào lúc 23:30 (Vượt rào giới nghiêm) mà không có đơn xin phép, Backend sẽ đóng dấu bản ghi đó thành **`OFFLINE_SYNC_VIOLATION`**.
- Nếu Admin hoặc ai đó dùng Master PIN mở cửa lúc rớt mạng, Backend sẽ lưu Log bằng user System với mã **`OFFLINE_MASTER_PIN_GRANT`**. 
=> **An ninh tuyệt đối, không có một lỗ hổng nào để lọt dữ liệu.**
