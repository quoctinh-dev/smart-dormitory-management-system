# SSR - Module Quản lý Thanh toán (Payment)
**Phiên bản:** 1.0 | **Ngày:** 2026-06-26

Tài liệu này định nghĩa các Yêu cầu Chức năng (Functional Requirements - FR) chi tiết cho Module Quản lý Thanh toán.

---

## 1. Tổng quan Chức năng

Module này chịu trách nhiệm cho toàn bộ vòng đời của một giao dịch tài chính, từ việc tạo hóa đơn, xử lý thanh toán, cho đến việc đối soát và đảm bảo tính toàn vẹn dữ liệu.

## 2. Các Yêu cầu Chức năng (Functional Requirements)

### Nhóm [FR-PAY-BILL]: Quản lý Hóa đơn
- **[FR-PAY-001] Tự động Tạo Hóa đơn Phí KTX:**
    - **Mô tả:** Hệ thống **Phải** tự động tạo một hóa đơn (`Bill`) phí lưu trú khi một giường được giữ chỗ thành công cho sinh viên.
    - **Tiền điều kiện:** Một sự kiện `BedReservedEvent` được phát ra từ module `Room`.
    - **Hậu điều kiện:** Một bản ghi `Bill` được tạo với trạng thái `UNPAID` và có `dueDate` (hạn thanh toán) được thiết lập.
- **[FR-PAY-002] Truy vấn Hóa đơn Cá nhân:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên đã đăng nhập xem danh sách các hóa đơn của chính mình.
    - **Tiền điều kiện:** Người dùng đã xác thực với vai trò `STUDENT`.
    - **Hậu điều kiện:** Danh sách các hóa đơn (bao gồm trạng thái và số tiền) được trả về.

### Nhóm [FR-PAY-PROCESS]: Xử lý Giao dịch
- **[FR-PAY-010] Khởi tạo Thanh toán Online:**
    - **Mô tả:** Hệ thống **Phải** cho phép sinh viên khởi tạo một giao dịch thanh toán trực tuyến cho một hóa đơn `UNPAID`.
    - **Tiền điều kiện:** Hóa đơn đang ở trạng thái `UNPAID`.
    - **Hậu điều kiện:**
        1. Một bản ghi `Payment` được tạo với trạng thái `PENDING`.
        2. Hệ thống trả về một URL thanh toán (từ cổng thanh toán) để chuyển hướng người dùng.
- **[FR-PAY-011] Ghi nhận Thanh toán Tiền mặt:**
    - **Mô tả:** Hệ thống **Phải** cho phép Admin ghi nhận một khoản thanh toán bằng tiền mặt cho một hóa đơn.
    - **Tiền điều kiện:** Người dùng có vai trò `ADMIN`.
    - **Hậu điều kiện:**
        1. Một bản ghi `Payment` được tạo với trạng thái `SUCCESS` và phương thức `CASH`.
        2. Trạng thái của `Bill` liên quan được cập nhật thành `PAID`.
        3. Hệ thống **Phải** phát ra sự kiện `PaymentSuccessEvent`.
- **[FR-PAY-012] Xử lý Webhook từ Cổng thanh toán:**
    - **Mô tả:** Hệ thống **Phải** cung cấp một endpoint để tiếp nhận và xử lý webhook thông báo kết quả giao dịch từ cổng thanh toán.
    - **Tiền điều kiện:** Yêu cầu webhook hợp lệ (đã xác thực chữ ký).
    - **Hậu điều kiện:**
        1. Trạng thái của `Payment` được cập nhật thành `SUCCESS` hoặc `FAILED`.
        2. Nếu thành công, trạng thái của `Bill` liên quan được cập nhật thành `PAID`.
        3. Nếu thành công, hệ thống **Phải** phát ra sự kiện `PaymentSuccessEvent`. (Tuân thủ [NFR-SEC-01])

### Nhóm [FR-PAY-AUTO]: Các Quy trình Tự động & Đảm bảo Tin cậy
- **[FR-PAY-020] Tự động Đối soát Giao dịch:**
    - **Mô tả:** Hệ thống **Phải** có một Job định kỳ (`PaymentReconciliationJob`) để chủ động đối soát trạng thái các giao dịch `PENDING` với cổng thanh toán.
    - **Tiền điều kiện:** Không có.
    - **Hậu điều kiện:** Các giao dịch có sai lệch trạng thái sẽ được tự động cập nhật và các sự kiện liên quan (ví dụ: `PaymentSuccessEvent`) sẽ được phát lại nếu cần. (Tuân thủ [NFR-REL-01])
- **[FR-PAY-021] Tự động Xử lý Hóa đơn Quá hạn:**
    - **Mô tả:** Hệ thống **Phải** có một Job định kỳ (`BillOverdueJob`) để quét và cập nhật trạng thái các hóa đơn đã quá hạn thanh toán.
    - **Tiền điều kiện:** Không có.
    - **Hậu điều kiện:** Các hóa đơn `UNPAID` có `dueDate` trong quá khứ sẽ được chuyển trạng thái thành `OVERDUE`. Hệ thống **Nên** phát ra sự kiện `PaymentExpiredEvent`.
