# Đặc tả API cho Mobile App: Gia Hạn, Hóa Đơn & Thông Báo

Tài liệu này cung cấp các API cần thiết cho đội ngũ phát triển Mobile App để tích hợp các luồng nghiệp vụ mới sau khi cấu trúc Backend được nâng cấp.

---

## 1. Lấy thông tin phòng hiện tại & Tiến độ lưu trú
Sử dụng API hiện có của StudentRoom để lấy ra ngày bắt đầu và ngày kết thúc hợp đồng lưu trú (Dùng để vẽ Progress Bar / Đếm ngược ngày trả phòng).

**Endpoint:** `GET /api/v1/student/room/current`
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
    "expectedCheckOutAt": "2026-06-30T23:59:59" // <-- Sử dụng trường này để đếm ngược
  }
}
```
*Frontend Note:* Lấy `expectedCheckOutAt` trừ đi `Ngày hiện tại` để ra số ngày lưu trú còn lại. Nếu `< 15 ngày`, nên hiện màu đỏ để cảnh báo.

---

## 2. Xin gia hạn lưu trú
Khi sinh viên gần hết hạn ở, họ có thể vào App để xin gia hạn lưu trú.

**Endpoint:** `POST /api/v1/students/extensions`
**Security:** Bearer Token (Role: `STUDENT`)

**Payload (Body):**
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
  "message": "Đã nộp đơn gia hạn lưu trú thành công",
  "data": {
    "extensionId": "uuid-...",
    "status": "PENDING",
    "reason": "Tiếp tục học năm 3 tại trường"
  }
}
```

---

## 3. Xem tiến độ duyệt đơn gia hạn
**Endpoint:** `GET /api/v1/students/extensions/my-application`

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

---

## 4. Thanh toán phí gia hạn & Xem thông báo
Backend đã được lập trình **tự động hóa 100%**:
1. Ngay khi Ban Quản Lý (Admin) ấn **Duyệt Gia Hạn** trên Web, hệ thống sẽ tự động đẻ ra 1 hóa đơn tiền phòng (Mặc định 2.100.000 VNĐ).
2. Hệ thống cũng tự động đẩy 1 Notification In-App và 1 Email về cho sinh viên báo có hóa đơn mới.

**Giao diện App cần làm:**
- App **không cần code thêm tính năng thanh toán mới**. Hóa đơn gia hạn này sẽ tự động xuất hiện ở màn hình "Thanh Toán / Hóa Đơn" hiện tại (Sử dụng API `GET /api/v1/bills` cũ). Sinh viên chỉ việc bấm vào trả tiền như bình thường.
- App sử dụng API `GET /api/v1/notifications?userId=...` (hiện có) để lấy danh sách thông báo và hiển thị "Ting ting" cho sinh viên.

---

## 5. Đăng ký trả phòng sớm (Check-out)
Khi sinh viên có nhu cầu chuyển ra khỏi KTX trước khi hết hạn hợp đồng, họ có thể nộp đơn xin trả phòng để Ban Quản Lý (Admin) phê duyệt.

**Endpoint:** `POST /api/v1/students/checkout-requests`
**Security:** Bearer Token (Role: `STUDENT`)

**Payload (Body):**
```json
{
  "intendedCheckoutDate": "2026-05-15T08:00:00",
  "reason": "Chuyển ra ngoài thuê trọ cùng anh trai",
  "bankAccountNumber": "1903xxx",
  "bankName": "Techcombank"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Nộp đơn xin trả phòng thành công",
  "data": {
    "requestId": "uuid-...",
    "intendedCheckoutDate": "2026-05-15T08:00:00",
    "status": "PENDING"
  }
}
```

---

## 6. Xem danh sách đơn xin trả phòng
Dùng để hiển thị lịch sử / trạng thái đơn xin trả phòng của sinh viên.

**Endpoint:** `GET /api/v1/students/checkout-requests`
**Security:** Bearer Token (Role: `STUDENT`)

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn trả phòng thành công",
  "data": [
    {
      "requestId": "uuid-...",
      "roomCode": "A1-101",
      "bedCode": "A1-101-B1",
      "intendedCheckoutDate": "2026-05-15T08:00:00",
      "status": "PENDING", // Có thể là PENDING, APPROVED, REJECTED
      "rejectReason": null
    }
  ]
}
```
