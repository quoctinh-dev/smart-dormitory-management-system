# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 4: Tài chính & Thanh toán
### UC 4.3: Thanh toán & Đối soát

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Thanh toán & Đối soát** |
| **Actor** | Sinh viên, Admin, Hệ thống Gateway (SePay Webhook) |
| **Mô tả** | Đóng vai trò là "Kế toán tự động" của hệ thống KTX. Xử lý logic sinh mã QR thanh toán theo chuẩn VietQR, bắt tín hiệu biến động số dư từ Gateway ngân hàng (SePay) và tự động gạch nợ hóa đơn mà không cần con người can thiệp. |
| **Pre-conditions** | - Sinh viên có hóa đơn ở trạng thái `UNPAID` hoặc `PARTIAL_PAID`.<br>- Hệ thống KTX đã tích hợp và cấu hình thành công API Key của SePay. |
| **Post-conditions** | **Success:** Hóa đơn được chuyển trạng thái thành `PAID` ngay khi ngân hàng báo có, cập nhật biên lai điện tử.<br>**Fail:** Sinh viên chuyển sai nội dung/thiếu tiền; hệ thống cảnh báo Admin để đối soát thủ công. |
| **Luồng sự kiện chính** | 1. Sinh viên quét mã QR thanh toán trực tuyến.<br>2. SePay Gateway bắt giao dịch và bắn Webhook về hệ thống KTX.<br>3. Hệ thống KTX phân giải nội dung, gạch nợ tự động.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Thanh toán trực tuyến QR**.<br>- Extend Use Case **Nhận Webhook SePay (Tự động - Cốt lõi)**.<br>- Extend Use Case **Xác nhận thanh toán tiền mặt (Thủ công)**.<br>- Extend Use Case **Xem hướng dẫn thanh toán**. |
| **Luồng sự kiện phụ** | - SePay Gateway bị lỗi phản hồi hoặc rớt mạng.<br>- Hệ thống cung cấp cơ chế kiểm tra chéo bằng tay (Manual sync) hoặc thanh toán bằng tiền mặt. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Thanh toán trực tuyến QR (Sinh viên)
*   **Bước 1:** Sinh viên vào chi tiết một Hóa đơn chưa thanh toán, bấm `Thanh toán`.
*   **Bước 2:** Hệ thống tự động tạo mã định danh giao dịch (Transaction Code) duy nhất cho hóa đơn này (Ví dụ: `SDMS-PAY-12345`).
*   **Bước 3:** Hệ thống lấy thông tin: Số tài khoản KTX, Mã ngân hàng, Số tiền và Transaction Code truyền vào chuẩn VietQR.
*   **Bước 4:** Render hình ảnh mã QR Code lên màn hình hiển thị.
*   **Bước 5:** Sinh viên dùng App ngân hàng quét mã QR, số tiền và nội dung (`SDMS-PAY-12345`) được điền hoàn toàn tự động. Sinh viên bấm chuyển tiền.

#### 2. Nhận Webhook SePay (Nghiệp vụ cốt lõi - Tự động đối soát)
*   **Bước 1:** Khi ngân hàng ghi có tiền vào tài khoản KTX, SePay bắt biến động số dư và bắn một request (Webhook) về Endpoint `/api/v1/payments/sepay/webhook` của hệ thống.
*   **Bước 2:** KTX tiếp nhận payload. Hệ thống kiểm tra chuỗi `Authorization` để xác thực `API Key` (Chống request giả mạo).
*   **Bước 3:** Chống lặp giao dịch (Idempotency): Hệ thống kiểm tra mã giao dịch ngân hàng (`gateway_transaction_id`) đã từng xử lý chưa. Nếu đã có thì bỏ qua.
*   **Bước 4:** Phân tích cú pháp lời nhắn chuyển khoản (Content) để bóc tách mã `Transaction Code` hoặc chuỗi Fallback theo `Bill Code`.
*   **Bước 5:** Hệ thống truy vấn CSDL tìm đúng Hóa đơn tương ứng.
*   **Bước 6:** Kiểm tra đối soát số tiền chuyển:
    *   Nếu số tiền chuyển `>=` số tiền cần đóng: Đổi trạng thái hóa đơn thành `PAID` (Đã thanh toán).
    *   Nếu số tiền chuyển `<` số tiền cần đóng: Đổi trạng thái thành `PARTIAL_PAID` (Thanh toán một phần) và lưu số tiền đã đóng.
*   **Bước 7:** Gửi Real-time notification (WebSocket) hoặc Push Notification tới thiết bị của sinh viên: "Thanh toán thành công!".
> **Rẽ nhánh 2.1 (Sinh viên ghi sai nội dung chuyển khoản):**
> - *Bước 4.1:* Không tìm thấy `Transaction Code` hợp lệ trong lời nhắn (Do sinh viên tự gõ tay hoặc xóa nhầm).
> - *Bước 5.1:* Hệ thống chuyển sang cơ chế Fallback (Quét mã Bill ID 8 ký tự). Nếu vẫn không khớp, bỏ qua Webhook và lưu vào Log `Unresolved Transactions`.
> - *Bước 6.1:* Admin sẽ dùng Log này để tra soát bằng tay và gạch nợ thủ công (Extend 3).

#### 3. Xác nhận thanh toán tiền mặt (Thủ công / Backup)
*   **Bước 1:** Dùng cho trường hợp sinh viên đến quầy đóng tiền mặt hoặc bị lỗi Webhook (Rẽ nhánh 2.1). Admin chọn hóa đơn của sinh viên và bấm `Thanh toán thủ công`.
*   **Bước 2:** Hệ thống yêu cầu xác nhận số tiền đã nhận thực tế.
*   **Bước 3:** Admin bấm `Xác nhận`.
*   **Bước 4:** Hệ thống cập nhật trạng thái hóa đơn thành `PAID` và ghi log "Người cập nhật: [Tên Admin]".

#### 4. Xem hướng dẫn thanh toán
*   **Bước 1:** Sinh viên bấm vào `Hướng dẫn thanh toán`.
*   **Bước 2:** Hệ thống hiển thị Popup quy trình 3 bước thanh toán QR, cũng như cách liên hệ Ban Quản lý khi gặp sự cố chuyển khoản sai nội dung.
