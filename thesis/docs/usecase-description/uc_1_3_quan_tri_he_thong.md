# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 1: Hệ thống & Tài khoản
### UC 1.3: Quản trị Hệ thống

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản trị Hệ thống & Thống kê** |
| **Actor** | Admin |
| **Mô tả** | Cung cấp các chức năng cho Quản trị viên thiết lập cấu hình hệ thống (như giá điện, hạn thanh toán, tham số IoT) và theo dõi tình hình hoạt động tổng quan thông qua Dashboard thống kê. |
| **Pre-conditions** | - Admin phải đăng nhập thành công với quyền Super Admin hoặc Manager. |
| **Post-conditions** | **Success:** Cấu hình hệ thống được cập nhật thành công; dữ liệu thống kê được hiển thị chính xác.<br>**Fail:** Hệ thống hiển thị thông báo lỗi và các cấu hình không thay đổi. |
| **Luồng sự kiện chính** | 1. Admin chọn chức năng Quản trị Hệ thống (Cấu hình) hoặc vào trang chủ (Dashboard).<br>2. Hệ thống hiển thị giao diện tương ứng.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Thiết lập cấu hình hệ thống**.<br>- Extend Use Case **Xem Dashboard thống kê**.<br>- Extend Use Case **Xem hợp đồng sắp hết hạn**. |
| **Luồng sự kiện phụ** | - Admin chọn **Quay lại** hoặc chuyển sang chức năng khác.<br>- Hệ thống hủy thao tác hiện tại nếu chưa lưu cấu hình. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Thiết lập cấu hình hệ thống
*   **Bước 1:** Admin chọn `Cài đặt hệ thống` (System Settings).
*   **Bước 2:** Hệ thống hiển thị các thông số cấu hình hiện tại (Ví dụ: `PAYMENT_DEADLINE_DAYS`, Tiền đặt cọc, Giá điện nước, Cổng kết nối MQTT).
*   **Bước 3:** Admin cập nhật các thông số.
*   **Bước 4:** Hệ thống kiểm tra tính hợp lệ của dữ liệu (Ví dụ: số ngày hạn thanh toán phải > 0).
*   **Bước 5:** Admin chọn `Lưu cấu hình`.
*   **Bước 6:** Hệ thống cập nhật bảng `SystemConfig` trong CSDL.
*   **Bước 7:** Hệ thống hiển thị thông báo thành công và áp dụng cấu hình mới trên toàn cục (Clear Cache cấu hình nếu có).
> **Rẽ nhánh 1.1 (Dữ liệu không hợp lệ):**
> - *Bước 4.1:* Dữ liệu không hợp lệ hoặc sai định dạng kiểu (Ví dụ nhập chữ vào trường bắt buộc là số).
> - *Bước 5.1:* Hệ thống hiển thị thông báo lỗi ngay trên Form và yêu cầu nhập lại.

#### 2. Xem Dashboard thống kê
*   **Bước 1:** Admin truy cập vào màn hình trang chủ (Dashboard).
*   **Bước 2:** Hệ thống chạy các hàm truy vấn Aggregate đếm dữ liệu thống kê.
*   **Bước 3:** Hệ thống tổng hợp số liệu về:
    *   Tổng số sinh viên đang lưu trú.
    *   Tỉ lệ phòng trống / Tỉ lệ lấp đầy (Công suất phòng).
    *   Doanh thu theo tháng / Tỉ lệ hóa đơn chưa thanh toán.
*   **Bước 4:** Hệ thống hiển thị dữ liệu dưới dạng các Widget, biểu đồ (Biểu đồ tròn, biểu đồ cột) và thẻ trạng thái (Status Cards).

#### 3. Xem hợp đồng sắp hết hạn
*   **Bước 1:** Admin kéo xuống khu vực `Hợp đồng sắp hết hạn` trên màn hình Dashboard.
*   **Bước 2:** Hệ thống truy vấn các hồ sơ lưu trú (`StudentHousingAssignment`) có ngày hết hạn (`endDate`) nằm trong khoảng thời gian sắp tới (VD: Trong vòng 30 ngày).
*   **Bước 3:** Hệ thống hiển thị danh sách sinh viên sắp hết hạn lưu trú, bao gồm Mã số sinh viên, tên phòng, và ngày chính xác sẽ hết hạn.
*   **Bước 4:** Admin có thể click xem chi tiết để gọi điện nhắc nhở hoặc gửi thông báo yêu cầu sinh viên gia hạn/trả phòng.
