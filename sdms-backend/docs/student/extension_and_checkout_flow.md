# Tài liệu Tích hợp Nghiệp vụ Gia hạn (Stay Extension) và Trả phòng (Checkout)

Tài liệu này mô tả chi tiết luồng nghiệp vụ và danh sách API cho hai tính năng: **Gia hạn lưu trú (Stay Extension)** và **Trả phòng (Checkout)** dành cho Sinh viên (App Student) và Quản lý (Web Admin).
_Lưu ý: Các tính năng này yêu cầu tài khoản sinh viên đã đăng nhập và đang cư trú tại KTX (Status = ACTIVE). Web Public không hỗ trợ nghiệp vụ này._

---

## 1. Nghiệp vụ Gia hạn lưu trú (Stay Extension)

### 1.1 Luồng nghiệp vụ (Workflow)
1. **Kiểm tra đợt đăng ký**: Hệ thống chỉ cho phép nộp đơn gia hạn khi đang có một Đợt đăng ký (Registration Period) mở với loại `CURRENT_RESIDENT` (Gia hạn nội trú).
2. **Sinh viên nộp đơn**: Sinh viên nộp đơn gia hạn kèm lý do. Hệ thống kiểm tra sinh viên phải đang lưu trú (`ACTIVE` và có giường `OCCUPIED`).
3. **Chờ duyệt**: Đơn gia hạn được tạo ở trạng thái `PENDING`.
4. **Admin xét duyệt**: 
   - Nếu `APPROVED`: Hệ thống cập nhật thời gian dự kiến trả phòng (`expectedCheckOutAt`) trong hợp đồng hiện tại bằng với ngày kết thúc đợt lưu trú (`stayEndDate`). 
   - Hệ thống tự động **Sinh file PDF** quyết định gia hạn và bắn sự kiện `ExtensionApprovedEvent` để tạo Hóa đơn mới và gửi email thông báo.
   - Nếu `REJECTED`: Đơn bị từ chối kèm lý do, sinh viên sẽ checkout theo đúng lịch cũ.

### 1.2 Danh sách API - App Student
*Base URL: `/api/v1/students/extensions` (Yêu cầu JWT Token - Role: STUDENT)*

- **Nộp đơn gia hạn mới**
  - **Endpoint**: `POST /`
  - **Body**: 
    ```json
    {
      "reason": "Lý do gia hạn",
      "description": "Mô tả chi tiết"
    }
    ```
  - **Quy tắc**: Sinh viên chỉ được nộp nếu chưa có đơn nào khác, và đang ở trong thời gian mở form gia hạn nội trú.

- **Xem đơn gia hạn của tôi**
  - **Endpoint**: `GET /my-application`
  - **Response**: Trả về chi tiết đơn (bao gồm trạng thái, lý do từ chối (nếu có), link tải file PDF quyết định (nếu đã duyệt)).

### 1.3 Danh sách API - Web Admin
*Base URL: `/api/v1/admin/extensions` (Yêu cầu JWT Token - Role: ADMIN, STAFF)*

- **Lấy danh sách toàn bộ đơn gia hạn**
  - **Endpoint**: `GET /?page=0&size=10`
  - **Mô tả**: Sử dụng cho bảng DataGrid ở trang quản lý đơn gia hạn.

- **Xét duyệt đơn (Duyệt/Từ chối)**
  - **Endpoint**: `PUT /{extensionId}/status`
  - **Body**:
    ```json
    {
      "status": "APPROVED", // hoặc "REJECTED"
      "rejectReason": "Lý do từ chối (bắt buộc nếu REJECTED)"
    }
    ```

---

## 2. Nghiệp vụ Trả phòng (Checkout Request)

### 2.1 Luồng nghiệp vụ (Workflow)
1. **Sinh viên nộp đơn trả phòng**: Cung cấp ngày dự kiến rời đi, thông tin tài khoản ngân hàng (để hoàn tiền cọc nếu có).
2. **Ràng buộc kiểm tra**: 
   - Sinh viên không được nợ tiền phòng hay điện nước (Hệ thống sẽ quét các bill `UNPAID` hoặc `OVERDUE`). Nếu có nợ, chặn nộp đơn.
   - Sinh viên phải đang có phòng `OCCUPIED`.
3. **Chờ duyệt**: Đơn chuyển sang trạng thái `PENDING`.
4. **Admin xét duyệt**:
   - Nếu `APPROVED`: Hệ thống tiến hành **trả giường** thực tế (`housingAssignmentService.checkOut`). 
   - Bắn sự kiện `StudentCheckedOutEvent` để các module khác (như Smart Access Face ID) thu hồi quyền ra vào.
   - Nếu `REJECTED`: Đơn bị từ chối kèm lý do.

### 2.2 Danh sách API - App Student
*Base URL: `/api/v1/students/checkout-requests` (Yêu cầu JWT Token - Role: STUDENT)*

- **Nộp đơn trả phòng**
  - **Endpoint**: `POST /`
  - **Body**:
    ```json
    {
      "intendedCheckoutDate": "2026-12-31T00:00:00Z",
      "reason": "Lý do trả phòng",
      "bankAccountNumber": "0123456789",
      "bankName": "Vietcombank"
    }
    ```
  
- **Lấy danh sách đơn trả phòng của tôi**
  - **Endpoint**: `GET /`
  - **Response**: Mảng danh sách các đơn đã nộp (thường là 1 đơn) và lịch sử trả phòng.

### 2.3 Danh sách API - Web Admin
*Base URL: `/api/v1/admin/checkout-requests` (Yêu cầu JWT Token - Role: ADMIN)*

- **Lấy danh sách toàn bộ đơn trả phòng**
  - **Endpoint**: `GET /?status=PENDING&page=0&size=10`
  - **Mô tả**: Liệt kê các đơn trả phòng. Có thể lọc theo tham số `status` (PENDING, APPROVED, REJECTED).

- **Xét duyệt đơn trả phòng**
  - **Endpoint**: `POST /{requestId}/review`
  - **Body**:
    ```json
    {
      "status": "APPROVED", // hoặc "REJECTED"
      "rejectReason": "Lý do từ chối (nếu REJECTED)"
    }
    ```

---

## 3. Hướng dẫn Tích hợp & UX/UI Guidelines

### 3.1 Ứng dụng Sinh viên (Mobile App)
- **Màn hình Gia hạn**: Hiển thị Banner cảnh báo nếu không nằm trong đợt gia hạn. Chỉ hiển thị nút nộp đơn nếu API cho phép. Khi đơn đã nộp, thay thế form bằng màn hình `Trạng thái đơn (Đang xử lý/Đã duyệt)`, có nút tải PDF hợp đồng mới.
- **Màn hình Trả phòng (Checkout)**: Cần có bước Check Nợ phí. Nếu API trả về `400 BAD_REQUEST` với thông báo nợ phí, App cần điều hướng sinh viên sang màn hình "Thanh toán Hóa đơn" trước khi cho phép quay lại màn hình Checkout.
- **Nhập ngân hàng**: Bổ sung ghi chú *"Tài khoản ngân hàng dùng để KTX hoàn lại tiền cọc (nếu có)."*

### 3.2 Web Quản trị (Admin Dashboard)
- Cần có 2 màn hình riêng biệt: **Quản lý Gia hạn** và **Quản lý Trả phòng**.
- **Quản lý Trả phòng**: Nên có Badge màu đỏ (Unpaid/Debts) nếu Admin muốn xem chi tiết nợ của sinh viên, mặc dù hệ thống đã chặn nộp đơn nếu có nợ, nhưng Admin cần biết lịch sử thanh toán để làm thủ tục hoàn cọc.
- Khi Duyệt Checkout, Admin nên được hỏi xác nhận Dialog: *"Bạn có chắc chắn duyệt trả phòng? Quyền ra vào KTX của sinh viên sẽ bị thu hồi ngay lập tức."*

### 3.3 Public Web
- Hoàn toàn KHÔNG liên quan đến Public Web do yêu cầu Token Đăng nhập và trạng thái Nội trú (Active Resident). Không cần hiển thị bất kỳ menu nào về Gia hạn hay Checkout ở Landing Page.
