# Đặc tả Nghiệp vụ & API: Gia hạn, Thanh toán và Trả phòng (Student App)

Tài liệu này đặc tả các luồng nghiệp vụ mới cần bổ sung cho phía Mobile App của Sinh viên và các thay đổi tương ứng ở Backend, bao gồm: Thanh toán sau khi gia hạn, Theo dõi thời hạn lưu trú, và Xin trả phòng sớm (Check-out).

---

## 1. Luồng Sinh Hóa Đơn Sau Khi Gia Hạn (Backend & App)

### 1.1. Logic Backend (Cần bổ sung)
Hiện tại, khi Admin ấn "Duyệt gia hạn", hệ thống mới chỉ cập nhật `newExpectedCheckOutAt` và sinh PDF. Cần bổ sung logic:
- Phát ra sự kiện `ExtensionApprovedEvent`.
- `BillGenerationListener` sẽ lắng nghe sự kiện này và tự động tạo ra 1 `Bill` (Hóa đơn) mới với loại là `ACCOMMODATION_FEE` (Tiền phòng đợt mới).
- Hóa đơn này sẽ được gắn với `studentId` và `assignmentId` hiện tại của sinh viên, trạng thái là `UNPAID`.

### 1.2. Giao diện Mobile App (Thanh toán)
Vì App sinh viên **đã có sẵn** chức năng thanh toán hóa đơn (đọc từ bảng `bills`), nên khi Backend sinh ra hóa đơn mới, hóa đơn này sẽ tự động xuất hiện trong màn hình **"Hóa đơn của tôi"** trên App.
*   **Hành động của Frontend App:** Không cần code thêm tính năng thanh toán mới. Chỉ cần đảm bảo màn hình danh sách Hóa đơn có thể hiển thị thêm mô tả: *"Thanh toán phí lưu trú gia hạn năm học 2026-2027"*.

---

## 2. Tính năng: Màn hình "Thông tin lưu trú hiện tại" (Student App)

Sinh viên cần một màn hình Dashboard (hoặc tab "Chỗ ở của tôi") để theo dõi thời hạn hợp đồng.

### 2.1. Thiết kế Giao diện (UI/UX)
*   **Hiển thị thông tin phòng:** Tòa nhà, Số phòng, Số giường đang ở.
*   **Tiến độ lưu trú (Progress Bar):** 
    - Ngày bắt đầu (`checkInAt`).
    - Ngày hết hạn hợp đồng (`expectedCheckOutAt`).
    - Số ngày còn lại (Tính bằng khoảng cách từ ngày hiện tại tới `expectedCheckOutAt`).
*   Nếu `expectedCheckOutAt` sắp đến hạn (ví dụ còn < 15 ngày), hiển thị cảnh báo màu đỏ/cam yêu cầu sinh viên gia hạn hoặc chuẩn bị dọn đồ.

### 2.2. API Dành cho tính năng này
**GET** `/api/v1/students/me/housing-assignment`
*   **Response:**
```json
{
  "assignmentId": "uuid-...",
  "roomCode": "A1-101",
  "bedCode": "A1-101-B1",
  "status": "OCCUPIED",
  "checkInAt": "2025-09-01T08:00:00",
  "expectedCheckOutAt": "2026-06-30T23:59:59",
  "daysRemaining": 45 
}
```

---

## 3. Tính năng: Xin trả phòng sớm / Check-out (Student App)

Không phải sinh viên nào cũng ở đến hết năm. Sẽ có trường hợp muốn chuyển trọ ra ngoài sớm, hoặc ra trường sớm.

### 3.1. Thiết kế Giao diện (UI/UX)
Trên màn hình "Thông tin lưu trú", bổ sung nút **"Đăng ký trả phòng (Check-out)"**.
*   Khi bấm vào, hiện Form điền:
    - Ngày mong muốn dọn đi (Phải lớn hơn ngày hiện tại).
    - Lý do trả phòng (Ra trường, Chuyển trọ, Lý do cá nhân...).
    - Thông tin STK Ngân hàng (Để KTX hoàn trả lại tiền cọc tài sản ban đầu nếu có).
*   **Quy định:** Trả phòng trước hạn có thể sẽ không được hoàn tiền phòng các tháng chưa ở (tùy nội quy KTX), Frontend cần hiện 1 Popup cảnh báo trước khi bấm Submit.

### 3.2. API Dành cho tính năng này
**POST** `/api/v1/students/me/checkout-requests`
*   **Payload (App gửi lên):**
```json
{
  "intendedCheckoutDate": "2026-05-15T08:00:00",
  "reason": "Chuyển ra trọ cùng anh trai",
  "bankAccountNumber": "1903xxx",
  "bankName": "Techcombank"
}
```

### 3.3. Luồng duyệt của Admin (Web Admin)
1. Yêu cầu này sẽ bay về một màn hình mới trên Web Admin: **"Quản lý Đơn trả phòng"**.
2. Ban Quản lý sẽ cử người xuống phòng kiểm tra tài sản (có làm hỏng giường, tủ, quạt không).
3. Nếu tài sản bình thường, Admin lên Web ấn **"Duyệt Check-out"**.
4. Hệ thống Backend lúc này sẽ gọi hàm `HousingAssignmentService.checkOut(...)` mà chúng ta đã thấy trong code để chính thức giải phóng giường, cập nhật ngày `checkOutAt` thực tế, và cho phép sinh viên rời đi.
