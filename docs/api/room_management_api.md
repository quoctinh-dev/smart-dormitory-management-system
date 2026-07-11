# API CONTRACT CHO LUỒNG ROOM INTERACTIVE DASHBOARD

Tài liệu này xác định các endpoint API mà Frontend sẽ gọi để phục vụ cho các thao tác CRUD trực tiếp trên sơ đồ phòng.

## 1. API Cơ sở vật chất (Room & Bed)

### 1.1 Thêm Phòng mới
- **Endpoint:** `POST /api/v1/admin/rooms`
- **Body:**
```json
{
  "floorId": "uuid",
  "roomCode": "101A",
  "capacity": 8,
  "roomType": "STANDARD"
}
```

### 1.2 Cập nhật trạng thái Phòng (Khóa/Bảo trì)
- **Endpoint:** `PATCH /api/v1/admin/rooms/{roomId}/status`
- **Query Param:** `?status=MAINTENANCE` (hoặc `AVAILABLE`, `CLOSED`)

### 1.3 Thêm Giường mới
- **Endpoint:** `POST /api/v1/admin/beds`
- **Body:**
```json
{
  "roomId": "uuid",
  "bedCode": "A1",
  "note": "Giường tầng dưới"
}
```

### 1.4 Cập nhật trạng thái Giường
- **Endpoint:** `PATCH /api/v1/admin/beds/{bedId}/status`
- **Query Param:** `?status=MAINTENANCE` (hoặc `AVAILABLE`)

## 2. API Tích hợp xem chi tiết Sinh viên (Bed Drill-down)
Khi Admin bấm vào một Giường đang có người ở (`OCCUPIED`), hệ thống cần gọi API để lấy chi tiết hợp đồng lưu trú hiện tại.
- **Endpoint:** `GET /api/v1/admin/housing-assignments/active/bed/{bedId}`
- **Response:**
```json
{
  "success": true,
  "data": {
    "assignmentId": "uuid",
    "status": "ACTIVE",
    "student": {
      "studentId": "uuid",
      "fullName": "Nguyễn Văn A",
      "studentCode": "SV123",
      "avatarUrl": "..."
    },
    "startDate": "2026-01-01",
    "endDate": "2026-12-31"
  }
}
```
*(Ghi chú: Nếu Backend chưa có API này, Backend Developer cần tạo endpoint này dựa trên `StudentHousingAssignmentRepository.findByBed_BedIdAndStatus(...)`)*
