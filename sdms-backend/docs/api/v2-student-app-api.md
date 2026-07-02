# API Specification v2: Student App

Tài liệu này đặc tả các API dành riêng cho ứng dụng di động (Student App) phục vụ tính năng Theo dõi lưu trú, Xin gia hạn và Xin trả phòng sớm.

---

## 1. Thông tin lưu trú hiện tại
**Mục đích:** Lấy thông tin giường phòng và tiến độ hợp đồng để hiển thị lên Dashboard.
**Method:** `GET /api/v1/student/room/current`
**Security:** Bearer Token (Role: `STUDENT`)

**Response:**
```json
{
  "success": true,
  "message": "Current room retrieved successfully",
  "data": {
    "assignmentId": "3fa85f64-...",
    "buildingCode": "A1",
    "floorNumber": 1,
    "roomCode": "A1-101",
    "bedCode": "A1-101-B1",
    "assignmentStatus": "OCCUPIED",
    "checkInAt": "2025-09-01T08:00:00",
    "expectedCheckOutAt": "2026-06-30T23:59:59"
  }
}
```
*Frontend Note:* Sử dụng `expectedCheckOutAt` để hiển thị đồng hồ đếm ngược số ngày lưu trú còn lại.

---

## 2. Quản lý Đơn Xin Gia Hạn

### 2.1. Nộp đơn xin gia hạn
**Method:** `POST /api/v1/students/extensions`
**Security:** Bearer Token (Role: `STUDENT`)
**Payload:**
```json
{
  "reason": "Tiếp tục học năm 3 tại trường",
  "description": "Kính mong BQL duyệt gia hạn cho em ở cùng phòng với các bạn cũ."
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "extensionId": "uuid-...",
    "status": "PENDING"
  }
}
```

### 2.2. Lấy thông tin đơn xin gia hạn của tôi
**Method:** `GET /api/v1/students/extensions/my-application`
**Security:** Bearer Token (Role: `STUDENT`)
**Response:**
```json
{
  "success": true,
  "data": {
    "status": "APPROVED", // PENDING, APPROVED, REJECTED
    "rejectReason": null,
    "pdfUrl": "https://storage.googleapis.com/.../extension_decision.pdf"
  }
}
```
*Lưu ý:* Khi `status` chuyển thành `APPROVED`, hệ thống sẽ tự động tạo một Hóa đơn tiền phòng mới. Frontend App chỉ cần sử dụng luồng thanh toán hóa đơn cũ để lấy danh sách hóa đơn và thanh toán bình thường.

---

## 3. Quản lý Đơn Xin Trả Phòng Sớm (Check-out)

### 3.1. Nộp đơn xin trả phòng
**Method:** `POST /api/v1/students/checkout-requests`
**Security:** Bearer Token (Role: `STUDENT`)
**Payload:**
```json
{
  "intendedCheckoutDate": "2026-05-15T08:00:00",
  "reason": "Chuyển ra ngoài thuê trọ cùng gia đình",
  "bankAccountNumber": "1903xxx",
  "bankName": "Techcombank"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "requestId": "uuid-...",
    "status": "PENDING"
  }
}
```

### 3.2. Lịch sử đơn xin trả phòng
**Method:** `GET /api/v1/students/checkout-requests`
**Security:** Bearer Token (Role: `STUDENT`)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "requestId": "uuid-...",
      "roomCode": "A1-101",
      "bedCode": "A1-101-B1",
      "intendedCheckoutDate": "2026-05-15T08:00:00",
      "status": "PENDING", 
      "rejectReason": null
    }
  ]
}
```
