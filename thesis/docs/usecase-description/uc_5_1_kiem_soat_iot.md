# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 5: An ninh thông minh IoT
### UC 5.1: Kiểm soát Cổng ra vào & Thiết bị IoT

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Kiểm soát Cổng ra vào & Thiết bị IoT** |
| **Actor** | Thiết bị Gateway (Hardware), Admin |
| **Mô tả** | Quản lý toàn bộ giao tiếp giữa phần mềm (Backend) và phần cứng (ESP32/Raspberry Pi) đặt tại các cổng và cửa phòng. Xử lý logic xác thực ra vào theo thời gian thực (Real-time), đồng bộ dữ liệu ngoại tuyến (Offline), và xử lý các sự kiện khẩn cấp. |
| **Pre-conditions** | - Thiết bị IoT Gateway đã được kết nối mạng và đăng ký định danh với hệ thống Backend.<br>- Hệ thống đã cấu hình sẵn giờ giới nghiêm. |
| **Post-conditions** | **Success:** Lịch sử ra vào được ghi nhận vào CSDL. Cửa vật lý mở/đóng thành công.<br>**Fail:** Xác thực thất bại, hệ thống báo còi/đèn và ghi log vi phạm. |
| **Luồng sự kiện chính** | 1. Thiết bị quét thông tin (Thẻ/Khuôn mặt/PIN) và gửi về Server.<br>2. Server xác thực và trả kết quả lệnh điều khiển Relay (Mở cửa).<br>3. Admin giám sát và điều khiển thiết bị từ xa qua Web.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Xác thực thẻ RFID/Face ID/Mã PIN (Real-time)**.<br>- Extend Use Case **Lấy danh sách RFID hợp lệ (Đồng bộ thiết bị)**.<br>- Extend Use Case **Đồng bộ log offline IoT**.<br>- Extend Use Case **Xem lịch sử ra vào (Admin)**.<br>- Extend Use Case **Mở cửa từ xa / Khẩn cấp**.<br>- Extend Use Case **Cấu hình giờ giới nghiêm & Thông báo**. |
| **Luồng sự kiện phụ** | - Cổng mất kết nối Internet, thiết bị tự động chuyển sang chế độ Xác thực Offline (Dựa trên Cache nội bộ). |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Xác thực thẻ RFID / Face ID / Mã PIN (Real-time)
*   **Bước 1:** Sinh viên quẹt thẻ, quét khuôn mặt, hoặc nhập PIN tại thiết bị đọc.
*   **Bước 2:** Gateway mã hóa thông tin và gọi API `POST /api/v1/iot/verify` về Backend.
*   **Bước 3:** Backend đối chiếu thông tin với CSDL:
    *   Kiểm tra định danh có hợp lệ không.
    *   Kiểm tra sinh viên có quyền truy cập vào khu vực/phòng đó không.
    *   Kiểm tra khung giờ hiện tại có nằm trong giới hạn cho phép không.
*   **Bước 4:** Backend trả về JSON `{ "action": "UNLOCK" }`.
*   **Bước 5:** Gateway nhận lệnh, bật Relay mở cửa.
*   **Bước 6:** Backend lưu bản ghi vào bảng `AccessLog`.
> **Rẽ nhánh 1.1 (Từ chối truy cập):** 
> - *Bước 3.1:* Thẻ chưa đăng ký, sai phòng, hoặc ngoài khung giờ cho phép.
> - *Bước 4.1:* Backend trả về `{ "action": "DENY" }`. Gateway chớp đèn đỏ và không mở cửa.

#### 2. Lấy danh sách RFID hợp lệ (Đồng bộ thiết bị - Fallback)
*   **Bước 1:** Định kỳ mỗi 15 phút, IoT Gateway gọi API `GET /api/v1/iot/sync-rfid`.
*   **Bước 2:** Backend trả về danh sách các mã UID hợp lệ (chỉ cần chứa mã số) để Gateway lưu vào bộ nhớ Flash.
*   **Bước 3:** Khi đứt mạng Internet, Gateway dùng danh sách này để tự mở cửa offline.

#### 3. Đồng bộ log offline IoT
*   **Bước 1:** Khi có Internet trở lại, Gateway gom toàn bộ lịch sử quẹt thẻ lúc rớt mạng thành 1 mảng JSON.
*   **Bước 2:** Gọi API `POST /api/v1/iot/sync-logs` để đẩy dữ liệu lên Backend.
*   **Bước 3:** Backend parse mảng dữ liệu, lọc trùng lặp và insert bù vào bảng `AccessLog`.

#### 4. Xem lịch sử ra vào (Admin)
*   **Bước 1:** Admin vào tính năng `Nhật ký ra vào`.
*   **Bước 2:** Hệ thống hiển thị danh sách dạng bảng (Thời gian, Tên SV, MSSV, Phương thức mở: Face/RFID/PIN, Trạng thái: Thành công/Thất bại).
*   **Bước 3:** Admin có thể lọc tìm những ca "Cố tình quẹt sai thẻ nhiều lần".

#### 5. Mở cửa từ xa / Mở cửa khẩn cấp
*   **Bước 1:** Trong trường hợp sinh viên quên mang thẻ, Admin chọn chức năng `Mở cửa từ xa` cho 1 phòng cụ thể.
*   **Bước 2:** Hệ thống bắn MQTT Message / WebHook xuống Gateway để kích hoạt Relay.
*   **Bước 3 (Khẩn cấp):** Khi có hỏa hoạn, Admin bấm nút `Mở toàn bộ hệ thống`. Backend lập tức gửi Broadcast Message bắt buộc toàn bộ cửa trong Tòa nhà tự động nhả chốt.

#### 6. Cấu hình giờ giới nghiêm & Xử lý vi phạm
*   **Bước 1:** Admin thiết lập Giờ giới nghiêm (VD: 23:00 - 05:00).
*   **Bước 2:** Khi có log quét thẻ lúc 23:30 (Sinh viên đi chơi về muộn).
*   **Bước 3:** Tại Background, hệ thống phát hiện thời gian quét nằm trong khung giới nghiêm.
*   **Bước 4:** Hệ thống tự động đánh dấu bản ghi Log là "Vi phạm về trễ", đồng thời gửi Email / Notification cảnh cáo đến sinh viên và thống kê vào báo cáo cho Admin.
