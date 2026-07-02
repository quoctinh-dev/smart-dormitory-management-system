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
