# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 4: Tài chính & Thanh toán
### UC 4.2: Quản lý Hóa đơn & Công nợ

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản lý Hóa đơn & Công nợ** |
| **Actor** | Admin, Staff, Sinh viên |
| **Mô tả** | Quản lý vòng đời của các khoản thu trong KTX (tiền phòng, tiền điện nước, tiền phạt). Hệ thống tự động tạo hóa đơn tiền phòng khi xếp phòng, đồng thời hỗ trợ Admin tạo hóa đơn thủ công cho các khoản phát sinh. Sinh viên có thể tra cứu lịch sử hóa đơn của mình. |
| **Pre-conditions** | - Actor đã đăng nhập thành công vào hệ thống. |
| **Post-conditions** | **Success:** Hóa đơn mới được tạo thành công hoặc danh sách hóa đơn được truy xuất và hiển thị chuẩn xác.<br>**Fail:** Hệ thống hiển thị thông báo lỗi khi truy cập hoặc tạo dữ liệu sai. |
| **Luồng sự kiện chính** | 1. Admin/Staff vào menu Quản lý Hóa đơn để tạo hóa đơn thủ công hoặc xem toàn bộ.<br>2. Sinh viên vào Hồ sơ cá nhân để xem hóa đơn của riêng mình.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Tạo hóa đơn thủ công (Admin)**.<br>- Extend Use Case **Xem tất cả hóa đơn hệ thống (Admin)**.<br>- Extend Use Case **Xem hóa đơn theo hồ sơ**.<br>- Extend Use Case **Xem hóa đơn của bản thân (Sinh viên)**.<br>- Extend Use Case **Tự động tạo hóa đơn tiền phòng (Nghiệp vụ ngầm)**. |
| **Luồng sự kiện phụ** | - Actor chọn **Hủy** thao tác tạo/sửa hóa đơn, hệ thống làm trống form. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Tạo hóa đơn thủ công (Admin)
*   **Bước 1:** Admin chọn chức năng `Tạo hóa đơn mới`.
*   **Bước 2:** Chọn Sinh viên hoặc Mã phòng (đối với hóa đơn điện nước dùng chung).
*   **Bước 3:** Chọn Loại hóa đơn (Phạt vi phạm, Bồi thường tài sản, Dịch vụ khác...).
*   **Bước 4:** Nhập Số tiền (Amount), Hạn thanh toán (Due Date) và Mô tả chi tiết.
*   **Bước 5:** Bấm `Lưu`.
*   **Bước 6:** Hệ thống validate dữ liệu (Ví dụ: Kiểm tra sinh viên có tồn tại không).
*   **Bước 7:** Lưu hóa đơn với trạng thái mặc định là `UNPAID` (Chưa thanh toán) và gửi thông báo cho sinh viên.
> **Rẽ nhánh 1.1 (Thiếu thông tin):**
> - *Bước 6.1:* Admin không chọn Sinh viên cũng không chọn Phòng.
> - *Bước 7.1:* Hệ thống báo lỗi "Hóa đơn phải được gán cho một sinh viên hoặc một phòng cụ thể".

#### 2. Xem tất cả hóa đơn hệ thống (Admin)
*   **Bước 1:** Admin truy cập `Danh sách Hóa đơn`.
*   **Bước 2:** Hệ thống truy vấn toàn bộ bảng `Bill`, thực hiện Join (hoặc phân giải) mã `studentId`, `roomId` và `applicationId` để lấy tên sinh viên tương ứng.
*   **Bước 3:** Hiển thị danh sách hóa đơn, cho phép lọc theo Trạng thái (Đã thanh toán/Chưa thanh toán/Quá hạn) và Loại hóa đơn.
*   **Bước 4:** Admin có thể click vào từng dòng để xem chi tiết khoản thu.

#### 3. Xem hóa đơn theo hồ sơ
*   **Bước 1:** Admin đang xem chi tiết một Đơn đăng ký lưu trú (Application), chọn tab `Tài chính`.
*   **Bước 2:** Hệ thống truy vấn CSDL lọc ra hóa đơn có `applicationId` trùng khớp.
*   **Bước 3:** Hiển thị hóa đơn tiền phòng (Accommodation Fee) gắn liền với đợt đăng ký này.

#### 4. Xem hóa đơn của bản thân (Sinh viên)
*   **Bước 1:** Sinh viên truy cập tính năng `Hóa đơn & Thanh toán`.
*   **Bước 2:** Hệ thống đọc `studentId` của tài khoản đang đăng nhập.
*   **Bước 3:** Hệ thống lấy tất cả hóa đơn gắn với `studentId` (bao gồm tiền điện nước, tiền phạt) VÀ tất cả hóa đơn gắn với các `applicationId` của sinh viên này (tiền phòng các học kỳ).
*   **Bước 4:** Hiển thị danh sách hóa đơn, bôi đỏ các hóa đơn `UNPAID` sắp quá hạn.
> **Rẽ nhánh 4.1 (Không có dữ liệu):**
> - *Bước 3.1:* Sinh viên chưa từng có hóa đơn nào.
> - *Bước 4.1:* Hệ thống hiển thị "Bạn không có hóa đơn nào cần thanh toán".

#### 5. Tự động tạo hóa đơn tiền phòng (Nghiệp vụ ngầm)
*   **Bước 1:** Kích hoạt ngầm ngay sau khi Admin bấm `Duyệt đơn đăng ký` (UC 3.2).
*   **Bước 2:** Hệ thống đọc đơn giá của Phòng được xếp.
*   **Bước 3:** Lấy cấu hình hệ thống `PAYMENT_DEADLINE_DAYS` (VD: 3 ngày) để tính ngày hết hạn (Due Date = Now + 3 days).
*   **Bước 4:** Tự động tạo bản ghi Bill loại `ACCOMMODATION_FEE` với trạng thái `UNPAID`.
*   **Bước 5:** Trigger tạo mã QR thanh toán (Sẽ cover ở UC 4.3).
