# FUTURE PLAN: Hệ thống Thu phí Dịch vụ Đa năng & Tích hợp IoT (Smart Utility Billing)

## 1. Tầm nhìn và Mục tiêu
- **Nỗi đau hiện tại:** Trưởng KTX phải đi chốt số điện/nước từng phòng bằng tay gây mất thời gian và dễ sai sót. Luồng thanh toán hiện tại bị "hardcode" chỉ hỗ trợ phí nội trú (Accommodation Fee), chưa hỗ trợ tiền điện, tiền nước. Giá tiền cũng bị gán cứng trong Source Code gây khó khăn mỗi khi thay đổi giá.
- **Mục tiêu tương lai:** 
  - Giải quyết bài toán quản lý phí dịch vụ (Điện, Nước) dựa trên công tơ tự động qua IoT.
  - Xây dựng một luồng (Event-Router) chung cho MỌI loại hóa đơn trong KTX (Điện, Nước, Phạt).
  - Trưởng phòng tự động nhận hóa đơn và thanh toán Online. Hệ thống tự gạch nợ và tự động cấu hình giá theo biểu đồ bậc thang thông qua giao diện Web Admin.

## 2. Luồng nghiệp vụ mới
1. **IoT thu thập dữ liệu (Ngầm định):** 
   - Đồng hồ thông minh ESP32 tại các phòng định kỳ (hoặc cuối tháng) gửi chỉ số công tơ về Backend thông qua giao thức MQTT hoặc REST API.
2. **Khởi tạo Hóa đơn Tự động:**
   - Một Job cuối tháng chạy tự động quét các chỉ số mới nhất, tính lượng kWh tiêu thụ, nhân với biểu giá điện bậc thang (cấu hình trong Database).
   - Tự động sinh `Bill` (Loại `ELECTRIC_FEE`) và gán cho Sinh viên có vai trò `ROOM_LEADER` của phòng đó.
3. **Thanh toán & Gạch nợ:**
   - Trưởng phòng nhận thông báo qua Web/App, thanh toán Online (qua SePay/QR).
   - Backend đánh dấu `PAID`, phát ra sự kiện `PaymentSuccessEvent` kèm `BillType`.
   - Các Listener xử lý: Xóa nợ, bật lại điện phòng (nếu bị cắt trước đó).

## 3. Lộ trình triển khai (Roadmap)
### Giai đoạn 1 (Hiện tại - Giải quyết ngay trong Đồ án): Cơ chế Đa Hóa Đơn & Chốt số thủ công
- **DB Schema:** Thêm bảng `UtilityMeter` (Ghi nhận điện nước), `SystemConfig` / `TierPricing` (Cấu hình giá).
- **Backend:** 
  - Gỡ hardcode giá 2.100.000đ trong `BillGenerationListener` thành mức đóng theo quý (1.050.000đ).
  - Tái cấu trúc `PaymentSuccessEvent` để chứa `BillType`. Gỡ điều kiện ràng buộc `applicationId`.
  - Mở API cho Admin nhập tay chỉ số điện/nước hàng tháng.
- **Frontend:** Xây dựng màn hình Admin nhập chỉ số điện, tự động tính ra tổng tiền dựa trên giá cấu hình.

### Giai đoạn 2 (Tương lai - Sau khi bảo vệ Luận văn): Tự động hóa bằng IoT
- **IoT/Firmware:** Viết code C++ cho ESP32 đọc cảm biến điện (PZEM-004T) và gửi data qua MQTT.
- **Backend:** Tạo luồng MQTT Listener nhận số đo, lưu vào bảng `UtilityMeter` realtime. Chạy Job tự động mỗi ngày 30 sinh hóa đơn.
- **Frontend:** Bổ sung dashboard "Giám sát năng lượng thời gian thực" cho từng phòng, cảnh báo thất thoát.

## 4. Prompt Kích hoạt
Dưới đây là Prompt dành cho AI Agent khi bạn muốn bắt tay vào code các hạng mục còn lại của Giai đoạn 1:

```text
Chào Agent, hãy bật tính năng "Smart Utility Billing (Giai đoạn 1)" lên.
Dưới đây là các task cần giải quyết ngay:
1. Sửa lớp `PaymentSuccessEvent` trong backend, bổ sung thêm thuộc tính `BillType`. Gỡ bỏ rào cản chỉ phát event khi có `assignmentId` trong `PaymentService`. Phát event cho mọi hóa đơn thanh toán thành công.
2. Sửa file `BillGenerationListener.java`, đổi giá tiền cứng `2100000` thành `1050000` (đóng theo quý).
3. Tạo API CRUD cho Entity `UtilityMeter` (Chỉ số điện nước) để Admin có thể nhập tay chỉ số mới của công tơ điện hàng tháng (Chỉ số mới - Chỉ số cũ = Tiêu thụ).
4. Viết hàm tự động tạo `Bill` loại `ELECTRIC_FEE`, gán cho `studentId` của Trưởng phòng và gán `amount` theo biểu giá.
5. Tạo màn hình "Ghi chỉ số Tiện ích" trên React Frontend cho phép Admin nhập liệu.
```
