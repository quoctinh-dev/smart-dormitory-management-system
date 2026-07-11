# TÀI LIỆU TÍCH HỢP AUTHENTICATION CHO MOBILE APP (STUDENT & ADMIN)

Tài liệu này đóng vai trò là "Bản lề" để team Mobile (hoặc Agent của team Mobile) có thể khởi tạo và ghép nối thành công Module Auth. Đặc biệt chú trọng vào việc **phân quyền rõ rệt giữa App Sinh viên và App Admin** cùng với **tối ưu hóa luồng Token**.

---

## 1. TRIGGER PROMPT DÀNH CHO AI AGENT CỦA TEAM MOBILE
*Copy nguyên đoạn Text dưới đây dán vào phiên làm việc của Agent bên team Mobile để nó tự động code đúng chuẩn:*

> **"Chào Agent, tôi cần bạn khởi tạo luồng Authentication cho Mobile App (áp dụng chung kiến trúc cho cả App Sinh viên và App Admin). Yêu cầu kỹ thuật bắt buộc:
> 1. Sử dụng thư viện lưu trữ bảo mật (Ví dụ: `react-native-keychain` hoặc `flutter_secure_storage`) để lưu trữ `accessToken` và `refreshToken`, tuyệt đối không dùng AsyncStorage/SharedPreferences thường.
> 2. Cấu hình HTTP Client (Axios/Dio) có chứa Interceptor. Khi nhận lỗi `401 Unauthorized`, Interceptor phải tự động đóng băng các request hiện tại, gọi API `/api/v1/auth/refresh-token` để lấy token mới, sau đó gắn token mới vào và tự động gọi lại các request bị lỗi (Seamless Refresh). Nếu Refresh Token cũng hết hạn (lỗi `REFRESH_TOKEN_REVOKED`), bắt buộc phải đá văng người dùng về trang Login.
> 3. Trong màn hình Login, phải bắt chính xác mã lỗi `ACCOUNT_LOCKED` từ Backend và hiển thị nội dung `error.response.data.message` ra màn hình (để hiển thị thông báo khóa tài khoản 15 phút do Brute-force).
> 4. Phân luồng Role: App Sinh Viên chỉ cho phép `ROLE_STUDENT` đăng nhập. App Admin chỉ cho phép `ROLE_ADMIN` hoặc `ROLE_STAFF` đăng nhập. Bạn hãy đọc tiếp tài liệu API bên dưới để code."**

---

## 2. QUY CHUẨN PHÂN QUYỀN (ROLE SEPARATION) TRÊN MOBILE

Do làm 2 App riêng biệt, việc chặn nhầm lẫn người dùng là bắt buộc. Khi người dùng gọi API Login thành công, Backend sẽ trả về `user` object có chứa trường `role`.
- **Logic kiểm tra ở App Student:**
  - Nếu `user.role == 'STUDENT'` => Cho phép lưu Token và vào màn hình Home.
  - Nếu `user.role != 'STUDENT'` => Cảnh báo *"Tài khoản này không phải của sinh viên"* và **xóa Token ngay lập tức**.
- **Logic kiểm tra ở App Admin:**
  - Nếu `user.role == 'ADMIN'` hoặc `user.role == 'STAFF'` => Cho phép lưu Token và vào Dashboard.
  - Nếu `user.role == 'STUDENT'` => Cảnh báo *"Sinh viên không có quyền truy cập App Quản lý"* và **xóa Token**.

---

## 3. TỐI ƯU HÓA LƯU TRỮ & QUẢN LÝ TOKEN (TOKEN OPTIMIZATION)

1. **Vấn đề bảo mật thiết bị di động:** Điện thoại rất dễ bị root/jailbreak, hacker có thể trích xuất token nếu lưu ở dạng plain-text.
   - Bắt buộc dùng Keychain (iOS) và Keystore (Android) để mã hóa Token.
2. **Luồng Refresh Token tự động (Silent Refresh):**
   - Access Token của backend chỉ có hạn **thời gian ngắn** (Vd: 30 phút). 
   - Mobile App không được bắt người dùng login lại sau 30 phút. Phải dùng `refreshToken` (hạn vài tháng) để tự động đổi token mới ở chế độ ngầm (Background/Interceptor).

---

## 4. ĐẶC TẢ API (API SPECIFICATION) MODULE AUTH

**Base URL:** `{{BASE_URL}}/api/v1/auth`

### 4.1. Đăng nhập (Login)
- **Endpoint:** `POST /login`
- **Body:**
  ```json
  {
    "usernameOrEmail": "string",
    "password": "string(min=6)"
  }
  ```
- **Responses:**
  - `200 OK`: 
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "eyJ...",
        "refreshToken": "eyJ..."
      }
    }
    ```
    *(Lưu ý: Gọi thêm API `GET /api/v1/users/me` để lấy thông tin Profile và Role).*
  - `400 Bad Request` (`errorCode: "INVALID_CREDENTIALS"`): Sai username hoặc password.
  - `400 Bad Request` (`errorCode: "ACCOUNT_LOCKED"`): Chú ý đọc trường `message` để biết tài khoản bị khóa 15 phút do Brute-force hay khóa vĩnh viễn.

### 4.2. Cấp lại Token (Refresh Token)
- **Endpoint:** `POST /refresh-token`
- **Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Responses:**
  - `200 OK`: Trả về cặp `accessToken` và `refreshToken` mới. (Cần đè vào Secure Storage).
  - `400 Bad Request` (`errorCode: "REFRESH_TOKEN_REVOKED"`): Refresh Token đã bị thu hồi hoặc hết hạn -> Bắt buộc Logout.

### 4.3. Kích hoạt tài khoản lần đầu (Dành cho Sinh viên)
- **Endpoint:** `POST /activate`
- **Body:**
  ```json
  {
    "email": "string(email)",
    "tempPassword": "string",
    "newPassword": "string(regex mạnh)"
  }
  ```

### 4.4. Đổi mật khẩu chủ động
- **Endpoint:** `POST /change-password`
- **Headers:** `Authorization: Bearer {accessToken}`
- **Body:**
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```

### 4.5. Đăng xuất
- **Endpoint:** `POST /logout`
- **Headers:** `Authorization: Bearer {accessToken}`
- **Quy trình Mobile:** Gọi API này để xóa Refresh Token trên Backend. Sau đó xóa sạch Secure Storage ở Client và chuyển hướng về màn hình Login.
