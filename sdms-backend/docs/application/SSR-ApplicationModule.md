# SSR - Module Quản lý Đơn từ (Application)
**Phiên bản:** 1.0 | **Ngày:** 2026-06-26

Tài liệu này định nghĩa các Yêu cầu Chức năng (Functional Requirements - FR) chi tiết cho Module Quản lý Đơn từ.

---

## 1. Tổng quan Chức năng

Module này chịu trách nhiệm cho toàn bộ vòng đời của một đơn đăng ký lưu trú, từ lúc sinh viên tạo nháp cho đến khi được xét duyệt.

## 2. Các Yêu cầu Chức năng (Functional Requirements)

### Nhóm [FR-APP-SUBMIT]: Nộp Đơn
- **[FR-APP-001] Tạo Đơn đăng ký:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên tạo một đơn đăng ký lưu trú mới.
    - **Tiền điều kiện:** Sinh viên đã vượt qua bước kiểm tra tư cách hợp lệ của đợt đăng ký.
    - **Hậu điều kiện:** Một bản ghi `DormitoryApplication` được tạo trong CSDL với trạng thái là `DRAFT`.
- **[FR-APP-002] Tải lên Giấy tờ:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên tải lên các file giấy tờ xác minh (ảnh CCCD, giấy ưu tiên...).
    - **Tiền điều kiện:** Đơn đang ở trạng thái `DRAFT` hoặc `REQUEST_REVISION`.
    - **Hậu điều kiện:** Một bản ghi `VerificationDocument` được tạo và liên kết với đơn đăng ký.
- **[FR-APP-003] Nộp Đơn chính thức:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên nộp đơn để chờ xét duyệt.
    - **Tiền điều kiện:** Đơn đang ở trạng thái `DRAFT` hoặc `REQUEST_REVISION` và đã có đủ các giấy tờ bắt buộc.
    - **Hậu điều kiện:** Trạng thái của đơn được chuyển thành `PENDING`. Hệ thống **Nên** phát ra sự kiện `ApplicationSubmittedEvent`.

### Nhóm [FR-APP-REVIEW]: Xét duyệt Đơn
- **[FR-APP-010] Xác minh Giấy tờ:**
    - **Mô tả:** Hệ thống **Phải** cho phép Admin thay đổi trạng thái của một `VerificationDocument` thành `VALID` (Hợp lệ) hoặc `INVALID` (Không hợp lệ).
    - **Tiền điều kiện:** Đơn đang ở trạng thái `PENDING` hoặc `UNDER_REVIEW`.
    - **Hậu điều kiện:** Trạng thái của giấy tờ được cập nhật. Nếu giấy tờ thuộc diện ưu tiên, tổng điểm ưu tiên của đơn **Phải** được tự động tính toán lại.
- **[FR-APP-011] Chấp thuận Đơn:**
    - **Mô tả:** Hệ thống **Phải** cho phép Admin chấp thuận một đơn đăng ký.
    - **Tiền điều kiện:** Đơn đang ở trạng thái `PENDING` hoặc `UNDER_REVIEW`.
    - **Hậu điều kiện:**
        1. Trạng thái của đơn được chuyển thành `WAITING_PAYMENT`.
        2. Hạn chót thanh toán (`paymentDeadline`) được thiết lập.
        3. Hệ thống **Phải** phát ra sự kiện `ApplicationApprovedEvent` để các module khác xử lý. (Tuân thủ [NFR-ARC-01])
- **[FR-APP-012] Từ chối Đơn:**
    - **Mô tả:** Hệ thống **Phải** cho phép Admin từ chối một đơn đăng ký, kèm theo lý do.
    - **Tiền điều kiện:** Đơn đang ở trạng thái `PENDING` hoặc `UNDER_REVIEW`.
    - **Hậu điều kiện:** Trạng thái của đơn được chuyển thành `REJECTED`. Hệ thống **Nên** phát ra sự kiện `ApplicationRejectedEvent`.
- **[FR-APP-013] Yêu cầu Bổ sung:**
    - **Mô tả:** Hệ thống **Phải** cho phép Admin gửi trả đơn về cho sinh viên để bổ sung giấy tờ.
    - **Tiền điều kiện:** Đơn đang ở trạng thái `PENDING` hoặc `UNDER_REVIEW` và có ít nhất một giấy tờ bị đánh dấu `INVALID`.
    - **Hậu điều kiện:** Trạng thái của đơn được chuyển thành `REQUEST_REVISION`. Hạn chót bổ sung (`revisionDeadline`) được thiết lập.

### Nhóm [FR-APP-AUTO]: Các Quy trình Tự động
- **[FR-APP-020] Tự động Xếp Danh sách chờ:**
    - **Mô tả:** Khi không còn giường trống, hệ thống **Phải** tự động chuyển các đơn được duyệt vào trạng thái `WAITING_LIST`.
    - **Tiền điều kiện:** Module `Room` thông báo không tìm thấy giường phù hợp khi xử lý `ApplicationApprovedEvent`.
    - **Hậu điều kiện:** Trạng thái của đơn được chuyển thành `WAITING_LIST`.
- **[FR-APP-021] Tự động Đôn đơn từ Danh sách chờ:**
    - **Mô tả:** Hệ thống **Phải** có một Job định kỳ (`WaitingListPromotionJob`) để tự động xử lý danh sách chờ khi có giường trống.
    - **Tiền điều kiện:** Có giường trống và có đơn trong `WAITING_LIST`.
    - **Hậu điều kiện:** Đơn có ưu tiên cao nhất trong danh sách chờ được chuyển sang trạng thái `WAITING_PAYMENT` và sự kiện `ApplicationApprovedEvent` được phát ra cho đơn đó.
- **[FR-APP-022] Tự động Tạo PDF:**
    - **Mô tả:** Khi sinh viên nộp đơn, hệ thống **Nên** tự động tạo ra các file PDF (Phiếu đăng ký, Bản cam kết) và lưu trữ lại.
    - **Tiền điều kiện:** Yêu cầu [FR-APP-003] được thực hiện thành công.
    - **Hậu điều kiện:** Các bản ghi `ApplicationGeneratedDocument` được tạo và liên kết với đơn. (Tuân thủ [NFR-PER-02])
