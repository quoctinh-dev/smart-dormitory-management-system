# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 3: Dịch vụ lưu trú
### UC 3.4: Quản lý Biến động Lưu trú

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản lý Biến động Lưu trú** |
| **Actor** | Sinh viên, Admin |
| **Mô tả** | Giải quyết các nhu cầu thay đổi trong quá trình ở của sinh viên: Nhu cầu tiếp tục ở thêm kỳ học mới (Gia hạn) hoặc đổi sang phòng khác (Chuyển phòng). |
| **Pre-conditions** | - Sinh viên đang có hợp đồng lưu trú hợp lệ (Trạng thái OCCUPIED). |
| **Post-conditions** | **Success:** Hợp đồng mới được tạo (gia hạn) hoặc sinh viên được gán vào phòng mới (chuyển phòng). Tài nguyên phòng cũ được tự động giải phóng nếu chuyển phòng.<br>**Fail:** Đơn bị từ chối do không hợp lệ hoặc nợ phí. |
| **Luồng sự kiện chính** | 1. Sinh viên vào phần Dịch vụ nội trú để nộp đơn (Gia hạn/Chuyển phòng).<br>2. Admin tiếp nhận, kiểm tra quỹ phòng (đối với Chuyển) và ra quyết định phê duyệt.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Nộp đơn gia hạn lưu trú**.<br>- Extend Use Case **Duyệt đơn gia hạn**.<br>- Extend Use Case **Nộp đơn xin chuyển phòng**.<br>- Extend Use Case **Duyệt đơn chuyển phòng**. |
| **Luồng sự kiện phụ** | - Hủy quá trình điền form. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Nộp đơn gia hạn lưu trú
*   **Bước 1:** Gần cuối kỳ, sinh viên truy cập chức năng `Đơn gia hạn`.
*   **Bước 2:** Hệ thống tự động kiểm tra công nợ (Hóa đơn điện nước, phạt...).
*   **Bước 3:** Nếu sinh viên không nợ phí, hệ thống cho phép chọn Kỳ/Năm học tiếp theo.
*   **Bước 4:** Bấm `Gửi`. Đơn gia hạn được lưu với trạng thái `PENDING`.
> **Rẽ nhánh 1.1 (Đang nợ tiền):** 
> - *Bước 2.1:* Hệ thống phát hiện có hóa đơn chưa thanh toán.
> - *Bước 3.1:* Hệ thống chặn và báo "Vui lòng thanh toán toàn bộ công nợ trước khi xin gia hạn".

#### 2. Duyệt đơn gia hạn
*   **Bước 1:** Admin vào danh sách đơn gia hạn, bấm `Phê duyệt`.
*   **Bước 2:** Hệ thống tự động tạo một Hợp đồng (Assignment) mới cho học kỳ tiếp theo, giữ nguyên Giường/Phòng hiện hành của sinh viên.
*   **Bước 3:** Tạo tự động Hóa đơn tiền phòng mới và gửi thông báo thanh toán cho sinh viên.

#### 3. Nộp đơn xin chuyển phòng
*   **Bước 1:** Sinh viên truy cập `Đơn chuyển phòng`.
*   **Bước 2:** Ghi rõ lý do muốn chuyển (Xung đột, đổi loại phòng) và chọn phòng nguyện vọng (tùy chọn).
*   **Bước 3:** Bấm `Gửi`. Đơn được lưu với trạng thái `PENDING`.

#### 4. Duyệt đơn chuyển phòng (Nghiệp vụ liên luồng cốt lõi)
*   **Bước 1:** Admin xem chi tiết đơn chuyển phòng và kiểm tra tình trạng quỹ phòng trống.
*   **Bước 2:** Nếu đồng ý, Admin bấm `Phê duyệt` và chọn một Giường/Phòng mới cho sinh viên.
*   **Bước 3:** Hệ thống đổi giường trong hợp đồng (Assignment) hiện tại sang Giường mới.
*   **Bước 4:** (Kích hoạt ngầm tự động): Hệ thống chạy tiến trình **Giải phóng Giường cũ** (Đổi trạng thái giường cũ thành AVAILABLE, giảm sĩ số phòng cũ).
*   **Bước 5:** (Kích hoạt ngầm tự động): Gọi sang module IoT để xóa FaceID/RFID ở phòng cũ và thêm quyền mở cửa vào phòng mới cho sinh viên.
*   **Bước 6:** Hoàn tất luồng chuyển phòng.
