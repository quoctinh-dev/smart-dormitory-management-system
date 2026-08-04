# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 4: Tài chính & Thanh toán
### UC 4.1: Quản lý Chỉ số Điện nước

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản lý Chỉ số Điện nước** |
| **Actor** | Admin, Staff |
| **Mô tả** | Hỗ trợ nhân viên Ban Quản lý KTX ghi nhận định kỳ chỉ số điện, nước tiêu thụ thực tế của từng phòng, làm cơ sở dữ liệu để hệ thống tự động tính toán và xuất hóa đơn dịch vụ hàng tháng. |
| **Pre-conditions** | - Actor (Admin/Staff) đã đăng nhập vào hệ thống quản trị. |
| **Post-conditions** | **Success:** Chỉ số tiêu thụ được lưu vào hệ thống, sẵn sàng cho việc chốt sổ và xuất hóa đơn.<br>**Fail:** Lỗi nhập liệu (VD: chỉ số mới nhỏ hơn chỉ số cũ), hệ thống không lưu. |
| **Luồng sự kiện chính** | 1. Actor chọn chức năng **Ghi chỉ số Điện Nước**.<br>2. Chọn Tòa nhà, Tầng và Phòng tương ứng.<br>3. Nhập dữ liệu và lưu.<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Ghi chỉ số điện định kỳ**.<br>- Extend Use Case **Xem chỉ số điện tất cả phòng**.<br>- Extend Use Case **Xóa chỉ số điện sai**. |
| **Luồng sự kiện phụ** | - Actor bấm **Hủy** trước khi lưu, form nhập liệu được làm sạch. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Ghi chỉ số điện định kỳ
*   **Bước 1:** Cán bộ đi chốt số điện chọn chức năng `Thêm chỉ số mới`.
*   **Bước 2:** Chọn Kỳ ghi nhận (VD: Tháng 10/2026), chọn Phòng.
*   **Bước 3:** Hệ thống tự động truy xuất và hiển thị **Chỉ số cũ** (của kỳ trước đó) để đối chiếu.
*   **Bước 4:** Cán bộ nhập **Chỉ số mới** (Điện/Nước).
*   **Bước 5:** Hệ thống kiểm tra ràng buộc: Chỉ số mới bắt buộc phải **lớn hơn hoặc bằng** Chỉ số cũ.
*   **Bước 6:** Bấm `Lưu`. Hệ thống ghi nhận vào CSDL.
> **Rẽ nhánh 1.1 (Sai logic chỉ số):**
> - *Bước 5.1:* Hệ thống phát hiện Chỉ số mới < Chỉ số cũ.
> - *Bước 6.1:* Hệ thống báo lỗi "Chỉ số mới không hợp lý, vui lòng kiểm tra lại đồng hồ". Cán bộ phải nhập lại.
> 
> **Rẽ nhánh 1.2 (Đã chốt sổ kỳ này):**
> - *Bước 5.2:* Hệ thống phát hiện phòng này đã được ghi chỉ số trong cùng kỳ.
> - *Bước 6.2:* Báo lỗi trùng lặp dữ liệu, yêu cầu sử dụng tính năng sửa/xóa nếu muốn ghi đè.

#### 2. Xem chỉ số điện tất cả phòng
*   **Bước 1:** Actor truy cập menu Quản lý điện nước.
*   **Bước 2:** Hệ thống truy vấn toàn bộ bản ghi, nhóm theo Kỳ/Tháng.
*   **Bước 3:** Hiển thị dưới dạng bảng tổng hợp: Phòng, Chỉ số cũ, Chỉ số mới, Mức tiêu thụ (Mới - Cũ), và Trạng thái (Đã xuất hóa đơn / Chưa xuất hóa đơn). Hỗ trợ lọc theo Tòa/Tầng.

#### 3. Xóa chỉ số điện sai
*   **Bước 1:** Cán bộ phát hiện nhập nhầm số (ví dụ đồng hồ là 105 nhưng gõ 150), bấm nút `Xóa` tại bản ghi bị sai.
*   **Bước 2:** Hệ thống kiểm tra xem bản ghi chỉ số này **Đã được dùng để xuất Hóa đơn chưa**.
*   **Bước 3:** Nếu chưa có Hóa đơn, hệ thống cho phép Xóa (hoặc Soft Delete).
*   **Bước 4:** Thông báo xóa thành công.
> **Rẽ nhánh 3.1 (Ràng buộc toàn vẹn Tài chính):**
> - *Bước 2.1:* Bản ghi đã được chốt và Hóa đơn đã được phát hành cho sinh viên.
> - *Bước 3.1:* Hệ thống **chặn đứng** thao tác xóa. Hiển thị thông báo: "Không thể xóa chỉ số vì Hóa đơn đã được tạo. Vui lòng Hủy hóa đơn trước khi sửa chỉ số". (Đây là quy tắc bất biến trong kế toán).
