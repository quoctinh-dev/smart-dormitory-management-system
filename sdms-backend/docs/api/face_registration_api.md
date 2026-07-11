# API TÍCH HỢP ĐĂNG KÝ KHUÔN MẶT (MOBILE APP)

Tài liệu này cung cấp các giao thức giao tiếp giữa ứng dụng Mobile (Sinh viên) và Hệ thống Backend (Spring Boot) phục vụ cho quy trình đăng ký, kiểm duyệt và cập nhật khuôn mặt vào hệ thống Smart Access AI.

> **Lưu ý chung:** Tất cả các API dưới đây đều yêu cầu xác thực bằng Token JWT hợp lệ, hoặc truyền Header `X-Student-Id: <UUID_của_sinh_viên>`.

---

## 1. Lấy thông tin & Trạng thái khuôn mặt hiện tại
API này dùng để Mobile App tự động kiểm tra xem sinh viên đã có khuôn mặt chưa, đang ở trạng thái nào để vẽ giao diện (UI) tương ứng (Ví dụ: Hiển thị giao diện chờ duyệt, hoặc hiển thị nút chụp lại khi bị từ chối).

**Endpoint:** `GET /api/v1/students/me/face`

### Response (Thành công - 200 OK):
```json
{
  "profileId": "b535f4ce-31aa-4cde-928f-cb6facd044a6",
  "studentId": "91b2145f-69cb-44c2-a37c-0aa7ba03b285",
  "faceImageUrl": "https://res.cloudinary.com/dpds3gjbj/image/upload/v1783389864/sdms/faces/vh7x80hwkpf1c7vg7cjh.jpg",
  "status": "PENDING",
  "rejectionReason": null,
  "createdAt": "2026-07-07T09:04:24.787",
  "updatedAt": "2026-07-07T09:04:24.787"
}
```

### Ý nghĩa các Trạng thái (`status`):
*   `PENDING`: Ảnh vừa được tải lên, đang chờ Admin duyệt.
*   `APPROVED`: Ảnh hợp lệ, AI đã ghi nhận và đang dùng để mở cửa.
*   `REJECTED`: Ảnh bị từ chối do không đạt chuẩn. Sinh viên cần đọc lý do ở trường `rejectionReason`.
*   `REVOKED`: Hồ sơ khuôn mặt đã bị thu hồi quyền vĩnh viễn.

### Response (Chưa từng đăng ký - 404 Not Found):
```json
{
   "success": false,
   "message": "No face profile found for student: ..."
}
```

---

## 2. Tải ảnh lên Đăng ký / Cập nhật ảnh lỗi (Overwrite)
API này được sử dụng khi:
1. Sinh viên lần đầu đăng ký khuôn mặt (Lỗi 404 ở trên).
2. Khi ảnh bị `REJECTED`, sinh viên cần chụp tấm khác để nộp lại.
3. Khi ảnh đang `PENDING` nhưng sinh viên đổi ý muốn chụp tấm khác rõ nét hơn up đè lên (Hệ thống sẽ tự thay thế ảnh chờ duyệt cũ).

**Endpoint:** `POST /api/v1/students/me/face`
**Content-Type:** `multipart/form-data`

### Payload (Body):
*   **Key:** `file`
*   **Value:** `[File ảnh .jpg / .png lấy từ Camera điện thoại / Upload từ máy]`

*(Lưu ý cho Dev App: Các bạn KHÔNG cần tự gọi API up ảnh lên Cloudinary. Chỉ cần đẩy file ảnh thô (MultipartFile) vào API này, Backend Spring Boot sẽ tự động xử lý upload lên Cloudinary và lưu vào Database).*

### Response (Thành công - 200 OK hoặc 201 Created):
```json
{
  "success": true,
  "message": "Face registered successfully and pending approval",
  "data": "b535f4ce-31aa-4cde-928f-cb6facd044a6" // Trả về Profile ID
}
```

### Response (Lỗi Logic - 400 Bad Request):
Sẽ xảy ra nếu sinh viên đang có ảnh ở trạng thái `APPROVED` (Đã duyệt thành công) mà lại gọi API đăng ký đè lên.
```json
{
   "success": false,
   "message": "Student already has an active face profile. Please use replacement request instead."
}
```

---

## 3. Yêu cầu Đổi ảnh (Dành cho ảnh đã được APPROVED)
Nếu ảnh đã ở trạng thái `APPROVED` (Hợp lệ) nhưng sinh viên muốn đổi ảnh khác, phải gọi API này thay vì API Đăng ký.

**Endpoint:** `POST /api/v1/students/me/face/replacements`
**Content-Type:** `multipart/form-data`

### Payload (Body):
*   **Key:** `file`
*   **Value:** `[File ảnh .jpg / .png lấy từ Camera điện thoại]`

### Response (Thành công - 200 OK):
```json
{
  "success": true,
  "message": "Replacement requested successfully"
}
```

---

## 4. Quy chuẩn UX/UI cho Mobile App (Khuyến nghị)
Để hệ thống vận hành mượt mà và tránh sinh viên mơ hồ:
*   Nếu `status === PENDING`: Hiển thị "Đang chờ Ban Quản Lý duyệt". Kèm nút **"Chụp lại ảnh khác"** (gọi lại API Đăng ký số 2).
*   Nếu `status === REJECTED`: Phải in đậm đỏ dòng chữ lý do lấy từ trường `rejectionReason`. Kèm nút **"Chụp lại ảnh chuẩn"**.
*   Nếu `status === APPROVED`: Hiển thị "Đã kích hoạt Smart Access". Nếu sinh viên muốn đổi ảnh, hiển thị nút **"Yêu cầu Đổi ảnh"** (gọi API Yêu cầu Đổi ảnh số 3). 
