# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 2: Cơ sở vật chất
### UC 2.2: Quản lý Phòng, Giường & Khóa thông minh

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản lý Phòng, Giường & Khóa thông minh** |
| **Actor** | Admin, Staff (chỉ quyền Xem/Đổi trạng thái) |
| **Mô tả** | Quản lý chi tiết hạ tầng lưu trú bao gồm danh sách Phòng, cấu hình Giường ngủ, và thiết lập Mã PIN cửa thông minh; giúp ban quản lý nắm bắt chính xác công suất và chuẩn bị hạ tầng đón sinh viên. |
| **Pre-conditions** | - Actor (Admin/Staff) phải đăng nhập thành công vào hệ thống và có quyền tương ứng. |
| **Post-conditions** | **Success:** Thông tin Phòng, Giường hoặc cấu hình Khóa thông minh được cập nhật an toàn vào CSDL.<br>**Fail:** Hệ thống hiển thị cảnh báo lỗi, dữ liệu CSDL được bảo toàn nguyên vẹn. |
| **Luồng sự kiện chính** | 1. Actor chọn chức năng **Quản lý Phòng & Giường**.<br>2. Hệ thống hiển thị danh sách Phòng thuộc các Tòa nhà/Tầng hiện có.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Tạo Phòng**.<br>- Extend Use Case **Xem danh sách Phòng**.<br>- Extend Use Case **Xem chi tiết Phòng**.<br>- Extend Use Case **Cập nhật Phòng**.<br>- Extend Use Case **Đổi trạng thái Phòng**.<br>- Extend Use Case **Xóa Phòng**.<br>- Extend Use Case **Tạo Giường thủ công**.<br>- Extend Use Case **Tự động sinh Giường**.<br>- Extend Use Case **Đổi trạng thái Giường**.<br>- Extend Use Case **Xóa Giường**.<br>- Extend Use Case **Quản lý Mã PIN cửa phòng**.<br>- Extend Use Case **Sinh PIN hàng loạt**. |
| **Luồng sự kiện phụ** | - Actor chọn **Quay lại** hoặc **Thoát**.<br>- Hệ thống hủy bỏ mọi thay đổi chưa lưu và quay về màn hình trước đó. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Tạo Phòng
*   **Bước 1:** Admin chọn `Thêm Phòng` trong một Tầng cụ thể.
*   **Bước 2:** Nhập Mã phòng (ví dụ: A1-101), Loại phòng (Thường/Dịch vụ), Sức chứa tối đa (Capacity) và Giá phòng.
*   **Bước 3:** Hệ thống kiểm tra dữ liệu đầu vào.
*   **Bước 4:** Admin chọn `Lưu`.
*   **Bước 5:** Hệ thống kiểm tra trùng lặp Mã phòng trong toàn Tòa nhà.
*   **Bước 6:** Tạo bản ghi Phòng mới trong CSDL (Trạng thái mặc định: *Trống*).
*   **Bước 7:** Hiển thị thông báo thành công.
> **Rẽ nhánh 1.1 (Trùng mã):** 
> - *Bước 5.1:* Mã phòng đã tồn tại.
> - *Bước 6.1:* Hệ thống báo lỗi và yêu cầu nhập mã khác.

#### 2. Xem danh sách Phòng
*   **Bước 1:** Actor truy cập menu quản lý.
*   **Bước 2:** Hệ thống truy vấn CSDL.
*   **Bước 3:** Hiển thị danh sách Phòng với thông tin tóm tắt: Trạng thái, Sức chứa, Số người đang ở hiện tại. Hỗ trợ lọc theo Tòa/Tầng.

#### 3. Xem chi tiết Phòng
*   **Bước 1:** Actor click vào một Phòng trong danh sách.
*   **Bước 2:** Hệ thống truy vấn CSDL lấy chi tiết Phòng, danh sách Giường bên trong, và dữ liệu Khóa cửa.
*   **Bước 3:** Hiển thị giao diện Dashboard nhỏ của riêng Phòng đó.

#### 4. Cập nhật Phòng
*   **Bước 1:** Admin chọn `Sửa` thông tin Phòng.
*   **Bước 2:** Sửa thông tin (Loại phòng, Giá phòng). Lưu ý: Không được sửa sức chứa xuống thấp hơn số sinh viên đang ở hiện hành.
*   **Bước 3:** Admin chọn `Lưu`.
*   **Bước 4:** Hệ thống xác thực ràng buộc và cập nhật CSDL.
> **Rẽ nhánh 4.1 (Xung đột sức chứa):**
> - *Bước 2.1:* Sức chứa mới nhỏ hơn số lượng giường "Đang sử dụng".
> - *Bước 3.1:* Hệ thống từ chối lưu và báo lỗi.

#### 5. Đổi trạng thái Phòng
*   **Bước 1:** Actor chọn chuyển trạng thái (Trống / Đầy / Bảo trì).
*   **Bước 2:** Hệ thống hiển thị hộp thoại xác nhận.
*   **Bước 3:** Actor xác nhận.
*   **Bước 4:** Nếu chuyển sang "Bảo trì", hệ thống kiểm tra xem có sinh viên nào đang ở không (nếu có phải thực hiện luồng Dời phòng trước).
*   **Bước 5:** Cập nhật trạng thái CSDL.

#### 6. Xóa Phòng
*   **Bước 1:** Admin chọn `Xóa` Phòng.
*   **Bước 2:** Hệ thống kiểm tra lịch sử lưu trú và các Hóa đơn điện nước gắn với Phòng này.
*   **Bước 3:** Nếu phòng sạch dữ liệu, tiến hành xóa (hoặc Soft Delete) toàn bộ Phòng và Giường trực thuộc.
> **Rẽ nhánh 6.1 (Tồn tại dữ liệu):**
> - *Bước 2.1:* Phát hiện lịch sử lưu trú.
> - *Bước 3.1:* Hệ thống báo lỗi và đề nghị chuyển sang trạng thái "Ngưng hoạt động" thay vì Xóa.

#### 7. Tạo Giường thủ công
*   **Bước 1:** Admin chọn Phòng và bấm `Thêm Giường`.
*   **Bước 2:** Nhập Mã giường (ví dụ: BED-1) và mô tả.
*   **Bước 3:** Hệ thống kiểm tra tổng số giường hiện tại có vượt quá Sức chứa (Capacity) của Phòng hay không.
*   **Bước 4:** Lưu thông tin Giường mới.
> **Rẽ nhánh 7.1 (Vượt sức chứa):**
> - *Bước 3.1:* Số giường đã đạt sức chứa tối đa của phòng.
> - *Bước 4.1:* Hệ thống từ chối tạo thêm.

#### 8. Tự động sinh Giường (Nghiệp vụ cốt lõi)
*   **Bước 1:** Admin bấm `Tạo giường tự động` cho một Phòng mới tinh.
*   **Bước 2:** Hệ thống tự động đọc Sức chứa (Capacity) của phòng (ví dụ: N).
*   **Bước 3:** Vòng lặp tự động generate N bản ghi Giường với mã định danh tuần tự (BED-1, BED-2... BED-N).
*   **Bước 4:** Batch insert vào CSDL để tối ưu hiệu năng.
*   **Bước 5:** Hiển thị thông báo "Tạo N giường thành công".

#### 9. Đổi trạng thái Giường
*   **Bước 1:** Actor chọn chuyển trạng thái Giường (Sẵn sàng / Đang sửa chữa).
*   **Bước 2:** Hệ thống kiểm tra Giường có đang bị "Gắn" với sinh viên nào không.
*   **Bước 3:** Cập nhật trạng thái.

#### 10. Xóa Giường
*   **Bước 1:** Admin chọn `Xóa` Giường.
*   **Bước 2:** Hệ thống kiểm tra ràng buộc. Nếu giường đang có sinh viên ở (Status = Occupied), tuyệt đối cấm xóa.
*   **Bước 3:** Xóa Giường khỏi CSDL.

#### 11. Quản lý Mã PIN cửa phòng
*   **Bước 1:** Admin chọn tab `Smart Lock` trong giao diện chi tiết Phòng.
*   **Bước 2:** Hệ thống gọi API để xem Mã PIN hiện tại hoặc chọn chức năng `Reset PIN`.
*   **Bước 3:** Nếu Reset, hệ thống sinh ra một dải số ngẫu nhiên 6 chữ số.
*   **Bước 4:** Ghi nhận mã PIN mới vào CSDL (băm Hash an toàn) và trả về giao diện cho Admin xem 1 lần duy nhất.

#### 12. Sinh PIN hàng loạt (Nghiệp vụ cốt lõi)
*   **Bước 1:** Admin chọn chức năng `Sinh PIN tự động` cho toàn bộ Tòa nhà hoặc Tầng mới.
*   **Bước 2:** Hệ thống lọc ra tất cả các Phòng chưa từng được cấp mã PIN.
*   **Bước 3:** Hệ thống chạy thuật toán tự động sinh và Hash mã PIN 6 số cho hàng loạt phòng cùng lúc.
*   **Bước 4:** Lưu batch update vào CSDL.
*   **Bước 5:** Báo cáo danh sách các phòng vừa được cấp PIN thành công.
