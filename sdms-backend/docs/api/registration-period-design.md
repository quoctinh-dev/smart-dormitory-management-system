# Đặc tả Luồng Đợt Đăng Ký Nội Trú (Registration Period)

Module này chịu trách nhiệm quản lý cấu hình các đợt mở đăng ký Ký túc xá theo từng học kỳ/năm học. Nó quyết định xem sinh viên có được phép nộp đơn hay không.

## 1. Phân hệ Web Admin (Quản trị viên)

Admin có quyền cấu hình các đợt mở đăng ký, giới hạn đối tượng tham gia.

### 1.1. Tạo đợt đăng ký mới
- **Endpoint:** `POST /api/v1/admin/registration-periods`
- **Mục tiêu:** Tạo cấu hình đợt đăng ký (Ví dụ: Đợt 1 dành cho Tân Sinh Viên năm 2024).
- **Payload (Request Body):**
```json
{
  "periodName": "Đợt 1 - Học kỳ 1 Năm 2024-2025",
  "startDate": "2024-08-01T00:00:00",
  "endDate": "2024-08-15T23:59:59",
  "registrationType": "PRIORITY_ONLY", 
  "description": "Ưu tiên cho tân sinh viên K24 và diện chính sách"
}
```
*(Ghi chú: `registrationType` có thể là `OPEN_REGISTRATION` (tự do) hoặc `PRIORITY_ONLY` (cần nằm trong whitelist)).*

- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "periodId": "uuid-period",
    "periodName": "Đợt 1 - Học kỳ 1 Năm 2024-2025",
    "isActive": true
  }
}
```

### 1.2. Đóng/Mở đợt đăng ký khẩn cấp (Toggle Status)
- **Endpoint:** `PATCH /api/v1/admin/registration-periods/{periodId}/toggle`
- **Mục tiêu:** Tắt ngang đợt đăng ký nếu KTX bất ngờ hết chỗ.

## 2. Phân hệ App Student / Public (Sinh viên)

Trang chủ của App Sinh Viên (cả khi chưa đăng nhập) cần kiểm tra đợt đăng ký hiện hành để hiển thị nút "Đăng ký ngay". Nếu sinh viên đã có tài khoản (vd K24), API sẽ kiểm tra thêm tính hợp lệ (Eligibility).

### 2.1. Kiểm tra điều kiện đăng ký hiện tại (Check Eligibility)
API này kiểm tra xem hôm nay có đợt đăng ký nào mở không, và (tùy chọn) truyền CCCD để xem sinh viên có nằm trong whitelist của đợt đó không.

- **Endpoint:** `POST /api/v1/registration/check-eligibility`
- **Payload (Request Body):**
*(Gửi trống `{}` nếu chỉ muốn xem có đợt nào đang mở không. Hoặc gửi CCCD nếu muốn kiểm tra chính xác tính hợp lệ).*
```json
{
  "cccd": "079200001234" 
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "periodId": "uuid-period",
    "periodName": "Đợt 1 - Học kỳ 1 Năm 2024-2025",
    "registrationType": "PRIORITY_ONLY",
    "target": "FRESHMAN",
    "message": "Bạn đủ điều kiện tham gia đợt đăng ký này."
  }
}
```
