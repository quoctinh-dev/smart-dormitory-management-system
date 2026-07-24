# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 2: Cơ sở vật chất
### UC 2.3: Tra cứu Cơ sở vật chất (Dành cho Sinh viên)

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Tra cứu Cơ sở vật chất (Dành cho Sinh viên)** |
| **Actor** | Sinh viên (Đã đăng nhập) |
| **Mô tả** | Cung cấp cổng thông tin tự phục vụ (Self-service) cho sinh viên, cho phép họ chủ động tra cứu thông tin về phòng trống trước khi đăng ký, cũng như xem kết quả xếp phòng và thông tin phòng đang ở. |
| **Pre-conditions** | - Sinh viên phải đăng nhập thành công vào ứng dụng di động (App Student) hoặc Web portal. |
| **Post-conditions** | **Success:** Thông tin về phòng trống, kết quả xếp phòng hoặc thông tin phòng hiện tại được hiển thị chính xác dựa trên dữ liệu hệ thống.<br>**Fail:** Hệ thống hiển thị thông báo "Không tìm thấy dữ liệu" hoặc báo lỗi kết nối. |
| **Luồng sự kiện chính** | 1. Sinh viên mở ứng dụng và chọn chức năng **Tra cứu Phòng**.<br>2. Hệ thống hiển thị giao diện tra cứu tổng hợp.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Xem phòng còn trống**.<br>- Extend Use Case **Xem kết quả xếp phòng**.<br>- Extend Use Case **Xem thông tin phòng ở hiện tại**. |
| **Luồng sự kiện phụ** | - Sinh viên chọn **Quay lại** hoặc thoát khỏi ứng dụng.<br>- Hệ thống đóng màn hình tra cứu. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Xem phòng còn trống
*   **Bước 1:** Sinh viên chưa có phòng chọn tính năng `Xem phòng trống` (thường dùng trước khi nộp đơn).
*   **Bước 2:** Hệ thống đọc giới tính của sinh viên từ hồ sơ cá nhân.
*   **Bước 3:** Hệ thống truy vấn CSDL, lọc ra các phòng thuộc các Tòa nhà/Tầng phù hợp với giới tính của sinh viên và có trạng thái là `AVAILABLE` (Trống).
*   **Bước 4:** Hệ thống nhóm dữ liệu và hiển thị danh sách phòng trống kèm giá tiền và số giường còn lại để sinh viên tham khảo.
> **Rẽ nhánh 1.1 (Không còn phòng):** 
> - *Bước 3.1:* Hệ thống truy vấn không ra kết quả (Ký túc xá đã kín chỗ cho giới tính này).
> - *Bước 4.1:* Hệ thống hiển thị thông báo "Hiện tại không có phòng trống phù hợp với bạn. Vui lòng quay lại sau".

#### 2. Xem kết quả xếp phòng
*   **Bước 1:** Sau khi nhận thông báo hồ sơ đăng ký được duyệt, sinh viên chọn tính năng `Kết quả xếp phòng`.
*   **Bước 2:** Hệ thống truy vấn bảng `StudentHousingAssignment` dựa trên ID hồ sơ (`applicationId`) của sinh viên.
*   **Bước 3:** Hệ thống hiển thị thông báo chi tiết: Tòa nhà, Tầng, Phòng, Số giường được phân bổ, kèm theo thời hạn yêu cầu sinh viên hoàn tất thanh toán và Check-in.
> **Rẽ nhánh 2.1 (Chưa được xếp phòng):**
> - *Bước 2.1:* Hệ thống không tìm thấy dữ liệu phân bổ (Admin chưa duyệt hoặc hệ thống chưa chạy thuật toán tự động).
> - *Bước 3.1:* Hiển thị thông báo "Hồ sơ của bạn đang trong quá trình chờ xếp phòng".

#### 3. Xem thông tin phòng ở hiện tại
*   **Bước 1:** Sinh viên đang lưu trú hợp lệ tại KTX chọn tính năng `Phòng của tôi`.
*   **Bước 2:** Hệ thống kiểm tra trạng thái lưu trú hiện tại (Active Assignment) của sinh viên.
*   **Bước 3:** Hệ thống truy vấn thông tin chi tiết của Phòng và danh sách các bạn cùng phòng (Roommates).
*   **Bước 4:** Hệ thống hiển thị thông tin: Mã phòng, Dịch vụ tiện ích trong phòng, và danh sách tên các bạn cùng phòng để tiện liên lạc.
> **Rẽ nhánh 3.1 (Hết hạn lưu trú / Đã trả phòng):**
> - *Bước 2.1:* Hệ thống phát hiện sinh viên không có hợp đồng lưu trú nào đang hiệu lực (Đã Check-out).
> - *Bước 3.1:* Hệ thống báo "Bạn không có dữ liệu phòng ở hiện tại" và chặn quyền truy cập tính năng này.
