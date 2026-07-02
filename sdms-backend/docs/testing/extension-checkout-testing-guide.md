# Hướng Dẫn Test Tính Năng Gia Hạn & Trả Phòng (E2E)

Tài liệu này hướng dẫn cách kiểm thử toàn bộ luồng chức năng Gia hạn lưu trú và Xin trả phòng sớm (Check-out) từ góc độ Sinh viên (Student App) đến Admin KTX (Web Admin), bao gồm cả các tác vụ tự động chạy ngầm.

---

## PHẦN 1: CHUẨN BỊ MÔI TRƯỜNG

1. Đăng nhập vào 2 tài khoản riêng biệt để test song song:
   - **Tài khoản Sinh viên (Student):** Phải là sinh viên đang có phòng (Status của Assignment là `OCCUPIED`).
   - **Tài khoản Admin (Staff/Admin):** Dùng để duyệt đơn.
2. Dùng công cụ gọi API (Postman / Swagger) gắn Bearer Token của từng tài khoản, hoặc test trực tiếp trên UI (Web/App) nếu đã code xong giao diện.

---

## PHẦN 2: TEST LUỒNG GIA HẠN LƯU TRÚ & TỰ ĐỘNG HÓA

### Bước 1: Sinh viên nộp đơn xin gia hạn (Student)
*   **API:** `POST /api/v1/students/extensions`
*   **Payload:**
    ```json
    {
      "reason": "Tiếp tục học năm 3 tại trường",
      "description": "Xin ở lại phòng cũ"
    }
    ```
*   **Kỳ vọng (Expected):** HTTP 201 Created. Báo nộp đơn thành công.

### Bước 2: Admin kiểm tra danh sách đơn (Admin)
*   **API:** `GET /api/v1/admin/extensions`
*   **Kỳ vọng:** Trả về danh sách đơn, trong đó đơn vừa nộp có `status` là `PENDING`.

### Bước 3: Admin Phê duyệt đơn gia hạn (Admin)
*   **API:** `PUT /api/v1/admin/extensions/{extensionId}/status` (Lấy ID từ Bước 2)
*   **Payload:**
    ```json
    {
      "status": "APPROVED",
      "rejectReason": ""
    }
    ```
*   **Kỳ vọng:** HTTP 200 OK. Hệ thống thực hiện hàng loạt logic ngầm.

### Bước 4: Kiểm tra tính năng Tự động hóa ở Backend (Cực kỳ quan trọng)
Sau Bước 3, dùng tài khoản **Sinh viên** kiểm tra các hệ quả tự động:
1. **Kiểm tra Tiến độ lưu trú:**
   - **API:** `GET /api/v1/student/room/current`
   - **Kỳ vọng:** Giá trị `expectedCheckOutAt` đã được kéo dài ra năm sau.
2. **Kiểm tra Hóa đơn tự động:**
   - **API:** `GET /api/v1/bills` (API cũ)
   - **Kỳ vọng:** Xuất hiện 1 Hóa đơn mới loại `ACCOMMODATION_FEE` với số tiền `2100000`, trạng thái `UNPAID`.
3. **Kiểm tra Thông báo In-App:**
   - **API:** `GET /api/v1/notifications` (kèm userId)
   - **Kỳ vọng:** Có 1 thông báo mới: *"Quyết định gia hạn của bạn đã được phê duyệt. Hệ thống đã tạo một hóa đơn..."*.
4. **Kiểm tra File Quyết Định (PDF):**
   - **API:** `GET /api/v1/students/extensions/my-application`
   - **Kỳ vọng:** Trả về URL PDF hợp lệ (Click vào xem được file Quyết định gia hạn có tên sinh viên).

---

## PHẦN 3: TEST LUỒNG XIN TRẢ PHÒNG SỚM (CHECK-OUT)

### Bước 1: Sinh viên nộp đơn xin Check-out (Student)
*   **API:** `POST /api/v1/students/checkout-requests`
*   **Payload:**
    ```json
    {
      "intendedCheckoutDate": "2026-05-15T08:00:00",
      "reason": "Chuyển ra ngoài thuê trọ",
      "bankAccountNumber": "1903xxx",
      "bankName": "Techcombank"
    }
    ```
*   **Kỳ vọng:** HTTP 201 Created. Nếu nộp 2 đơn liên tiếp khi đơn cũ chưa duyệt sẽ bị lỗi báo `Bad Request`.

### Bước 2: Sinh viên kiểm tra danh sách đơn của mình (Student)
*   **API:** `GET /api/v1/students/checkout-requests`
*   **Kỳ vọng:** Trả về mảng danh sách, đơn mới nhất ở đầu với status `PENDING`.

### Bước 3: Admin xét duyệt "Từ chối" trước (Admin)
*   **API:** `POST /api/v1/admin/checkout-requests/{requestId}/review`
*   **Payload:**
    ```json
    {
      "status": "REJECTED",
      "rejectReason": "Phòng bẩn, yêu cầu dọn dẹp và đền bù hư hỏng"
    }
    ```
*   **Kỳ vọng:** HTTP 200 OK. Đơn bị đổi thành `REJECTED` (Sinh viên gọi lại API Bước 2 sẽ thấy lý do từ chối).

### Bước 4: Admin xét duyệt "Đồng ý" Check-out (Admin)
*   *(Ghi chú: Sinh viên cần tạo lại 1 đơn Check-out khác để làm Bước này).*
*   **API:** `POST /api/v1/admin/checkout-requests/{requestId}/review`
*   **Payload:**
    ```json
    {
      "status": "APPROVED",
      "rejectReason": ""
    }
    ```
*   **Kỳ vọng Hệ thống xử lý ngầm (Cực kỳ quan trọng):**
    1. Đơn chuyển thành `APPROVED`.
    2. Hàm `checkOut` trong Backend tự động kích hoạt:
       - Cột `checkOutAt` (ngày dọn đi thực tế) trong bảng `student_housing_assignments` được update thành Giờ hiện tại.
       - Cột `status` của Assignment chuyển từ `OCCUPIED` thành `CHECKED_OUT`.
       - Giường của sinh viên (bảng `beds`) chuyển trạng thái từ `OCCUPIED` về lại `AVAILABLE` để đón sinh viên mới.
    3. Bạn có thể test bằng cách cho sinh viên gọi lại `GET /api/v1/student/room/current`, hệ thống sẽ văng lỗi `Bạn hiện không lưu trú tại Ký túc xá` (Chứng tỏ đã bị đuổi khỏi giường thành công).
