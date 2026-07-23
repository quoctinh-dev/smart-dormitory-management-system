# AUDIT THỰC TẾ KỸ THUẬT: Mục 2.3 PHÂN TÍCH YÊU CẦU

Dựa trên quá trình quét toàn bộ mã nguồn của 4 thành phần (Backend, AI, IoT, Frontend/App), dưới đây là danh sách chính xác các Tác nhân (Actors) và Ca sử dụng (Use Cases) đang hoạt động thực tế.

## 2.3.1. Phân tích Tác nhân (Actors)
Khác với các hệ thống truyền thống chỉ có con người, hệ thống SDMS là một Cyber-Physical System nên các tác nhân bao gồm cả Con người và Máy móc (Hệ thống):

1. **Sinh viên (Student):** Truy cập qua Web Student / Mobile App.
   - *Code Evidence:* Bảng `student`, Role `STUDENT` trong Spring Security.
2. **Ban quản lý (Admin / Staff):** Truy cập qua Web Admin.
   - *Code Evidence:* Bảng `user_account`, Role `ADMIN` và `STAFF`.
3. **Thiết bị IoT (Smart Gate - ESP32):** Tác nhân phần cứng giao tiếp qua MQTT/HTTP.
   - *Code Evidence:* File `smart_access.ino` (quét RFID, chụp ảnh Camera, điều khiển Relay mở cửa, đồng bộ Whitelist offline).
4. **Dịch vụ AI (AI Service):** Tác nhân phân tích dữ liệu.
   - *Code Evidence:* File `main.py` chạy FastAPI độc lập, nhận ảnh và trả về Vector 512 chiều.
5. **Hệ thống thanh toán (SePay):** Tác nhân bên thứ 3 (Third-party).
   - *Code Evidence:* `SePayWebhookController.java` tự động gọi hàm gạch nợ khi có biến động số dư.

## 2.3.2. Danh sách Các Ca Sử dụng (Use Cases) Tổng quát
Tất cả các Use Case dưới đây đều có file Controller và Service xử lý tương ứng trong Backend:

**Nhóm 1: Quản lý Cư trú (Housing Lifecycle)**
- UC1.1: Đăng ký lưu trú trực tuyến (Sinh viên).
- UC1.2: Xét duyệt hồ sơ và Ưu tiên (Ban quản lý).
- UC1.3: Sắp xếp giường tự động (Ban quản lý / Hệ thống).
- UC1.4: Thủ tục Nhận phòng, Chuyển phòng, Gia hạn, Trả phòng (Sinh viên & Ban quản lý).

**Nhóm 2: Tài chính & Thanh toán (Billing & Payment)**
- UC2.1: Lập hóa đơn định kỳ (Tiền phòng, Tiền điện, Tiền nước).
- UC2.2: Thanh toán qua mã QR động (Sinh viên).
- UC2.3: Gửi Webhook xác nhận giao dịch và Gạch nợ tự động (SePay).

**Nhóm 3: Kiểm soát An ninh IoT & AI (Smart Access & Room Door)**
- UC3.1: Quẹt thẻ RFID, Quét khuôn mặt (Cổng chính), hoặc Nhập mã PIN (Cửa phòng) (Sinh viên).
- UC3.2: Thu nhận tín hiệu RFID, Hình ảnh, và Dữ liệu Bàn phím ma trận (Thiết bị IoT).
- UC3.3: Trích xuất Vector khuôn mặt 512D (Dịch vụ AI).
- UC3.4: Đối soát Vector/Mã thẻ/Mã PIN và Ra lệnh mở cửa qua MQTT (Hệ thống Backend).
- UC3.5: Cập nhật danh sách trắng (Offline Whitelist) để mở cửa khi rớt mạng (Thiết bị IoT).

**Nhóm 4: Tương tác & Báo cáo (Notification & Dashboard)**
- UC4.1: Xem biểu đồ thống kê phòng trống, doanh thu (Ban quản lý).
- UC4.2: Gửi Báo cáo sự cố phòng, hỏng hóc thiết bị (Sinh viên).
- UC4.3: Gửi thông báo trong ứng dụng (In-App Notification) về điện thoại sinh viên (Hệ thống Backend).
