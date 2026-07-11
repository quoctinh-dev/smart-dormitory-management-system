# Đặc tả Phân hệ Xác thực & Bảo mật (Auth Overview)

Tài liệu này cung cấp hướng dẫn tích hợp API xác thực dành cho Frontend (Web Admin và App Student), bao gồm quy trình Đăng nhập, Đăng xuất, Làm mới Token và cách thức đính kèm JWT vào request.

## 1. Cơ chế Xác thực (JWT Bearer)
Hệ thống sử dụng **JSON Web Token (JWT)** để quản lý phiên đăng nhập. 
- Token được cấp phát khi gọi API Login và phải được đính kèm vào Header của mọi request tiếp theo yêu cầu quyền truy cập.
- **Quy chuẩn Header (Axios):** `Authorization: Bearer <access_token>`

## 2. Đặc tả API Xác thực (Auth API)

### 2.1. Đăng nhập (Login)
API dùng chung cho cả Admin và Student. Hệ thống sẽ tự động phân quyền dựa trên tài khoản.

- **Endpoint:** `POST /api/v1/auth/login`
- **Mục tiêu:** Cấp phát Access Token và Refresh Token.
- **Payload (Request Body):**
```json
{
  "username": "admin",
  "password": "password123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "d7a9b...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "uuid-1234",
      "username": "admin",
      "role": "ADMIN",
      "fullName": "Quản trị viên"
    }
  }
}
```

### 2.2. Đăng xuất (Logout)
- **Endpoint:** `POST /api/v1/auth/logout`
- **Mục tiêu:** Vô hiệu hóa Refresh Token hiện tại phía server (nếu có lưu DB/Redis) và xóa cookie.
- **Header:** `Authorization: Bearer <access_token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

### 2.3. Làm mới Token (Refresh Token)
Khi Access Token hết hạn, Frontend sử dụng Refresh Token (đã lưu ở LocalStorage/HttpOnly Cookie) để lấy Access Token mới mà không bắt người dùng đăng nhập lại.

- **Endpoint:** `POST /api/v1/auth/refresh`
- **Payload (Request Body):**
```json
{
  "refreshToken": "d7a9b..."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "new_refresh_token_...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

## 3. Hướng dẫn tích hợp cho Frontend (Axios Interceptor)
Frontend CẦN thiết lập Axios Interceptor để tự động hóa việc đính kèm Token và xử lý Refresh.

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1'
});

// Request Interceptor: Đính kèm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Tự động refresh token nếu gặp 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      // Gọi API refresh...
      // Cập nhật lại localStorage...
      // Thực hiện lại originalRequest
    }
    return Promise.reject(error);
  }
);
export default api;
```
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
