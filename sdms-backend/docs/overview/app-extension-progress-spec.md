# Đặc tả Kỹ thuật và Luồng Nghiệp vụ: Theo dõi Tiến độ Đơn Gia hạn lưu trú (Mobile App)

Tài liệu này cung cấp luồng nghiệp vụ và đặc tả API dành cho chức năng theo dõi tiến độ đơn gia hạn lưu trú trên nền tảng Mobile App (dành cho Cư dân hiện tại).

Khác với luồng Web Public (Tân sinh viên tra cứu bằng CCCD), luồng Mobile App yêu cầu sinh viên phải đăng nhập và sử dụng JWT Token để định danh.

---

## 1. Luồng nghiệp vụ (Business Flow)

**Bối cảnh:** Sau khi sinh viên (cư dân) nộp đơn xin gia hạn lưu trú KTX, họ cần một màn hình trên ứng dụng di động để theo dõi trạng thái đơn từ của mình.

**Các bước thực hiện:**
1. Sinh viên mở ứng dụng Mobile và đăng nhập thành công.
2. Sinh viên điều hướng vào màn hình **"Theo dõi đơn gia hạn"** (hoặc "Đơn của tôi").
3. Mobile App gửi một request kèm theo `Bearer Token` lên hệ thống Backend.
4. Backend trích xuất mã sinh viên (`studentCode`) từ Token, và tra cứu trong cơ sở dữ liệu xem sinh viên này đã có `StayExtension` (Đơn gia hạn) nào chưa.
5. **Kịch bản xử lý trả về:**
   - **Kịch bản 1 (Đã nộp đơn):** Backend trả về thông tin chi tiết đơn bao gồm Trạng thái (`PENDING`, `APPROVED`, `REJECTED`), Lý do từ chối (nếu có), và Link file PDF quyết định (nếu đã được duyệt).
   - **Kịch bản 2 (Chưa nộp đơn):** Backend trả về mã lỗi `404 Not Found` kèm thông báo "Bạn chưa nộp đơn gia hạn nào". App hiển thị màn hình rỗng hoặc gợi ý sinh viên nộp đơn.

---

## 2. Đặc tả API dành cho Frontend Mobile (API Contracts)

Để phục vụ cho luồng nghiệp vụ trên, một API mới đã được khởi tạo:

### API Lấy thông tin tiến độ đơn gia hạn của cá nhân

* **Endpoint:** `GET /api/v1/students/extensions/my-application`
* **Authorization:** `Bearer Token` (Bắt buộc)
* **Response Thành công (200 OK):**
  ```json
  {
    "success": true,
    "message": "Lấy thông tin đơn gia hạn thành công",
    "data": {
      "extensionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "studentCode": "20120001",
      "fullName": "Nguyễn Văn A",
      "reason": "Hoàn thành đồ án tốt nghiệp",
      "description": "Cần thêm thời gian làm lab...",
      "status": "PENDING", // Hoặc "APPROVED", "REJECTED"
      "currentBedId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "currentBedCode": "A101-1",
      "currentRoomCode": "A101",
      "pdfUrl": null // Sẽ có URL nếu trạng thái là APPROVED
    }
  }
  ```
* **Response Thất bại (404 Not Found) - Khi sinh viên chưa từng nộp đơn:**
  ```json
  {
    "success": false,
    "message": "Bạn chưa nộp đơn gia hạn nào",
    "data": null
  }
  ```

### Hướng dẫn hiển thị Giao diện trên App:
Dựa vào trường `status` trả về từ API, App có thể hiển thị Timeline/Trạng thái tương ứng:
- **`PENDING`:** Hiển thị thông báo "Đơn của bạn đang chờ Ban Quản lý KTX xét duyệt".
- **`APPROVED`:** Hiển thị "Chúc mừng! Đơn của bạn đã được duyệt" kèm theo nút **"Tải xuống PDF"** (sử dụng trường `pdfUrl`).
- **`REJECTED`:** Hiển thị "Đơn của bạn đã bị từ chối" và hiển thị lý do từ chối (nếu Backend có trả về trường `rejectReason`).
