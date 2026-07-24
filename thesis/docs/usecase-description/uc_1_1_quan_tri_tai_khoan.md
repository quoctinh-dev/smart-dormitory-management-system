# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 1: Hệ thống & Tài khoản
### UC 1.1: Quản trị Tài khoản & Phân quyền

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản trị Tài khoản & Phân quyền** |
| **Actor** | Admin, Sinh viên |
| **Mô tả** | Quản lý vòng đời tài khoản người dùng trong hệ thống, bao gồm đăng nhập, đăng xuất, kích hoạt tài khoản, đổi mật khẩu, khôi phục mật khẩu, tạo tài khoản cán bộ, xem danh sách tài khoản và khóa/mở khóa tài khoản. |
| **Pre-conditions** | - Đối với chức năng quản lý tài khoản: Admin đã đăng nhập thành công.<br>- Đối với các chức năng Đăng nhập, Kích hoạt tài khoản và Quên mật khẩu: Không yêu cầu đăng nhập. |
| **Post-conditions** | **Success:** Phiên làm việc được tạo hoặc kết thúc, trạng thái tài khoản được cập nhật vào CSDL.<br>**Fail:** Hệ thống hiển thị thông báo lỗi và dữ liệu trong CSDL không thay đổi. |
| **Luồng sự kiện chính** | 1. Actor chọn chức năng Quản trị Tài khoản và Phân quyền.<br>2. Hệ thống hiển thị màn hình Quản trị Tài khoản & Phân quyền.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Đăng nhập**.<br>- Extend Use Case **Kích hoạt tài khoản (OTP)**.<br>- Extend Use Case **Đăng xuất**.<br>- Extend Use Case **Quên & Đặt lại mật khẩu**.<br>- Extend Use Case **Đổi mật khẩu**.<br>- Extend Use Case **Tạo tài khoản (Cán bộ)**.<br>- Extend Use Case **Xem danh sách tài khoản**.<br>- Extend Use Case **Khóa/Mở khóa tài khoản**. |
| **Luồng sự kiện phụ** | - Actor chọn **Quay lại** hoặc **Thoát**.<br>- Hệ thống hủy thao tác hiện tại và quay về màn hình trước đó. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Đăng nhập
*   **Bước 1:** Actor nhập Mã sinh viên/Email và Mật khẩu.
*   **Bước 2:** Hệ thống kiểm tra dữ liệu đầu vào.
*   **Bước 3:** Actor chọn Đăng nhập.
*   **Bước 4:** Hệ thống xác thực thông tin với CSDL.
*   **Bước 5:** Hệ thống kiểm tra trạng thái tài khoản.
*   **Bước 6:** Hệ thống khởi tạo Token, phân quyền và chuyển đến màn hình chính.
> **Rẽ nhánh 1.1 (Thiếu thông tin):**
> - *Bước 2.1:* Thông tin đăng nhập chưa đầy đủ.
> - *Bước 3.1:* Hệ thống yêu cầu nhập đầy đủ và quay lại bước 1.
> 
> **Rẽ nhánh 1.2 (Sai thông tin):**
> - *Bước 4.1:* Tài khoản không tồn tại hoặc mật khẩu không chính xác.
> - *Bước 5.1:* Hệ thống thông báo thông tin đăng nhập không hợp lệ và quay lại bước 1.
> 
> **Rẽ nhánh 1.3 (Tài khoản bị khóa):**
> - *Bước 5.1:* Tài khoản bị khóa (LOCKED) hoặc chưa kích hoạt (PENDING).
> - *Bước 6.1:* Hệ thống thông báo tài khoản bị khóa và kết thúc Use Case.

#### 2. Kích hoạt tài khoản (OTP)
*   **Bước 1:** Sinh viên nhập Email/Mã sinh viên và mật khẩu tạm thời (CCCD).
*   **Bước 2:** Hệ thống kiểm tra tính hợp lệ của mật khẩu tạm thời.
*   **Bước 3:** Actor chọn Xác nhận và đổi mật khẩu mới.
*   **Bước 4:** Hệ thống cập nhật trạng thái tài khoản thành Đã kích hoạt (`ACTIVE`).
*   **Bước 5:** Hệ thống thông báo thành công và cấp Token đăng nhập.
> **Rẽ nhánh 2.1 (Thông tin không hợp lệ):**
> - *Bước 2.1:* Mật khẩu tạm thời không đúng hoặc tài khoản đã kích hoạt rồi.
> - *Bước 3.1:* Hệ thống thông báo lỗi và quay lại bước 1.

#### 3. Đăng xuất
*   **Bước 1:** Actor chọn Đăng xuất.
*   **Bước 2:** Hệ thống hiển thị hộp thoại xác nhận.
*   **Bước 3:** Actor chọn Đồng ý.
*   **Bước 4:** Hệ thống hủy Refresh Token trong CSDL và xóa Token ở Client.
*   **Bước 5:** Chuyển về màn hình Đăng nhập.
> **Rẽ nhánh 3.1 (Hủy):**
> - *Bước 3.1:* Actor chọn Hủy.
> - *Bước 4.1:* Hệ thống đóng hộp thoại và giữ nguyên phiên làm việc.

#### 4. Quên & Đặt lại mật khẩu
*   **Bước 1:** Actor chọn Quên mật khẩu và nhập Email.
*   **Bước 2:** Hệ thống kiểm tra Email.
*   **Bước 3:** Hệ thống gửi OTP hoặc liên kết đặt lại mật khẩu.
*   **Bước 4:** Actor nhập OTP và Mật khẩu mới.
*   **Bước 5:** Hệ thống cập nhật mật khẩu mới sau khi mã hóa (BCrypt).
*   **Bước 6:** Hiển thị thông báo thành công và yêu cầu đăng nhập lại.
> **Rẽ nhánh 4.1 (Email không tồn tại):**
> - *Bước 2.1:* Email không tồn tại trên hệ thống.
> - *Bước 3.1:* Hệ thống thông báo Email không hợp lệ và quay lại bước 1.

#### 5. Đổi mật khẩu
*   **Bước 1:** Actor chọn Đổi mật khẩu.
*   **Bước 2:** Nhập Mật khẩu hiện tại, Mật khẩu mới và Xác nhận mật khẩu mới.
*   **Bước 3:** Hệ thống kiểm tra Mật khẩu hiện tại.
*   **Bước 4:** Actor chọn Cập nhật.
*   **Bước 5:** Hệ thống lưu Mật khẩu mới vào CSDL.
> **Rẽ nhánh 5.1 (Sai mật khẩu cũ):**
> - *Bước 3.1:* Mật khẩu hiện tại không đúng.
> - *Bước 4.1:* Hệ thống thông báo lỗi và quay lại bước 2.

#### 6. Tạo tài khoản (Cán bộ)
*   **Bước 1:** Admin chọn Thêm nhân viên mới.
*   **Bước 2:** Nhập Email, Họ tên, Số điện thoại và Vai trò (Role).
*   **Bước 3:** Hệ thống kiểm tra dữ liệu.
*   **Bước 4:** Admin chọn Lưu.
*   **Bước 5:** Hệ thống kiểm tra Email và Số điện thoại có bị trùng không.
*   **Bước 6:** Hệ thống tạo tài khoản và gửi Email chứa mật khẩu tạm thời.
*   **Bước 7:** Cập nhật danh sách tài khoản.
> **Rẽ nhánh 6.1 (Trùng lặp):**
> - *Bước 5.1:* Email hoặc Số điện thoại đã tồn tại.
> - *Bước 6.1:* Hệ thống thông báo lỗi và quay lại bước 2.

#### 7. Xem danh sách tài khoản
*   **Bước 1:** Admin chọn Quản lý Tài khoản.
*   **Bước 2:** Hệ thống truy vấn CSDL.
*   **Bước 3:** Hiển thị danh sách tài khoản, hỗ trợ tìm kiếm, lọc theo vai trò và phân trang.

#### 8. Khóa/Mở khóa tài khoản
*   **Bước 1:** Admin chọn Khóa/Mở khóa tại một tài khoản.
*   **Bước 2:** Hệ thống hiển thị hộp thoại xác nhận.
*   **Bước 3:** Admin chọn Đồng ý.
*   **Bước 4:** Hệ thống cập nhật trạng thái khóa của tài khoản trong CSDL (Chuyển sang `LOCKED` hoặc `ACTIVE`).
*   **Bước 5:** Hiển thị thông báo thành công và cập nhật danh sách.
