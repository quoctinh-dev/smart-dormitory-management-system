# Mobile Integration Guide (Module Auth)

Tài liệu này dành riêng cho đội Mobile (Android/Kotlin) để tích hợp an toàn, hiệu quả Module Auth vào Student App.

## 1. Lưu trữ và Quản lý Token (Token Management)

- **Access Token (AT)**: Có thời hạn ngắn (thường 15-30 phút). Gửi kèm mọi request qua Header `Authorization: Bearer <AT>`. 
- **Refresh Token (RT)**: Thời hạn dài (Vd: 7-30 ngày). Dùng để lấy lại AT.
- **Nơi lưu trữ**:
  - Không lưu vào `SharedPreferences` thông thường.
  - **Bắt buộc**: Lưu vào **EncryptedSharedPreferences** (thư viện Security Crypto của Jetpack) hoặc Android Keystore để chống extract token khi máy bị root.

## 2. Chiến lược gọi API & Refresh Token (Interceptor)

- **OkHttp Authenticator / Interceptor**:
  - Khi gọi bất kỳ API nào (VD: Lấy profile), nếu nhận về mã `401 UNAUTHORIZED`.
  - Client tự động "pause" các request hiện tại, ngầm gọi hàm `refreshToken()` với RT.
  - **Thành công**: Cập nhật AT + RT mới vào EncryptedSharedPreferences, sau đó `retry` lại các API vừa thất bại với AT mới.
  - **Thất bại** (RT hết hạn hoặc bị thu hồi, nhận về 401 hoặc 403): Xóa toàn bộ Token ở local, bắn sự kiện điều hướng ép người dùng về màn hình `LoginScreen`, hiển thị thông báo "Phiên đăng nhập đã hết hạn".

## 3. Màn hình và Gọi API (Screen Mapping)

| Screen (Màn hình) | Sự kiện User | API cần gọi | Logic xử lý sau đó |
| :--- | :--- | :--- | :--- |
| `SplashScreen` | App khởi động | K.tra Token Local | Nếu có AT -> Vào `MainScreen`. Không có -> `LoginScreen`. |
| `LoginScreen` | Nhấn "Đăng nhập" | `POST /login` | - `200`: Lưu Token, vào `MainScreen`.<br>- `403 PENDING`: Chuyển sang `ActivationScreen`. |
| `ActivationScreen`| Nhập CCCD + MK Mới | `POST /activate` | Thành công -> Lưu Token -> Vào `MainScreen`. |
| `ForgotPasswordScreen`| Nhấn "Gửi email" | `POST /forgot-password`| Thành công -> Hiện Dialog báo người dùng check email. |
| `SettingsScreen` | Nhấn "Đổi MK" | `POST /change-password`| Thành công -> Xóa Token local -> Đẩy về `LoginScreen`. |
| `SettingsScreen` | Nhấn "Đăng xuất" | `POST /logout` | Gửi AT lên để Backend xóa RT. Sau đó xóa Token local, về `LoginScreen`. |

## 4. Xử lý Lỗi Mạng & Trạng thái (Resilience)

### Network Error / Offline
- Nếu không có mạng: Chặn nhấn nút "Login" (disable button), hiện Toast "Không có kết nối mạng".
- Nếu gọi `POST /login` bị Timeout (`java.net.SocketTimeoutException`): Hiện snackbar "Kết nối đến máy chủ thất bại, vui lòng thử lại" (Retry).

### Retry Policy
- Các API POST (như login, change-password) **KHÔNG ĐƯỢC** auto-retry khi timeout để tránh tạo ra hiệu ứng side-effect ngoài ý muốn.
- Token Refresh Request (POST /refresh-token) nên giới hạn 1 lần duy nhất trong luồng Authenticator. Không call lại liên tục nếu nhận lỗi 401.

### Xử lý Xóa Dữ liệu khi Đăng xuất (Logout / Force Logout)
Khi thực hiện Logout (hoặc Force Logout do RT hết hạn), App phải làm các bước:
1. Gửi `POST /logout` (nếu là user chủ động logout).
2. Xóa Access Token & Refresh Token.
3. Xóa User Profile đã cache trong Room Database / DataStore.
4. Xóa Notification Cache.
5. Hủy tất cả các màn hình trong backstack và navigate về `LoginScreen`.

## 5. Token Expiration Handling (Tránh delay)
Thay vì đợi bị 401 mới call Refresh, có thể lấy payload của Access Token (JWT không mã hóa payload) giải mã Base64 ở App, lấy field `exp` (Expire time). Nếu thời gian hiện tại sát với `exp` (cách 1 phút), chủ động gọi Background Request làm mới Token trước khi thực hiện Request chính. Việc này giúp App phản hồi nhanh hơn.
