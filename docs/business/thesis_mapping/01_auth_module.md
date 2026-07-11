# CHUẨN BỊ NỘI DUNG LUẬN VĂN: MODULE XÁC THỰC (AUTH)

Tài liệu này tổng hợp toàn bộ các kết quả code của Module Auth và ánh xạ (map) trực tiếp vào khung sườn Luận văn mà Giáo viên hướng dẫn yêu cầu, giúp sinh viên có sẵn "nguyên liệu" để copy/viết thẳng vào file Word báo cáo.

---

## Chương 1: Giới thiệu
### 1.2. Những thách thức cần giải quyết (Trong phạm vi Auth)
- **Thách thức kỹ thuật:** Bảo vệ hệ thống khỏi các cuộc tấn công dò mật khẩu (Brute-force) mà không làm phình to cơ sở dữ liệu.
- **Thách thức nghiệp vụ:** Đảm bảo toàn vẹn dữ liệu lịch sử (Không được phép xóa vật lý bất kỳ tài khoản nào để giữ nguyên dấu vết trên các hóa đơn/hợp đồng cũ).

### 1.4. Kết quả cần đạt (Bảng tiêu chí)
| Tiêu chí | Mô tả kết quả đã đạt được | Đánh giá |
| :--- | :--- | :--- |
| Bảo mật (Chức năng) | Mã hóa mật khẩu BCrypt, sử dụng JWT Token an toàn. | Đạt |
| Chống tấn công (Phi chức năng) | Hệ thống tự động khóa tài khoản 15 phút nếu nhập sai mật khẩu 5 lần. | Đạt |
| Toàn vẹn dữ liệu (Phi chức năng) | Áp dụng Soft Delete (`is_deleted`) ở tầng BaseEntity, chặn hoàn toàn Hard Delete. | Đạt |

---

## Chương 2: Phương pháp thực hiện
### 2.4. Phân tích yêu cầu
#### 2.4.1. Các quy trình, nghiệp vụ
*Sinh viên có thể vẽ sơ đồ theo các luồng sau:*
1. **Quy trình Đăng nhập chống Brute-force:** 
   - Nhập Username/Password -> Kiểm tra thời gian khóa (`lock_time`).
   - Nếu đang khóa -> Báo lỗi. Nếu không -> Kiểm tra mật khẩu.
   - Sai mật khẩu -> Tăng `failed_login_attempts`. Nếu >= 5 -> Cập nhật `lock_time` = now + 15 phút.
   - Đúng mật khẩu -> Reset `failed_login_attempts` = 0, cấp phát Access Token & Refresh Token.
2. **Quy trình Reset Password an toàn:**
   - Cấp phát Token ngẫu nhiên (32 bytes Base64).
   - Hash Token bằng SHA-256 trước khi lưu vào DB (bảo vệ Token ngay cả khi DB bị lộ).
   - Link gửi qua Email tự hủy sau 15 phút.

#### 2.4.3. Sơ đồ Use case
- **Actor:** Sinh viên, Ban Quản Lý (Admin/Staff).
- **Use cases:** Đăng nhập, Quên mật khẩu, Đổi mật khẩu, Kích hoạt tài khoản bằng CCCD.

---

## Chương 3: Thiết kế
### 3.1. Mô hình dữ liệu
- **Bảng `user_accounts`:**
  - Không sinh thêm bảng phụ rườm rà.
  - Được bổ sung các trường tối ưu: `failed_login_attempts` (INT), `lock_time` (DATETIME), `is_deleted` (BOOLEAN).
  - Tích hợp `@SQLDelete` và `@SQLRestriction` ở mức ORM (Hibernate) để ứng dụng tự động lọc tài khoản đã xóa mà không cần can thiệp vào tầng Business Logic.

### 3.2. Mô hình xử lý
#### 3.2.2. Sơ đồ tuần tự (Sequence Diagram) - Đăng nhập
- `Client` -> `AuthController` -> `AuthService` -> `UserAccountRepository`.
- Nêu bật đoạn xử lý kiểm tra `lockTime` và tăng `failedLoginAttempts` ngay bên trong Database Transaction.

### 3.3. Ma trận Phân quyền API (API Permission Matrix)
Do đặc thù Auth là module "Cửa ngõ", phần lớn các API phải để trạng thái Public. Tuy nhiên, các API thay đổi thông tin cá nhân đều yêu cầu xác thực.

| API Endpoint | HTTP Method | Annotation Phân quyền | Chức năng | Phân loại |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | POST | `(Không gắn / Public)` | Đăng nhập hệ thống | Public |
| `/api/v1/auth/activate` | POST | `(Không gắn / Public)` | Sinh viên kích hoạt tài khoản | Public |
| `/api/v1/auth/forgot-password`| POST | `(Không gắn / Public)` | Gửi yêu cầu lấy lại mật khẩu | Public |
| `/api/v1/auth/reset-password` | POST | `(Không gắn / Public)` | Đặt lại mật khẩu bằng Token | Public |
| `/api/v1/auth/refresh-token` | POST | `(Không gắn / Public)` | Xin cấp lại Access Token | Public |
| `/api/v1/auth/logout` | POST | `@PreAuthorize("isAuthenticated()")`| Đăng xuất | Authenticated |
| `/api/v1/auth/change-password`| POST | `@PreAuthorize("isAuthenticated()")`| Đổi mật khẩu chủ động | Authenticated |

---

## Chương 4: Thử nghiệm
### 4.1. Các kịch bản thử nghiệm (Test Cases)
Sinh viên cần chụp màn hình lại các thao tác này để đưa vào báo cáo:
1. **Kịch bản 1 (Mật khẩu sai):** Cố tình nhập sai mật khẩu 1 lần -> API trả về lỗi "Invalid Credentials". Check DB thấy `failed_login_attempts` tăng 1.
2. **Kịch bản 2 (Khóa tài khoản):** Nhập sai liên tiếp 5 lần -> API trả về lỗi "Tài khoản bị khóa 15 phút".
3. **Kịch bản 3 (Đăng nhập khi bị khóa):** Tiếp tục nhập đúng mật khẩu ngay lúc đó -> API vẫn từ chối do chưa hết 15 phút.
4. **Kịch bản 4 (Xóa mềm):** Gọi lệnh Xóa một tài khoản -> Tài khoản biến mất khỏi giao diện, nhưng DB chỉ cập nhật `is_deleted = true`. Đăng nhập bằng tài khoản đó -> Báo lỗi không tồn tại.

---

## Chương 5: Kết luận
### 5.1. Kết quả đối chiếu với mục tiêu
- Hệ thống đã đáp ứng 100% mục tiêu bảo mật cho Module Auth với chi phí lưu trữ (Storage Cost) tối thiểu nhất (chỉ tốn vài byte cho các cột mới thay vì hàng MB cho các bảng Log rác).
