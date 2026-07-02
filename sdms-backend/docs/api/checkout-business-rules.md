# Tài Liệu Đặc Tả Nghiệp Vụ & UX: Chức năng Trả Phòng (Check-out Edge Cases)

Tài liệu này đặc tả các quy tắc nghiệp vụ (Business Rules) phức tạp vừa được bổ sung vào Backend đối với luồng Xin trả phòng KTX, đồng thời vạch ra yêu cầu bắt buộc về UI/UX dành cho team phát triển ứng dụng (Mobile App & Web Admin).

---

## 1. Các Quy Tắc Nghiệp Vụ Mới Bổ Sung (Backend Logic)

Nhằm đảm bảo an ninh KTX và quản lý tài chính chặt chẽ, khi sinh viên thao tác "Nộp đơn trả phòng" và Admin thao tác "Duyệt đơn", hệ thống sẽ ngầm thực thi các lớp bảo vệ sau:

### 1.1. Chặn Nợ Xấu (Debt Prevention)
*   **Logic:** Sinh viên không thể nộp đơn xin Check-out nếu vẫn còn dư nợ phí lưu trú, tiền điện, tiền nước chưa thanh toán (`status = UNPAID` hoặc `OVERDUE`).
*   **Thời điểm chặn:** Ngay khi nộp đơn (`POST /api/v1/students/checkout-requests`).
*   **Mã lỗi trả về:** `400 Bad Request` kèm message: *"Bạn đang có hóa đơn tiền phòng hoặc điện nước chưa thanh toán. Vui lòng thanh toán toàn bộ nợ trước khi xin trả phòng."*

### 1.2. Chặn Spam Đơn (Duplicate Request Protection)
*   **Logic:** Không cho phép sinh viên nộp 2 đơn Trả phòng cùng lúc nếu đơn cũ vẫn chưa được Admin xử lý (`status = PENDING`).
*   **Thời điểm chặn:** Ngay khi nộp đơn.
*   **Mã lỗi trả về:** `400 Bad Request` kèm message: *"Bạn đã có một đơn xin trả phòng đang chờ xử lý"*.

### 1.3. Tự Động Thu Hồi Quyền An Ninh (Smart Access Revocation)
*   **Logic:** Ngay khi Admin ấn **Duyệt (APPROVED)** đơn Trả phòng, hệ thống không chỉ giải phóng giường (`AVAILABLE`) mà sẽ kích hoạt sự kiện `StudentCheckedOutEvent`.
*   **Hành động ngầm:**
    1. Chuyển hồ sơ sinh viên sang trạng thái `INACTIVE`.
    2. Vô hiệu hóa tính năng nhận diện khuôn mặt (`isFaceRegistered = false` và `faceImageUrl = null`).
    3. Trạm kiểm soát cửa từ (Smart Access) sẽ ngay lập tức từ chối quyền truy cập vào KTX của sinh viên này.

---

## 2. Yêu Cầu Xử Lý UI/UX Dành Cho Frontend (Student App)

Team Mobile App bắt buộc phải tuân thủ các quy tắc thiết kế giao diện sau để mang lại trải nghiệm mượt mà, tránh việc sinh viên hoang mang vì bị văng lỗi.

### Yêu cầu 2.1: Proactive Check (Chặn trước khi điền Form)
Thay vì để sinh viên điền Form xin trả phòng rồi mới báo lỗi, App phải chủ động kiểm tra trạng thái ngay khi màn hình vừa tải xong:
*   Gọi API `GET /api/v1/bills`: Nếu phát hiện có hóa đơn nợ -> **Hiển thị Banner cảnh báo màu đỏ và Khóa (Disable) nút Nộp đơn**.
*   Gọi API `GET /api/v1/students/checkout-requests`: Nếu đơn gần nhất đang là `PENDING` -> **Ẩn nút Nộp đơn** và hiển thị Text: *"Đơn của bạn đang được xử lý, vui lòng đợi."*

### Yêu cầu 2.2: Luồng Chảy UX (Cross-navigation Flow)
Khi App bắt được mã lỗi 400 do Nợ Tiền từ Backend:
*   **Bắt buộc:** Phải hiển thị Modal/Dialog thông báo lỗi.
*   **Call-to-Action:** Trong Modal đó phải có một nút **[Thanh Toán Ngay]**. Khi sinh viên ấn vào, App phải tự động chuyển hướng (navigate) sang Màn hình Danh sách Hóa đơn để sinh viên thao tác quẹt thẻ/chuyển khoản trả nợ.

---

## 3. Quản Trị Hệ Thống (Web Admin)

Đối với Web Admin, do sinh viên đã bị chặn nộp đơn rác (Spam) và đơn nợ xấu từ vòng ngoài, nên mọi lá đơn xuất hiện trên màn hình quản lý của Admin đều là **Đơn Hợp Lệ (Clear from debts)**. 

Admin chỉ việc đọc lý do, và ấn **Duyệt**. Tất cả các luồng thu hồi phòng, giường và khóa cửa FaceID đều được Backend tự động xử lý 100%. Không yêu cầu Admin thực hiện thêm thao tác tay nào khác.
