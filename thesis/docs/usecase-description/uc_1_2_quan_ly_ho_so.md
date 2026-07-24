# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 1: Hệ thống & Tài khoản
### UC 1.2: Quản lý Hồ sơ Người dùng

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản lý Hồ sơ Sinh viên (Người dùng)** |
| **Actor** | Admin, Sinh viên |
| **Mô tả** | Quản lý thông tin hồ sơ của sinh viên nội trú trong hệ thống, bao gồm việc sinh viên xem và cập nhật thông tin cá nhân, đồng thời hỗ trợ Admin quản lý hồ sơ sinh viên và gán thẻ RFID phục vụ kiểm soát ra vào. |
| **Pre-conditions** | - Actor (Admin hoặc Sinh viên) phải đăng nhập thành công vào hệ thống. |
| **Post-conditions** | **Success:** Hồ sơ sinh viên hoặc thông tin thẻ RFID được cập nhật thành công vào CSDL.<br>**Fail:** Hệ thống hiển thị thông báo lỗi và dữ liệu trong CSDL không thay đổi. |
| **Luồng sự kiện chính** | 1. Actor chọn chức năng Quản lý Hồ sơ Người dùng.<br>2. Hệ thống hiển thị màn hình Hồ sơ cá nhân hoặc Quản lý Sinh viên tương ứng với quyền của Actor.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Xem hồ sơ cá nhân**.<br>- Extend Use Case **Cập nhật hồ sơ cá nhân**.<br>- Extend Use Case **Xem danh sách sinh viên**.<br>- Extend Use Case **Xem hồ sơ chi tiết sinh viên**.<br>- Extend Use Case **Cập nhật thông tin sinh viên**.<br>- Extend Use Case **Gắn thẻ RFID cho sinh viên**. |
| **Luồng sự kiện phụ** | - Actor chọn **Quay lại** hoặc **Thoát**.<br>- Hệ thống hủy thao tác hiện tại và quay về màn hình trước đó. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Xem hồ sơ cá nhân
*   **Bước 1:** Sinh viên chọn chức năng Hồ sơ cá nhân.
*   **Bước 2:** Hệ thống truy vấn CSDL lấy thông tin sinh viên đang đăng nhập.
*   **Bước 3:** Hệ thống hiển thị đầy đủ thông tin hồ sơ cá nhân (Thông tin cơ bản, Lớp, Khoa, Thông tin liên hệ).

#### 2. Cập nhật hồ sơ cá nhân
*   **Bước 1:** Sinh viên chọn Chỉnh sửa.
*   **Bước 2:** Cập nhật các thông tin được phép (Số điện thoại, Email liên hệ phụ, Địa chỉ...).
*   **Bước 3:** Hệ thống kiểm tra tính hợp lệ của dữ liệu.
*   **Bước 4:** Sinh viên chọn Lưu thay đổi.
*   **Bước 5:** Hệ thống cập nhật CSDL.
*   **Bước 6:** Hiển thị thông báo thành công.
> **Rẽ nhánh 2.1 (Dữ liệu không hợp lệ):**
> - *Bước 3.1:* Dữ liệu sai định dạng (Ví dụ: SDT có chữ).
> - *Bước 4.1:* Hệ thống yêu cầu nhập lại và không cho phép lưu.

#### 3. Xem danh sách sinh viên
*   **Bước 1:** Admin chọn Quản lý Sinh viên.
*   **Bước 2:** Hệ thống truy vấn CSDL.
*   **Bước 3:** Hiển thị danh sách sinh viên, hỗ trợ tìm kiếm theo MSSV/Tên và phân trang.

#### 4. Xem hồ sơ chi tiết sinh viên
*   **Bước 1:** Admin chọn `Xem chi tiết` tại một sinh viên bất kỳ.
*   **Bước 2:** Hệ thống truy vấn CSDL.
*   **Bước 3:** Hiển thị chi tiết hồ sơ sinh viên, bao gồm lịch sử lưu trú và thông tin thẻ RFID hiện tại.

#### 5. Cập nhật thông tin sinh viên
*   **Bước 1:** Admin chọn Chỉnh sửa hồ sơ của một sinh viên.
*   **Bước 2:** Cập nhật thông tin. Admin có đặc quyền sửa các trường bị khóa (Khóa học, MSSV...).
*   **Bước 3:** Hệ thống kiểm tra tính hợp lệ.
*   **Bước 4:** Admin chọn Lưu.
*   **Bước 5:** Hệ thống cập nhật CSDL.
> **Rẽ nhánh 5.1 (Trùng MSSV):**
> - *Bước 3.1:* Nếu Admin đổi MSSV sang một mã đã tồn tại.
> - *Bước 4.1:* Hệ thống hiển thị thông báo lỗi và yêu cầu cập nhật lại.

#### 6. Gắn thẻ RFID cho sinh viên
*   **Bước 1:** Admin chọn chức năng `Gắn thẻ RFID` trong chi tiết hồ sơ sinh viên.
*   **Bước 2:** Hệ thống hiển thị màn hình nhập mã thẻ.
*   **Bước 3:** Admin dùng máy quét thẻ (Đầu đọc RFID gắn qua USB) để quét thẻ. Mã UID của thẻ tự động điền vào ô input.
*   **Bước 4:** Hệ thống kiểm tra xem thẻ này có đang được liên kết với một sinh viên khác chưa.
*   **Bước 5:** Admin chọn Lưu.
*   **Bước 6:** Hệ thống liên kết thẻ với hồ sơ sinh viên, lưu UID vào CSDL.
*   **Bước 7:** Hiển thị thông báo thành công.
> **Rẽ nhánh 6.1 (Thẻ RFID đã sử dụng):**
> - *Bước 4.1:* Thẻ RFID (Mã UID) đã được gắn cho sinh viên khác.
> - *Bước 5.1:* Hệ thống báo lỗi và yêu cầu Admin sử dụng thẻ trắng khác.
