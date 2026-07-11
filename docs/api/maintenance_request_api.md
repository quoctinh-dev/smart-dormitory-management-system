# TÀI LIỆU API: BÁO HỎNG CƠ SỞ VẬT CHẤT (MAINTENANCE REQUEST)
**Dành cho:** Mobile App Agent / Team Frontend
**Module:** `sdms-backend` -> `maintenance_request`
**Base URL:** `/api/v1/student/maintenance-requests`

Tất cả các API đều tuân thủ chuẩn "Envelope Pattern" bắt buộc của hệ thống:
```json
{
  "success": true,
  "message": "Thông báo",
  "data": { ... },
  "errorCode": null
}
```

---

## 1. Gửi yêu cầu báo hỏng (Create Maintenance Request)
- **Endpoint:** `POST /api/v1/student/maintenance-requests`
- **Auth:** Require `Bearer Token` (Role: STUDENT)
- **Mô tả:** Sinh viên gửi báo cáo hư hỏng tài sản trong phòng của mình. Tạm thời sử dụng JSON thường (chưa đính kèm ảnh File) để dễ demo, ảnh gửi lên dạng chuỗi Base64 hoặc URL nếu có.

### Request Body (JSON)
```json
{
  "issueType": "ELECTRICITY", 
  "description": "Bóng đèn nhà vệ sinh bị cháy",
  "imageUrl": "https://example.com/image.jpg" // optional
}
```
**Danh sách IssueType được hỗ trợ:**
`ELECTRICITY` (Điện), `PLUMBING` (Nước/Ống nước), `FURNITURE` (Nội thất/Giường/Tủ), `OTHER` (Khác).

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Đã gửi yêu cầu báo hỏng thành công",
  "data": {
    "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "PENDING",
    "createdAt": "2026-07-10T15:00:00Z"
  },
  "errorCode": null
}
```

---

## 2. Lấy danh sách yêu cầu báo hỏng của tôi (Get My Requests)
- **Endpoint:** `GET /api/v1/student/maintenance-requests`
- **Auth:** Require `Bearer Token` (Role: STUDENT)

### Lọc & Phân trang (Query Params)
- `page`: Số trang (0-indexed, default: 0)
- `size`: Kích thước (default: 20)
- `status`: Lọc theo trạng thái (tùy chọn). Ví dụ: `?status=PENDING`

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "content": [
      {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "issueType": "ELECTRICITY",
        "description": "Bóng đèn nhà vệ sinh bị cháy",
        "imageUrl": null,
        "status": "PENDING",
        "adminNote": null,
        "createdAt": "2026-07-10T15:00:00Z",
        "updatedAt": "2026-07-10T15:00:00Z"
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  },
  "errorCode": null
}
```
**Danh sách Status:**
- `PENDING`: Đang chờ xử lý
- `IN_PROGRESS`: Đang tiến hành sửa chữa
- `RESOLVED`: Đã khắc phục xong
- `REJECTED`: Bị từ chối (Lý do sẽ nằm trong `adminNote`)

---

## LƯU Ý KHI CODE TẦNG UI (CHO APP AGENT)
1. Hãy chuẩn bị ViewModel hoặc Controller để hứng DTO trả về như trên.
2. Form điền báo hỏng cần có Dropdown chọn `issueType` tương ứng với Enum Backend.
3. Các màn hình Loading phải được quản lý chặt chẽ theo `try-catch-finally` như đã thống nhất trong Issue Loading trước đó.
4. Hiện tại tài liệu này là bản Draft Design (Thiết kế), bạn hãy code giao diện trước, sau đó Backend Agent sẽ xây dựng API thực tế khớp 100% với tài liệu này.
