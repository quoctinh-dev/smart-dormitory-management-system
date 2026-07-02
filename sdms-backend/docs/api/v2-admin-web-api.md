# API Specification v2: Admin Web

Tài liệu này đặc tả các API dành riêng cho Web Admin phục vụ quy trình Phê duyệt Đơn Gia Hạn và Đơn Xin Trả Phòng của sinh viên.

---

## 1. Quản lý Đơn Gia Hạn Lưu Trú

### 1.1. Lấy danh sách Đơn gia hạn
**Mục đích:** Hiển thị trên Table quản lý để duyệt.
**Method:** `GET /api/v1/admin/extensions?page=0&size=10`
**Security:** Bearer Token (Role: `ADMIN`, `STAFF`)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "extensionId": "uuid-...",
        "studentCode": "20220001",
        "fullName": "Nguyễn Văn A",
        "currentRoomCode": "A1-101",
        "reason": "Tiếp tục học",
        "status": "PENDING",
        "pdfUrl": null
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 50
  }
}
```

### 1.2. Phê duyệt / Từ chối Đơn gia hạn
**Method:** `PUT /api/v1/admin/extensions/{extensionId}/status`
**Security:** Bearer Token (Role: `ADMIN`, `STAFF`)
**Payload:**
```json
{
  "status": "APPROVED", // Hoặc "REJECTED"
  "rejectReason": "" // Bắt buộc nếu REJECTED
}
```
**Response:**
```json
{
  "success": true,
  "message": "Đã duyệt đơn gia hạn thành công"
}
```
*Business Rule:* Nếu duyệt `APPROVED`, hệ thống tự động:
1. Đẩy `expectedCheckOutAt` của sinh viên lên kỳ tiếp theo.
2. Sinh file PDF Quyết định gia hạn trả về `pdfUrl`.
3. Sinh 1 Hóa Đơn 2.100.000đ gán vào tài khoản sinh viên.
4. Gắn Notification nhắc nhở thanh toán.

---

## 2. Quản lý Đơn Xin Trả Phòng (Check-out)

### 2.1. Lấy danh sách Đơn trả phòng
**Method:** `GET /api/v1/admin/checkout-requests?page=0&size=10&status=PENDING`
**Security:** Bearer Token (Role: `ADMIN`, `STAFF`)
**Query Params:** `status` (Tùy chọn: PENDING, APPROVED, REJECTED)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "requestId": "uuid-...",
        "studentCode": "20220001",
        "fullName": "Nguyễn Văn A",
        "roomCode": "A1-101",
        "bedCode": "A1-101-B1",
        "intendedCheckoutDate": "2026-05-15T08:00:00",
        "bankAccountNumber": "1903xxx",
        "bankName": "Techcombank",
        "status": "PENDING"
      }
    ]
  }
}
```

### 2.2. Phê duyệt / Từ chối Đơn trả phòng
**Method:** `POST /api/v1/admin/checkout-requests/{requestId}/review`
**Security:** Bearer Token (Role: `ADMIN`, `STAFF`)
**Payload:**
```json
{
  "status": "APPROVED", // Hoặc "REJECTED"
  "rejectReason": "Cần dọn dẹp phòng trước khi đi" // Bắt buộc nếu REJECTED
}
```
**Response:**
```json
{
  "success": true,
  "message": "Xét duyệt đơn trả phòng thành công"
}
```
*Business Rule:* Nếu duyệt `APPROVED`, hệ thống tự động tháo giường (`checkOut`) cho sinh viên, cập nhật trạng thái giường thành `AVAILABLE` để hệ thống sẵn sàng phân bổ cho người mới.
