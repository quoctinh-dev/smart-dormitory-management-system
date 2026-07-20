# Kiến Trúc Bảo Mật Vật Lý IoT và Nghiệp Vụ Chuyển Phòng

Tài liệu này mô tả chi tiết logic phân mảnh dữ liệu (Segmented Whitelist) giữa Backend và Hệ thống IoT Gateway (ESP32) nhằm phục vụ trực tiếp cho báo cáo luận văn tốt nghiệp phần **Đánh giá và Tối ưu An ninh Hệ thống**.

## 1. Bối cảnh Nghiệp vụ (Physical Reality)

- **Kiểm soát cổng chính / Tòa nhà:** Sử dụng Thẻ từ (RFID) và Khuôn mặt (FaceID).
- **Kiểm soát cửa phòng:** Sử dụng Mã PIN dùng chung cho các sinh viên trong phòng.
- **Hành vi Chuyển phòng (Change Room):** Sinh viên không cần trả chìa khóa vật lý. Khi được Admin duyệt đơn, sinh viên nhận mã PIN của phòng mới và có thể chuyển đồ sang ngay lập tức. Do đó, Hợp đồng (Assignment) được Backend chuyển sang trạng thái `OCCUPIED` ngay lập tức mà không cần qua bước `PENDING_CHECKIN`.

## 2. Vấn đề Bảo mật (Security Flaw) ở phiên bản cũ
Trước khi tối ưu, hệ thống sử dụng cơ chế **Global Whitelist (Danh sách trắng toàn cục)**.
- Backend lấy TẤT CẢ mã thẻ RFID của những sinh viên đang ở trạng thái `ACTIVE`.
- Backend đẩy toàn bộ danh sách này vào chung một topic MQTT: `sdms/gates/system/whitelist`.
- **Hậu quả Vật lý:** Thiết bị ESP32 ở Tòa B cũng nhận được thẻ từ của sinh viên Tòa A. Sinh viên Tòa A có thể dùng thẻ của mình để mở cổng Tòa B (Đi lại tự do giữa các tòa). Đây là một lỗ hổng an ninh nghiêm trọng đối với KTX.

## 3. Kiến trúc Tối ưu: Segmented Whitelist (Danh sách phân mảnh)
Để vá lỗ hổng trên, hệ thống đã được tái cấu trúc sang cơ chế **Segmented Whitelist**.

### 3.1. Truy vấn Dữ liệu (Backend Repository)
Thay vì gom chung tất cả sinh viên `ACTIVE`, Backend thực hiện phép JOIN qua các bảng phân cấp vật lý (`Student` -> `StudentHousingAssignment` -> `Bed` -> `Room` -> `Floor` -> `Building`) để nhóm mã thẻ RFID theo từng Tòa nhà.

### 3.2. Rải Bản tin theo Topic phân mảnh (MQTT Broadcast)
Hàm `syncWhitelistToEdge` được viết lại. Thay vì gửi 1 bản tin Global, Backend vòng lặp qua từng Tòa nhà và gửi bản tin riêng biệt:
- Topic Tòa A: `sdms/gates/building/UUID_TOA_A/whitelist` (Chỉ chứa mã thẻ của dân Tòa A).
- Topic Tòa B: `sdms/gates/building/UUID_TOA_B/whitelist` (Chỉ chứa mã thẻ của dân Tòa B).

👉 ESP32 ở cổng Tòa nào thì chỉ `subscribe` vào Topic của Tòa đó.

## 4. Tự động hóa qua Kiến trúc Hướng Sự kiện (Event-Driven)
Khi sinh viên làm thủ tục "Chuyển Tòa" (Đổi phòng từ Tòa A sang Tòa B):
1. **ChangeRoomService** sau khi cập nhật Database sẽ kích nổ sự kiện `StudentRoomChangedEvent`.
2. **SmartAccessMqttListener** bắt sự kiện này và gọi hàm `syncWhitelistToEdge()`.
3. Quá trình đồng bộ phân mảnh diễn ra tức thì: 
   - Danh sách của Tòa cũ (Tòa A) bị gạch tên sinh viên này.
   - Danh sách của Tòa mới (Tòa B) được bổ sung tên sinh viên này.
   - Hệ thống tự động đẩy 2 danh sách mới xuống ESP32 ở 2 Tòa qua MQTT.

Việc chuyển giao quyền truy cập (Access Rights) diễn ra mượt mà, không độ trễ và không cần con người can thiệp, đảm bảo an ninh tuyệt đối theo chuẩn của Hệ thống Quản lý Tòa nhà Thông minh (Smart Building Management System).
