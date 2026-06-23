# API INTEGRATION GUIDE - STUDENT MOBILE APP
**Dự án:** Smart Dormitory Management System (SDMS)
**Module:** Student App (Mobile)
**Mục tiêu:** Cung cấp tài liệu tích hợp API cho đội ngũ Mobile (Flutter/React Native).

---

## 1. MÔI TRƯỜNG & BẢO MẬT
- **Base URL:** `http://localhost:8082/api/v1`
- **Authentication:** JWT (Bearer Token)
- **Quy trình tối ưu (Business Flow):**
  1. Trường Đại học chủ động nhập danh sách Sinh Viên (tạo tài khoản sẵn trạng thái `PENDING_ACTIVATION`).
  2. Sinh viên tải App -> Nhập Email trường + Số CCCD (làm mật khẩu tạm).
  3. Kích hoạt tài khoản -> Đổi mật khẩu mới an toàn -> Hệ thống trả về `AccessToken` và `RefreshToken`.
  4. Ứng dụng lưu Token vào Secure Storage (iOS Keychain / Android Keystore).
  5. Ứng dụng tích hợp Sinh trắc học (Vân tay/FaceID) của thiết bị để đăng nhập nhanh các lần sau (sử dụng Refresh Token xoay vòng ngầm).

---

## 2. API TÀI KHOẢN & XÁC THỰC (AUTH MODULE)

### 2.1 Kích hoạt tài khoản (Lần đầu truy cập)
- **Endpoint:** `POST /auth/activate`
- **Quyền:** Public
- **Request Body:**
```json
{
  "email": "20110000@student.hcmute.edu.vn",
  "tempPassword": "079200001234", // Số CCCD
  "newPassword": "Password@123" // Yêu cầu bảo mật: Hoa, thường, số, ký tự đặc biệt
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Tài khoản đã được kích hoạt thành công",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "def456..."
  }
}
```

### 2.2 Đăng nhập (Các lần sau)
- **Endpoint:** `POST /auth/login`
- **Quyền:** Public
- **Request Body:**
```json
{
  "usernameOrEmail": "20110000@student.hcmute.edu.vn",
  "password": "Password@123"
}
```

### 2.3 Cấp mới Token (Refresh Token)
- **Endpoint:** `POST /auth/refresh-token`
- **Cơ chế:** Khi gọi API bất kỳ bị lỗi `401 Unauthorized`, App tự động gọi ngầm API này bằng `refreshToken` cũ. Nếu thành công, lưu token mới và gọi lại API bị lỗi.

---

## 3. API THÔNG TIN CÁ NHÂN (STUDENT MODULE)

### 3.1 Lấy thông tin cá nhân của bản thân
- **Endpoint:** `GET /users/me`
- **Header:** `Authorization: Bearer {accessToken}`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountId": "uuid",
    "username": "20110000",
    "email": "20110000@student.hcmute.edu.vn",
    "role": "STUDENT",
    "studentProfile": {
      "studentId": "uuid",
      "fullName": "Nguyễn Văn A",
      "studentCode": "20110000",
      "dob": "2002-01-01",
      "gender": "MALE",
      "cccd": "079200001234",
      "phone": "0901234567",
      "roomCode": "A101",
      "bedCode": "A101-01",
      "faceImageUrl": "https://s3..." // Dùng cho Face ID Ra vào KTX
    }
  }
}
```

### 3.2 Đăng ký khuôn mặt (Face Recognition)
- **Endpoint:** `POST /students/me/face` (Hoặc theo Face API)
- **Mô tả:** Mobile App mở Camera, chụp ảnh khuôn mặt sinh viên và upload lên để sử dụng cho hệ thống Cửa thông minh (Smart Access IoT).

---

## 4. API ĐĂNG KÝ KÝ TÚC XÁ (APPLICATION MODULE)

*Sinh viên bắt buộc phải đăng nhập (có Access Token) mới được phép tạo đơn.*

### 4.1 Lấy danh sách đợt đăng ký đang mở
- **Endpoint:** `GET /registrations/active` (hoặc tương tự)
- **Mô tả:** Lấy `periodId` để sinh viên chọn đợt đăng ký nội trú.

### 4.2 Tạo đơn đăng ký nháp (Draft)
- **Endpoint:** `POST /applications`
- **Header:** `Authorization: Bearer {accessToken}`
- **Request Body:**
```json
{
  "periodId": "uuid-cua-dot-dang-ky",
  "fullName": "Nguyễn Văn A",
  "dob": "2002-01-01",
  "gender": "MALE",
  "cccd": "079200001234",
  "email": "20110000@student.hcmute.edu.vn",
  "phone": "0901234567",
  "priorityCategories": ["POOR_HOUSEHOLD", "ETHNIC_MINORITY"] // Nạp danh sách ưu tiên
}
```
- **Response:** Trả về `applicationId`.

### 4.3 Tải lên tài liệu minh chứng
- **Endpoint:** `POST /applications/{applicationId}/documents`
- **Mô tả:** Với mỗi diện ưu tiên (POOR_HOUSEHOLD), Mobile App bắt sinh viên chụp ảnh giấy chứng nhận. Gọi API này để đẩy URL ảnh lên.
- **Params:** `type=PRIORITY_PAPER`, `fileUrl=https://...`

### 4.4 Nộp đơn chính thức
- **Endpoint:** `POST /applications/{applicationId}/submit`
- **Mô tả:** Chốt sổ, chuyển trạng thái đơn sang `PENDING` (chờ Ban Quản Lý KTX duyệt trên Web Admin). Sau bước này App không cho sửa đơn nữa.

---

## 5. TỐI ƯU TRẢI NGHIỆM MOBILE (MOBILE UX OPTIMIZATIONS)
1. **Offline Caching:** Profile của sinh viên (`GET /users/me`) nên được cache lại trong SQLite/Room Database để App load tức thì khi mở, không cần đợi API.
2. **Push Notification:** Khi Ban quản lý KTX thao tác Duyệt đơn (Approve) hoặc Từ chối (Reject), Backend sẽ bắn Notification Firebase (FCM). Mobile App cần listen để đẩy thông báo realtime.
3. **Skeleton Loading:** Khi fetch dữ liệu đợt đăng ký hoặc lịch sử hóa đơn, dùng Skeleton UI (khung xám nhấp nháy) thay vì xoay vòng vòng Loading Spinner.
