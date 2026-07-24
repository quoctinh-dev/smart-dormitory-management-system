# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 3: Dịch vụ lưu trú
### UC 3.3: Quản lý Chuyển, Trả & Gia hạn phòng

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản lý Chuyển, Trả & Gia hạn phòng** |
| **Actor** | Sinh viên, Admin, Hệ thống |
| **Mô tả** | Quản lý toàn bộ vòng đời biến động lưu trú của sinh viên sau khi đã Check-in, bao gồm các nhu cầu đổi phòng, trả phòng trước hạn, xin gia hạn hợp đồng và quá trình hệ thống tự động giải phóng tài nguyên. |
| **Pre-conditions** | - Sinh viên đang có hợp đồng lưu trú hợp lệ (Trạng thái `OCCUPIED`). |
| **Post-conditions** | **Success:** Trạng thái lưu trú của sinh viên được cập nhật (phòng mới, gia hạn thêm thời gian, hoặc trả phòng), đồng thời Giường/Phòng cũ được tự động giải phóng (Available).<br>**Fail:** Đơn bị từ chối, sinh viên giữ nguyên trạng thái ở phòng cũ. |
| **Luồng sự kiện chính** | 1. Sinh viên chọn chức năng Dịch vụ KTX (Chuyển/Trả/Gia hạn).<br>2. Điền form yêu cầu tương ứng và submit.<br>3. Admin tiếp nhận, kiểm tra và ra quyết định phê duyệt.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Nộp đơn chuyển phòng**.<br>- Extend Use Case **Nộp đơn trả phòng**.<br>- Extend Use Case **Nộp đơn gia hạn lưu trú**.<br>- Extend Use Case **Duyệt đơn chuyển phòng**.<br>- Extend Use Case **Duyệt đơn trả phòng**.<br>- Extend Use Case **Duyệt đơn gia hạn**.<br>- Extend Use Case **Tự động giải phóng giường (Nghiệp vụ cốt lõi)**. |
| **Luồng sự kiện phụ** | - Sinh viên chọn **Hủy** quá trình điền đơn.<br>- Hệ thống hủy bỏ thao tác và quay về giao diện trước. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Nộp đơn chuyển phòng
*   **Bước 1:** Sinh viên truy cập `Đơn chuyển phòng`.
*   **Bước 2:** Nhập lý do muốn chuyển (VD: Xung đột sinh hoạt, nhu cầu đổi loại phòng) và chọn nguyện vọng phòng muốn chuyển đến (không bắt buộc).
*   **Bước 3:** Bấm `Gửi yêu cầu`.
*   **Bước 4:** Hệ thống ghi nhận đơn với trạng thái `PENDING` và thông báo cho Admin.

#### 2. Nộp đơn trả phòng
*   **Bước 1:** Sinh viên truy cập `Đơn trả phòng` (dành cho nhu cầu rời KTX trước thời hạn hợp đồng).
*   **Bước 2:** Chọn ngày dự kiến rời đi, điền thông tin tài khoản ngân hàng (để nhận lại tiền cọc nếu có), và lý do trả phòng.
*   **Bước 3:** Bấm `Gửi yêu cầu`.
*   **Bước 4:** CSDL ghi nhận đơn trả phòng `PENDING`.

#### 3. Nộp đơn gia hạn lưu trú
*   **Bước 1:** Khi gần hết kỳ, sinh viên truy cập `Đơn gia hạn`.
*   **Bước 2:** Hệ thống kiểm tra xem sinh viên có đang nợ tiền điện nước không.
*   **Bước 3:** Nếu không nợ, cho phép chọn Kỳ/Năm học tiếp theo muốn gia hạn.
*   **Bước 4:** Ghi nhận đơn gia hạn `PENDING`.
> **Rẽ nhánh 3.1 (Đang nợ phí):**
> - *Bước 2.1:* Hệ thống phát hiện sinh viên đang có Hóa đơn chưa thanh toán.
> - *Bước 3.1:* Hệ thống chặn thao tác và hiển thị cảnh báo "Vui lòng thanh toán mọi công nợ trước khi xin gia hạn".

#### 4. Duyệt đơn chuyển phòng
*   **Bước 1:** Admin xem chi tiết đơn xin chuyển phòng.
*   **Bước 2:** Admin kiểm tra quỹ phòng trống hiện tại thông qua hệ thống.
*   **Bước 3:** Nếu đồng ý, Admin bấm `Phê duyệt` và chọn một Giường mới cụ thể để gán cho sinh viên.
*   **Bước 4:** Cập nhật lại bản ghi Hợp đồng (Assignment) sang Giường mới.
*   **Bước 5:** Trigger tiến trình Tự động giải phóng giường cũ (Xem Extend 7).

#### 5. Duyệt đơn trả phòng
*   **Bước 1:** Admin tiếp nhận đơn trả phòng.
*   **Bước 2:** Cử nhân viên kiểm tra tình trạng tài sản tại phòng thực tế.
*   **Bước 3:** Admin bấm `Phê duyệt` đơn.
*   **Bước 4:** Hệ thống cập nhật Hợp đồng thành `COMPLETED` hoặc `TERMINATED`.
*   **Bước 5:** Trigger tiến trình Tự động giải phóng giường (Xem Extend 7).
> **Rẽ nhánh 5.1 (Từ chối duyệt do hỏng tài sản):**
> - *Bước 3.1:* Admin phát hiện hỏng tài sản chưa đền bù, chọn `Từ chối`.
> - *Bước 4.1:* Đơn bị Hủy, sinh viên phải khắc phục sự cố trước khi nộp lại đơn.

#### 6. Duyệt đơn gia hạn
*   **Bước 1:** Admin xem đơn gia hạn.
*   **Bước 2:** Bấm `Phê duyệt`.
*   **Bước 3:** Hệ thống tự động tạo một Hợp đồng (Assignment) mới cho kỳ học tiếp theo, nối tiếp thời gian lưu trú tại đúng Giường hiện tại.
*   **Bước 4:** Tạo tự động Hóa đơn tiền phòng mới.

#### 7. Tự động giải phóng giường & Thu hồi IoT (Nghiệp vụ cốt lõi)
*   **Bước 1:** Kích hoạt ngầm (Background Job) ngay khi một đơn Chuyển phòng hoặc Trả phòng được Duyệt thành công.
*   **Bước 2:** Hệ thống dò tìm bản ghi Giường (Bed) cũ mà sinh viên vừa rời đi.
*   **Bước 3:** Cập nhật trạng thái Giường từ `OCCUPIED` thành `AVAILABLE` (Trống).
*   **Bước 4:** Trừ đi 1 (Decrement) chỉ số "Số người đang ở" của Phòng tương ứng. Nếu Phòng đang từ trạng thái Đầy (`FULL`) thì tự động cập nhật về `AVAILABLE`.
*   **Bước 5:** Gọi hàm API nội bộ (Push message) sang Gateway của Phân hệ IoT để lập tức Xóa/Thu hồi quyền truy cập FaceID và mã thẻ RFID của sinh viên đối với thiết bị khóa cửa của Phòng cũ.
*   **Bước 6:** Ghi Log hệ thống "Tài nguyên đã được thu hồi an toàn".
