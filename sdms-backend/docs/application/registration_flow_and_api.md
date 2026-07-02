# TÀI LIỆU LUỒNG ĐĂNG KÝ VÀ KIỂM DUYỆT KÝ TÚC XÁ

Tài liệu này mô tả chi tiết quy trình (Workflow) từ khi Sinh viên nộp đơn đăng ký đến lúc nhận phòng và kích hoạt tài khoản thành công. Tài liệu cũng liệt kê các API Backend tương ứng và đánh giá mức độ đáp ứng của Frontend (UI/UX) so với luồng này.

---

## 1. QUY TRÌNH NGHIỆP VỤ (BACKEND FLOW & API)

### Bước 1: Nộp Đơn Đăng Ký (Student Submit)
- **API**: `POST /api/v1/applications` (Public - `ApplicationController`)
- **Hành động Backend**:
  1. Tạo bản ghi `DormitoryApplication` với trạng thái **`PENDING`**.
  2. Bắn sự kiện `ApplicationSubmittedEvent`.
  3. `RoomAllocationListener` bắt sự kiện: Tự động phân bổ một giường trống hợp lệ và tạo bản ghi `StudentHousingAssignment` với trạng thái **`RESERVED`**. (Giường cũng chuyển sang `RESERVED`).
  4. Hệ thống bất đồng bộ tạo 2 file PDF (Phiếu đăng ký & Bản cam kết).

### Bước 2: Quản lý Kiểm duyệt Đơn (Admin Review)
- **API**: Các API trong `ApplicationReviewController` (Admin)
- **Luồng xử lý**:
  1. **Bắt đầu duyệt**: `POST /api/v1/applications/{id}/start-review`
     - Chuyển đơn sang **`UNDER_REVIEW`**.
  2. **Duyệt giấy tờ**: `POST /api/v1/applications/{id}/verify-document`
     - Xác nhận từng file minh chứng là Hợp lệ (`VALID`) hay Không Hợp lệ (`INVALID`).
  3. **Yêu cầu bổ sung**: `POST /api/v1/applications/{id}/request-revision`
     - Chuyển đơn sang **`REQUEST_REVISION`** (nếu có tài liệu sai).
  4. **Từ chối đơn**: `POST /api/v1/applications/{id}/reject`
     - Chuyển đơn sang **`REJECTED`**. Giải phóng giường đã cấp.
  5. **Duyệt hợp lệ (Approve)**: `POST /api/v1/applications/{id}/approve`
     - Chuyển đơn sang **`WAITING_PAYMENT`**.
     - Bắn sự kiện `BedReservedEvent` kích hoạt `BillGenerationListener` tạo **Hóa đơn giữ chỗ (Bill)** với trạng thái **`UNPAID`**.

### Bước 3: Thanh Toán Hóa Đơn (Payment)
- **API**: `POST /api/v1/payments/cash/approve` (hoặc online qua cổng thanh toán).
- **Hành động Backend**:
  1. Đánh dấu Bill thành **`PAID`**.
  2. Bắn sự kiện `PaymentSuccessEvent`.
  3. **Cập nhật tự động**:
     - `ApplicationReviewService` bắt sự kiện: Đổi trạng thái Đơn thành **`APPROVED`**.
     - `PaymentWorkflowListener` bắt sự kiện: Đổi trạng thái Assignment (Gán phòng) thành **`PENDING_CHECKIN`**.
  4. **Sinh Hồ sơ & Tài khoản (StudentProvisioningListener)**:
     - Tạo bản ghi `Student` với trạng thái **`PENDING_CHECKIN`**.
     - Tạo bản ghi `UserAccount` với trạng thái **`PENDING_ACTIVATION`** (Mật khẩu mặc định là CCCD).

### Bước 4: Kích Hoạt Tài Khoản (Account Activation)
- **API**: `POST /api/v1/auth/activate`
- **Hành động Backend**:
  - Sinh viên sử dụng CCCD để đăng nhập lần đầu và bắt buộc đổi mật khẩu.
  - Cập nhật `UserAccount` sang **`ACTIVE`**.

### Bước 5: Nhận Phòng (Check-in)
- **API**: `POST /api/v1/room-assignments/{id}/check-in`
- **Hành động Backend**:
  - Trạng thái Assignment chuyển sang **`OCCUPIED`**.
  - Trạng thái Giường (Bed) chuyển sang **`OCCUPIED`**.
  - Bắn sự kiện `CheckInCompletedEvent`.
  - `StudentProvisioningListener` bắt sự kiện và đổi trạng thái `Student` thành **`ACTIVE`**.

---

## 2. ĐÁNH GIÁ MỨC ĐỘ ĐÁP ỨNG CỦA FRONTEND (UI/UX)

Dựa vào quy trình trên, dưới đây là đánh giá và đề xuất chỉnh sửa UI Frontend:

### Ưu điểm (Đã phù hợp):
- **Trang tra cứu (`/status`)**: Đã cover được các trạng thái cơ bản (`PENDING`, `WAITING_PAYMENT`, `APPROVED`) và hiển thị thông tin hóa đơn khi ở bước chờ thanh toán.
- **Trang Admin duyệt (`ApplicationReviewDetail.tsx`)**: Đã tách biệt rõ ràng các button xử lý: Yêu cầu bổ sung, Từ chối, Duyệt hợp lệ.
- **Form Kích hoạt tài khoản (`/activate-account`)**: Luồng logic hoàn toàn khớp với Backend (Dùng số CCCD làm thông tin đăng nhập tạm và ép đổi mật khẩu).

### Những điểm CHƯA PHÙ HỢP cần cải thiện (Đề xuất Fix Frontend):
1. **Dư thừa Nút "Xác nhận thu tiền mặt" ở trang Duyệt đơn:**
   - **Vấn đề**: Việc thanh toán hiện nay do Module Payment phụ trách. Nút "Xác nhận thu tiền" bên trang Review Application không còn ý nghĩa và có thể gây lỗi trải nghiệm. 
   - **Giải pháp**: Xóa hoàn toàn code hiển thị nút `Xác Nhận Đã Thu Tiền Mặt` trong trang `ApplicationReviewDetail.tsx`. Thay vào đó, Admin sẽ vào chuyên trang Quản lý Hóa đơn (Billing/Payment) để thu tiền mặt.

2. **Thiếu hiển thị Trạng thái PENDING_CHECKIN (Chờ nhận phòng):**
   - **Vấn đề**: Ở trang tra cứu tình trạng của sinh viên, sau khi đơn sang `APPROVED` và sinh viên đã thanh toán, hệ thống cần có một Block UI nổi bật nhắc nhở sinh viên: "Thanh toán thành công. Vui lòng mang giấy tờ đến quầy lễ tân để tiến hành Check-in nhận phòng". 
   - **Giải pháp**: Thêm Component thông báo hướng dẫn thủ tục check-in ở Frontend khi trạng thái ứng dụng là `APPROVED`.

3. **Luồng Kích hoạt tài khoản vs Luồng Check-in:**
   - **Vấn đề UX**: Sinh viên hiện tại được tạo tài khoản sau khi nộp tiền (`PENDING_ACTIVATION`). Tuy nhiên, sinh viên có thể quên kích hoạt. 
   - **Giải pháp**: 
     - Gửi Email tự động cho sinh viên ngay khi đóng tiền thành công kèm theo đường link trỏ thẳng tới trang `/activate-account`.
     - Trên trang tra cứu (`/status`), nếu đơn `APPROVED`, hiển thị một nút "Kích Hoạt Tài Khoản Ngay" để dẫn sinh viên qua luồng đổi mật khẩu.

4. **Trang báo cáo / Danh sách Check-in cho Lễ tân:**
   - **Vấn đề**: Backend đã sinh ra Assignment có trạng thái `PENDING_CHECKIN`. Lễ tân cần một trang (hoặc một tab) liệt kê toàn bộ các sinh viên đang ở trạng thái này để khi sinh viên đến, lễ tân chỉ việc bấm "Check-in".
   - **Giải pháp**: Đảm bảo Frontend Admin có menu "Quản lý Nhận Phòng" (`Check-in Management`) chuyên biệt thay vì gộp chung với trang Quản lý Đơn.
