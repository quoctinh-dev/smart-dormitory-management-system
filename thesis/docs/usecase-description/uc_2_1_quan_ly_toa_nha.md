# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 2: Cơ sở vật chất
### UC 2.1: Quản lý Tòa nhà & Tầng

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản lý Tòa nhà & Tầng** |
| **Actor** | Admin, Staff (chỉ quyền Xem/Đổi trạng thái) |
| **Mô tả** | Quản lý kiến trúc vật lý của ký túc xá, bao gồm thông tin Tòa nhà và cấu trúc Tầng; hỗ trợ Admin thiết lập dữ liệu ban đầu và Staff theo dõi trạng thái hoạt động. |
| **Pre-conditions** | - Actor (Admin/Staff) phải đăng nhập thành công vào hệ thống và được phân quyền hợp lệ. |
| **Post-conditions** | **Success:** Thông tin Tòa nhà và Tầng được lưu trữ, cập nhật hoặc xóa thành công trong CSDL.<br>**Fail:** Hệ thống hiển thị thông báo lỗi, dữ liệu trong CSDL giữ nguyên trạng thái ban đầu. |
| **Luồng sự kiện chính** | 1. Actor chọn chức năng **Quản lý Tòa nhà & Tầng**.<br>2. Hệ thống hiển thị danh sách Tòa nhà hiện có.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Tạo Tòa nhà**.<br>- Extend Use Case **Xem danh sách Tòa nhà**.<br>- Extend Use Case **Cập nhật Tòa nhà**.<br>- Extend Use Case **Đổi trạng thái Tòa nhà**.<br>- Extend Use Case **Xóa Tòa nhà**.<br>- Extend Use Case **Tạo Tầng**.<br>- Extend Use Case **Xem danh sách Tầng**.<br>- Extend Use Case **Cập nhật Tầng**.<br>- Extend Use Case **Xóa Tầng**. |
| **Luồng sự kiện phụ** | - Actor chọn **Quay lại** hoặc **Thoát**.<br>- Hệ thống hủy bỏ thao tác hiện tại và quay về màn hình danh sách trước đó. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Tạo Tòa nhà
*   **Bước 1:** Admin chọn `Thêm Tòa nhà`.
*   **Bước 2:** Nhập các thông tin bắt buộc: Mã Tòa nhà, Tên Tòa nhà, Mô tả và Trạng thái hoạt động.
*   **Bước 3:** Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào.
*   **Bước 4:** Admin chọn `Lưu`.
*   **Bước 5:** Hệ thống kiểm tra xem Mã Tòa nhà đã tồn tại chưa.
*   **Bước 6:** Cập nhật bản ghi mới vào CSDL.
*   **Bước 7:** Hệ thống hiển thị thông báo tạo thành công và làm mới danh sách.
> **Rẽ nhánh 1.1 (Lỗi trùng mã):** 
> - *Bước 5.1:* Mã Tòa nhà đã tồn tại.
> - *Bước 6.1:* Hệ thống báo lỗi trùng lặp và yêu cầu Admin nhập mã khác (quay lại bước 2).

#### 2. Xem danh sách Tòa nhà
*   **Bước 1:** Actor chọn menu `Tòa nhà & Tầng`.
*   **Bước 2:** Hệ thống truy vấn CSDL để lấy toàn bộ danh sách Tòa nhà.
*   **Bước 3:** Hệ thống hiển thị danh sách Tòa nhà kèm các thông tin tổng quan (Trạng thái, số tầng, tổng sức chứa), hỗ trợ phân trang và lọc.

#### 3. Cập nhật Tòa nhà
*   **Bước 1:** Admin chọn nút `Sửa` tại một Tòa nhà cụ thể.
*   **Bước 2:** Cập nhật các thông tin cho phép thay đổi (Tên, Mô tả).
*   **Bước 3:** Admin chọn `Lưu`.
*   **Bước 4:** Hệ thống ghi nhận cập nhật vào CSDL, hiển thị thông báo thành công và làm mới dữ liệu.

#### 4. Đổi trạng thái Tòa nhà
*   **Bước 1:** Actor click vào toggle chuyển trạng thái (Hoạt động / Bảo trì).
*   **Bước 2:** Hệ thống hiển thị hộp thoại xác nhận hành động.
*   **Bước 3:** Actor chọn `Xác nhận`.
*   **Bước 4:** Hệ thống cập nhật trạng thái mới vào CSDL và phát đi cảnh báo trên Dashboard nếu Tòa nhà chuyển sang bảo trì.

#### 5. Xóa Tòa nhà
*   **Bước 1:** Admin chọn nút `Xóa` tại một Tòa nhà.
*   **Bước 2:** Hệ thống hiển thị hộp thoại cảnh báo nguy hiểm.
*   **Bước 3:** Admin chọn `Xác nhận`.
*   **Bước 4:** Hệ thống kiểm tra các ràng buộc dữ liệu (Tòa nhà có đang chứa Tầng/Phòng/Sinh viên hay không).
*   **Bước 5:** Thực hiện xóa mềm (Soft Delete) Tòa nhà cùng toàn bộ Tầng và Phòng trực thuộc.
*   **Bước 6:** Hiển thị thông báo thành công.
> **Rẽ nhánh 5.1 (Ràng buộc dữ liệu):**
> - *Bước 4.1:* Hệ thống phát hiện Tòa nhà đã có lịch sử lưu trú của sinh viên.
> - *Bước 5.1:* Hệ thống từ chối thao tác xóa và yêu cầu Admin sử dụng chức năng `Đổi trạng thái` sang "Ngưng hoạt động". Kết thúc Use Case.

#### 6. Tạo Tầng
*   **Bước 1:** Admin chọn một Tòa nhà và bấm `Thêm Tầng`.
*   **Bước 2:** Nhập Số thứ tự Tầng và Giới tính áp dụng (Nam/Nữ).
*   **Bước 3:** Hệ thống kiểm tra xem số tầng này đã tồn tại trong Tòa nhà chưa.
*   **Bước 4:** Admin chọn `Lưu` và hệ thống cập nhật vào CSDL.
> **Rẽ nhánh 6.1 (Lỗi trùng số tầng):**
> - *Bước 3.1:* Số tầng đã tồn tại trong cùng Tòa nhà.
> - *Bước 4.1:* Hệ thống thông báo lỗi và yêu cầu nhập số tầng khác.

#### 7. Xem danh sách Tầng
*   **Bước 1:** Actor click vào tên một Tòa nhà để xem chi tiết.
*   **Bước 2:** Hệ thống truy vấn danh sách các Tầng thuộc Tòa nhà đó.
*   **Bước 3:** Hiển thị danh sách Tầng cùng với quy định giới tính và tổng số phòng trên mỗi tầng.

#### 8. Cập nhật Tầng
*   **Bước 1:** Admin chọn nút `Sửa` tại một Tầng cụ thể.
*   **Bước 2:** Thay đổi thông tin (ví dụ: Quy định giới tính Nam/Nữ).
*   **Bước 3:** Hệ thống kiểm tra các ràng buộc logic (Kiểm tra xem có sinh viên nào đang lưu trú tại tầng đó bị xung đột giới tính không).
*   **Bước 4:** Admin chọn `Lưu` và CSDL được cập nhật.
> **Rẽ nhánh 8.1 (Lỗi xung đột giới tính):**
> - *Bước 3.1:* Phát hiện có sinh viên không phù hợp với quy định giới tính mới.
> - *Bước 4.1:* Hệ thống từ chối cập nhật và hiển thị thông báo lỗi chi tiết.

#### 9. Xóa Tầng
*   **Bước 1:** Admin chọn nút `Xóa` tại một Tầng.
*   **Bước 2:** Hệ thống kiểm tra lịch sử lưu trú của các phòng thuộc tầng đó.
*   **Bước 3:** Nếu an toàn, tiến hành xóa (Soft Delete) Tầng và toàn bộ các Phòng trực thuộc.
> **Rẽ nhánh 9.1 (Ràng buộc dữ liệu):**
> - *Bước 2.1:* Tầng đã có dữ liệu lưu trú.
> - *Bước 3.1:* Hệ thống chặn thao tác xóa và báo lỗi. Kết thúc Use Case.
