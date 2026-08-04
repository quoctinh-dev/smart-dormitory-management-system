# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 3: Dịch vụ lưu trú
### UC 3.3: Thực thi Lưu trú (Check-in/Check-out)

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Thực thi Lưu trú (Check-in/Check-out)** |
| **Actor** | Sinh viên, Admin |
| **Mô tả** | Quản lý hai đầu mút quan trọng nhất trong vòng đời lưu trú thực tế của sinh viên: Nhận phòng (Check-in) sau khi thanh toán, và Trả phòng (Check-out) khi kết thúc hợp đồng hoặc rời đi trước hạn. |
| **Pre-conditions** | - **Check-in:** Sinh viên đã được xếp phòng và đã đóng tiền.<br>- **Check-out:** Sinh viên đang lưu trú hợp lệ (Trạng thái OCCUPIED). |
| **Post-conditions** | **Success:** Trạng thái lưu trú chuyển sang Đang ở (Occupied) hoặc Đã rời đi (Completed/Terminated). Tài nguyên giường trống được hệ thống cập nhật tự động.<br>**Fail:** Không thể xác nhận nếu hồ sơ chưa đóng tiền, hoặc nợ tài sản. |
| **Luồng sự kiện chính** | 1. Actor thực hiện yêu cầu Check-in hoặc Check-out.<br>2. Admin kiểm tra các điều kiện ràng buộc thực tế.<br>3. Admin phê duyệt trên hệ thống và hệ thống tự động xử lý tài nguyên ngầm.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Xem & Xác nhận Check-in (Admin)**.<br>- Extend Use Case **Nộp đơn trả phòng (SV)**.<br>- Extend Use Case **Duyệt đơn trả phòng (Admin)**. |
| **Luồng sự kiện phụ** | - Admin hoặc Sinh viên chọn **Hủy** thao tác, hệ thống không thay đổi dữ liệu. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Xem & Xác nhận Check-in
*   **Bước 1:** Khi sinh viên đến nhận phòng thực tế, Admin mở tính năng `Check-in`.
*   **Bước 2:** Quét mã QR hồ sơ hoặc nhập MSSV của sinh viên.
*   **Bước 3:** Hệ thống lấy thông tin chi tiết: Giường/Phòng đã được giữ chỗ và Trạng thái thanh toán hóa đơn.
*   **Bước 4:** Nếu hóa đơn hiển thị `PAID` (Đã thanh toán), Admin bấm nút `Xác nhận Check-in`.
*   **Bước 5:** Đổi trạng thái hợp đồng (Assignment) sang `OCCUPIED`.
*   **Bước 6:** (Nghiệp vụ liên luồng) Hệ thống kích hoạt API cấp quyền mã PIN/FaceID xuống hệ thống IoT Ký túc xá cho sinh viên.
> **Rẽ nhánh 1.1 (Chưa thanh toán):** 
> - *Bước 4.1:* Hệ thống báo hóa đơn nợ (`UNPAID`).
> - *Bước 5.1:* Nút Check-in bị khóa, yêu cầu sinh viên hoàn tất thanh toán trước khi nhận phòng.

#### 2. Nộp đơn trả phòng (SV)
*   **Bước 1:** Sinh viên có nhu cầu rời đi truy cập chức năng `Đơn trả phòng`.
*   **Bước 2:** Nhập thông tin: Ngày dự kiến rời đi, Lý do, và Số tài khoản ngân hàng (để hoàn cọc/tiền thừa).
*   **Bước 3:** Bấm `Gửi`. Đơn được lưu với trạng thái `PENDING` và báo cho Admin.

#### 3. Duyệt đơn trả phòng (Admin)
*   **Bước 1:** Cán bộ quản lý kiểm tra tài sản phòng thực tế.
*   **Bước 2:** Admin truy cập vào Đơn xin trả phòng, bấm `Phê duyệt`.
*   **Bước 3:** Hệ thống chuyển Hợp đồng lưu trú thành `TERMINATED` (Kết thúc sớm) hoặc `COMPLETED` (Hoàn tất đúng hạn).
*   **Bước 4:** (Nghiệp vụ liên luồng cốt lõi) Hệ thống tự động kích hoạt **Thu hồi quyền IoT** (Xóa FaceID/RFID của sinh viên tại phòng đó) và **Giải phóng Giường** (Cập nhật Bed status = AVAILABLE, giảm số lượng người đang ở của Phòng đi 1).
> **Rẽ nhánh 3.1 (Phạt tài sản):**
> - *Bước 2.1:* Phát hiện mất mát tài sản.
> - *Bước 3.1:* Admin bấm `Từ chối` đơn, buộc sinh viên bồi thường trước khi duyệt lại.
