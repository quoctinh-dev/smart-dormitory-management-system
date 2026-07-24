# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 5: An ninh thông minh IoT
### UC 5.2: Quản trị Dữ liệu Sinh trắc học (Biometrics)

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản trị Dữ liệu Sinh trắc học (Biometrics)** |
| **Actor** | Sinh viên, Admin |
| **Mô tả** | Cung cấp luồng nghiệp vụ để thu thập, phê duyệt và đồng bộ hóa khuôn mặt (Face ID) của sinh viên xuống các thiết bị kiểm soát ra vào, đảm bảo tính chính xác, an toàn và bảo mật thông tin sinh trắc học. |
| **Pre-conditions** | - Sinh viên đã được gán phòng thành công (Có hợp đồng lưu trú). |
| **Post-conditions** | **Success:** Khuôn mặt được phê duyệt, huấn luyện mô hình (Training) và đẩy xuống hệ thống quét thông minh.<br>**Fail:** Ảnh bị từ chối do chất lượng kém hoặc sai quy chuẩn. |
| **Luồng sự kiện chính** | 1. Sinh viên upload dữ liệu khuôn mặt lên hệ thống.<br>2. Admin xem xét và duyệt ảnh.<br>3. Hệ thống xử lý ảnh và đồng bộ xuống Gateway.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Đăng ký Face ID (SV)**.<br>- Extend Use Case **Yêu cầu thay ảnh Face ID (SV)**.<br>- Extend Use Case **Xem trạng thái Face ID (SV)**.<br>- Extend Use Case **Duyệt đăng ký Face ID (Admin)**.<br>- Extend Use Case **Thu hồi Face ID (Admin)**. |
| **Luồng sự kiện phụ** | - Hủy thao tác Upload khi chưa bấm gửi. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Đăng ký Face ID (SV)
*   **Bước 1:** Sinh viên truy cập ứng dụng, vào phần `Quản lý Face ID`.
*   **Bước 2:** Chọn chức năng `Đăng ký khuôn mặt`. Hệ thống hiển thị hướng dẫn chụp ảnh (Không đeo kính, đủ sáng).
*   **Bước 3:** Sinh viên upload hoặc chụp trực tiếp 1 ảnh chính diện rõ nét.
*   **Bước 4:** Hệ thống (Frontend) có thể dùng thư viện nhỏ để detect xem trong ảnh có khuôn mặt hay không.
*   **Bước 5:** Bấm `Gửi`. Dữ liệu được lưu với trạng thái `PENDING`.

#### 2. Yêu cầu thay ảnh Face ID (SV)
*   **Bước 1:** Nếu khuôn mặt thay đổi đáng kể (phẫu thuật, cắt tóc, tai nạn...), sinh viên chọn `Cập nhật Face ID`.
*   **Bước 2:** Hệ thống yêu cầu nhập lý do.
*   **Bước 3:** Upload ảnh mới và gửi chờ duyệt tương tự Bước 1.

#### 3. Xem trạng thái Face ID (SV)
*   **Bước 1:** Sinh viên mở màn hình `Quản lý Face ID`.
*   **Bước 2:** Xem trực tiếp trạng thái hiện hành: `CHƯA ĐĂNG KÝ`, `ĐANG CHỜ DUYỆT` (Pending), `ĐÃ DUYỆT` (Active), hoặc `BỊ TỪ CHỐI` (Rejected - kèm lý do để chụp lại).

#### 4. Duyệt đăng ký Face ID (Nghiệp vụ cốt lõi - Admin)
*   **Bước 1:** Admin vào danh sách `Đăng ký Sinh trắc học`.
*   **Bước 2:** So sánh ảnh vừa upload với ảnh hồ sơ/CCCD lưu trong hệ thống.
*   **Bước 3:** Nếu hợp lệ, bấm `Phê duyệt`.
*   **Bước 4:** Hệ thống gọi một API ngầm để xử lý ảnh (Extract vector đặc trưng) và đẩy thông tin (Gồm Vector Face + MSSV) xuống Database của Module AI Camera / Gateway tại cửa phòng sinh viên đó.
*   **Bước 5:** Đổi trạng thái thành `ACTIVE`. Gửi thông báo cho sinh viên.
> **Rẽ nhánh 4.1 (Ảnh không hợp lệ):**
> - *Bước 3.1:* Admin phát hiện ảnh bị nhòe, đeo khẩu trang, hoặc dùng ảnh giả.
> - *Bước 4.1:* Bấm `Từ chối`, nhập lý do "Ảnh không rõ mặt". Hệ thống đổi trạng thái thành `REJECTED`.

#### 5. Thu hồi Face ID (Admin)
*   **Bước 1:** Khi có sự cố bảo mật hoặc sinh viên có dấu hiệu gian lận thẻ/khuôn mặt, Admin có thể thao tác `Thu hồi Face ID` khẩn cấp.
*   **Bước 2:** Hệ thống lập tức đổi trạng thái Face ID thành `REVOKED`.
*   **Bước 3:** Bắn lệnh trực tiếp xuống Gateway và AI Camera để lập tức xóa Vector khuôn mặt của sinh viên này khỏi bộ nhớ Cache của thiết bị. Sinh viên không thể dùng mặt để mở cửa được nữa.
