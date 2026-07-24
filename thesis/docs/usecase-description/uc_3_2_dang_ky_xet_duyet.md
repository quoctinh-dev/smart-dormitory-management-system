# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 3: Dịch vụ lưu trú
### UC 3.2: Nộp đơn & Xét duyệt Lưu trú

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Nộp đơn & Xét duyệt Lưu trú** |
| **Actor** | Sinh viên, Admin |
| **Mô tả** | Quản lý toàn bộ quá trình sinh viên nộp hồ sơ xin lưu trú và Admin thực hiện nghiệp vụ kiểm duyệt. Sau khi duyệt, hệ thống sẽ kích hoạt chéo thuật toán tự động xếp phòng của Phân hệ 2. |
| **Pre-conditions** | - Có ít nhất một đợt đăng ký đang mở (Active).<br>- Sinh viên đã đăng nhập thành công. |
| **Post-conditions** | **Success:** Đơn đăng ký được duyệt, hệ thống gọi tự động xếp phòng và trạng thái đơn chuyển sang Chờ thanh toán.<br>**Fail:** Đơn bị từ chối hoặc cần bổ sung thông tin. |
| **Luồng sự kiện chính** | 1. Sinh viên vào phân hệ đăng ký, kiểm tra đợt mở và nộp đơn.<br>2. Admin tiếp nhận và ra quyết định trên đơn.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Xem đợt đăng ký đang mở**.<br>- Extend Use Case **Kiểm tra điều kiện đăng ký**.<br>- Extend Use Case **Nộp đơn đăng ký & Tải lên minh chứng**.<br>- Extend Use Case **Tra cứu trạng thái hồ sơ**.<br>- Extend Use Case **Xét duyệt hồ sơ**.<br>- Extend Use Case **Yêu cầu bổ sung hồ sơ & Nộp lại**.<br>- Extend Use Case **Xác nhận thanh toán (Admin)**. |
| **Luồng sự kiện phụ** | - Sinh viên chọn **Hủy** quá trình điền đơn, hệ thống không lưu dữ liệu. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Xem đợt đăng ký đang mở
*   **Bước 1:** Sinh viên truy cập tính năng Đăng ký.
*   **Bước 2:** Hệ thống truy vấn các đợt đăng ký `ACTIVE`. Hiển thị tên đợt, thời hạn và thông báo mời nộp đơn.

#### 2. Kiểm tra điều kiện đăng ký
*   **Bước 1:** Sinh viên bấm `Nộp đơn`.
*   **Bước 2:** Hệ thống check 2 điều kiện: MSSV có nằm trong danh sách ưu tiên/hợp lệ không, và Sinh viên có đang mang hợp đồng lưu trú nào khác không.
*   **Bước 3:** Cho phép đi tiếp hoặc chặn lại báo lỗi.

#### 3. Nộp đơn đăng ký & Tải lên minh chứng
*   **Bước 1:** Sinh viên điền thông tin bổ sung và tải lên file minh chứng (Sổ hộ nghèo, giấy chính sách).
*   **Bước 2:** Bấm `Gửi`. Hệ thống tạo đơn ở trạng thái `PENDING` và upload file lên Cloud.

#### 4. Tra cứu trạng thái hồ sơ
*   **Bước 1:** Sinh viên vào `Hồ sơ của tôi`.
*   **Bước 2:** Xem trạng thái Real-time (PENDING, APPROVED, REJECTED, NEEDS_UPDATE, RESERVED, WAITING_PAYMENT).

#### 5. Xét duyệt hồ sơ (Và Auto-Assign)
*   **Bước 1:** Admin vào danh sách đơn `PENDING`, xem chi tiết và file minh chứng.
*   **Bước 2:** Admin chọn `Phê duyệt` (Approve).
*   **Bước 3:** Đổi trạng thái đơn.
*   **Bước 4:** *Kích hoạt liên luồng:* Hệ thống gọi thuật toán **Tự động xếp phòng (Thuộc Phân hệ 2)** để tìm giường trống, giữ chỗ (Lock) và gán cho sinh viên.
*   **Bước 5:** Đổi trạng thái đơn thành Chờ thanh toán và gửi thông báo.

#### 6. Yêu cầu bổ sung hồ sơ & Nộp lại
*   **Bước 1:** Nếu minh chứng mờ, Admin chọn `Yêu cầu bổ sung`, nhập lý do. Đơn chuyển thành `NEEDS_UPDATE`.
*   **Bước 2:** Sinh viên nhận thông báo, nộp lại file mới.
*   **Bước 3:** Đơn quay về `PENDING` để duyệt lại.

#### 7. Xác nhận thanh toán (Admin)
*   **Bước 1:** (Fallback thủ công khi Webhook lỗi) Admin tra cứu đơn đang chờ thanh toán.
*   **Bước 2:** Kiểm tra sao kê ngân hàng thủ công.
*   **Bước 3:** Bấm `Xác nhận đã đóng tiền`. Đơn đủ điều kiện để Check-in.
