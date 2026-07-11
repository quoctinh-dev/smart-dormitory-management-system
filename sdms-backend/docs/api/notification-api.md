# Notification API Specification

Tài liệu đặc tả các API thuộc Module Notification (Thông báo In-App). Các API này hỗ trợ lấy danh sách và cập nhật trạng thái đã đọc của thông báo.

---

## 1. Lấy danh sách thông báo
- **Endpoint**: `/api/v1/notifications`
- **Method**: `GET`
- **Query Params**:
  - `userId` (UUID): Bắt buộc. ID của người dùng.
- **Authorization**: Bearer Token
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "historyId": "uuid-1234",
      "type": "PAYMENT",
      "title": "Thanh toán thành công",
      "content": "Hóa đơn tháng 9 của bạn đã được thanh toán.",
      "isRead": false,
      "createdAt": "2026-07-07T10:00:00"
    }
  ]
}
```

## 2. Lấy số lượng thông báo chưa đọc
- **Endpoint**: `/api/v1/notifications/unread-count`
- **Method**: `GET`
- **Query Params**:
  - `userId` (UUID): Bắt buộc.
- **Authorization**: Bearer Token
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

## 3. Đánh dấu 1 thông báo là đã đọc
- **Endpoint**: `/api/v1/notifications/{id}/read`
- **Method**: `PATCH`
- **Path Variables**:
  - `id` (UUID): Bắt buộc. ID của lịch sử thông báo (`historyId`).
- **Authorization**: Bearer Token
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Đã đánh dấu đọc thành công",
  "data": null
}
```

## 4. Đánh dấu tất cả là đã đọc
- **Endpoint**: `/api/v1/notifications/read-all`
- **Method**: `PATCH`
- **Query Params**:
  - `userId` (UUID): Bắt buộc.
- **Authorization**: Bearer Token
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Đã đánh dấu đọc toàn bộ thông báo",
  "data": null
}
```
