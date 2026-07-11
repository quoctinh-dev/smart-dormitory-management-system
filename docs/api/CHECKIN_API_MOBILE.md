# API TÀI LIỆU QUẢN LÝ NHẬN PHÒNG (CHECK-IN API)

**Phạm vi áp dụng:** Dành riêng cho Mobile App Admin/Staff (`sdms-mobile-app`).
**Base URL:** `/api/v1/admin/check-in`
**Module Backend tương ứng:** `com.sdms.backend.modules.room.controller.CheckInController`

Tài liệu này hướng dẫn Agent B (Team Mobile) cách gọi API để thực hiện nghiệp vụ Check-in (Nhận phòng) bằng điện thoại di động thay cho Web.

---

## 1. YÊU CẦU UI/UX DÀNH CHO APP ADMIN (GỢI Ý)

Màn hình **Check-in Lễ tân** trên App cần được thiết kế ưu tiên tốc độ:
1.  **Nút Quét QR (Nhanh nhất):** Mở camera quét mã QR trên điện thoại/giấy tờ của sinh viên (Mã QR này chứa chuỗi CCCD).
2.  **Ô Nhập tay (Dự phòng):** Nhập số CCCD (9 hoặc 12 số) nếu sinh viên không có QR.
3.  Sau khi có CCCD -> Gọi API `searchStudent`.
4.  Hiển thị Card thông tin: Ảnh chân dung (rất to để bảo vệ nhìn mặt đối chiếu), Tên, Mã số, Tòa, Phòng, Giường.
5.  Nút to bự **"XÁC NHẬN NHẬN PHÒNG"** -> Gọi API `confirmCheckIn`.

---

## 2. CHI TIẾT API CONTRACT

### 2.1. Tra cứu thông tin sinh viên để Check-in
*   **Endpoint:** `GET /api/v1/admin/check-in/search`
*   **Query Params:** `?cccd=079200123456`
*   **Header yêu cầu:** `Authorization: Bearer <AccessToken>` (Phải có Role `ADMIN` hoặc `STAFF`).
*   **Response Thành công (200 OK):**
    ```json
    {
      "studentName": "Nguyễn Văn A",
      "studentCode": "SE123456",
      "cccd": "079200123456",
      "gender": "MALE",
      "portraitUrl": "/uploads/avatars/abc.jpg",
      "assignmentId": "550e8400-e29b-41d4-a716-446655440000",
      "buildingName": "Tòa A",
      "floorName": "Tầng 1",
      "roomName": "101",
      "bedName": "Giường 1"
    }
    ```
*   **Lỗi thường gặp (400/404):**
    *   Sinh viên chưa đóng tiền hoặc chưa được xếp phòng.
    *   CCCD không tồn tại.

### 2.2. Xác nhận nhận phòng (Confirm Check-in)
*   **Endpoint:** `POST /api/v1/admin/check-in/{assignmentId}`
*   **Path Variable:** `assignmentId` (Lấy từ API 2.1 trả về).
*   **Header yêu cầu:** `Authorization: Bearer <AccessToken>`
*   **Request Body:** Trống (Empty).
*   **Response Thành công (200 OK):**
    ```json
    {
      "message": "Thủ tục nhận phòng hoàn tất thành công."
    }
    ```
*   **Xử lý UI:** Sau khi nhận 200 OK, App hiển thị "Check-in thành công", tiếng "Bíp" và tự động quay lại màn hình Quét Camera để check-in người tiếp theo.
