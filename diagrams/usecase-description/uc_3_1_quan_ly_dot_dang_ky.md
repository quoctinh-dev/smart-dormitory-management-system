# ĐẶC TẢ USE CASE CHI TIẾT

## Phân hệ 3: Dịch vụ lưu trú
### UC 3.1: Quản lý Đợt Đăng ký Nội trú (Admin)

| Thành phần | Nội dung |
| :--- | :--- |
| **Tên Use case** | **Quản lý Đợt Đăng ký Nội trú** |
| **Actor** | Admin, Staff |
| **Mô tả** | Hỗ trợ Ban Quản lý thiết lập các mốc thời gian mở/đóng cổng đăng ký nội trú theo từng học kỳ hoặc năm học. Đồng thời, cho phép nạp (import) danh sách sinh viên nằm trong diện ưu tiên hoặc đủ điều kiện để hệ thống tự động kiểm tra khi sinh viên nộp đơn. |
| **Pre-conditions** | - Actor (Admin/Staff) phải đăng nhập thành công vào hệ thống. |
| **Post-conditions** | **Success:** Đợt đăng ký mới được tạo, kích hoạt hoặc danh sách sinh viên đủ điều kiện được lưu vào CSDL.<br>**Fail:** Hệ thống hiển thị thông báo lỗi (sai định dạng, trùng lặp thời gian), dữ liệu CSDL được giữ nguyên. |
| **Luồng sự kiện chính** | 1. Actor chọn chức năng **Quản lý Đợt Đăng ký**.<br>2. Hệ thống hiển thị danh sách các đợt đăng ký (Đang mở, Sắp mở, Đã đóng).<br><br>_Các kịch bản mở rộng (Extend):_<br>- Extend Use Case **Tạo và kích hoạt đợt đăng ký**.<br>- Extend Use Case **Xem danh sách đợt đăng ký**.<br>- Extend Use Case **Cập nhật đợt đăng ký**.<br>- Extend Use Case **Import danh sách SV đủ điều kiện**. |
| **Luồng sự kiện phụ** | - Actor chọn **Quay lại** hoặc **Thoát**.<br>- Hệ thống hủy bỏ mọi thay đổi chưa lưu và quay về giao diện trước đó. |

---

### CÁC KỊCH BẢN MỞ RỘNG (EXTEND USE CASES)

#### 1. Tạo và kích hoạt đợt đăng ký
*   **Bước 1:** Admin chọn `Thêm đợt đăng ký`.
*   **Bước 2:** Nhập các thông tin: Tên đợt (VD: Đăng ký KTX Học kỳ 1 - 2024), Năm học, Học kỳ, Thời gian bắt đầu (Start Date), Thời gian kết thúc (End Date), và Đối tượng áp dụng.
*   **Bước 3:** Hệ thống kiểm tra logic thời gian (Start Date phải trước End Date, và không được trùng lặp/chồng chéo với một đợt đăng ký đang Active khác).
*   **Bước 4:** Admin chọn trạng thái khởi tạo (`DRAFT` - Bản nháp, hoặc `ACTIVE` - Mở ngay) và chọn `Lưu`.
*   **Bước 5:** Hệ thống cập nhật bản ghi vào CSDL.
*   **Bước 6:** Hiển thị thông báo thành công và làm mới danh sách.
> **Rẽ nhánh 1.1 (Lỗi logic thời gian):** 
> - *Bước 3.1:* Thời gian khai báo bị chồng chéo với một đợt `ACTIVE` đang tồn tại.
> - *Bước 4.1:* Hệ thống báo lỗi "Không thể có 2 đợt đăng ký cùng mở tại một thời điểm" và chặn lưu.

#### 2. Xem danh sách đợt đăng ký
*   **Bước 1:** Actor truy cập menu Quản lý Đợt đăng ký.
*   **Bước 2:** Hệ thống truy vấn CSDL, phân loại các đợt theo trạng thái (Đang mở, Sắp mở, Đã đóng).
*   **Bước 3:** Hiển thị danh sách dưới dạng bảng, hỗ trợ tìm kiếm theo Học kỳ/Năm học và xem nhanh số lượng sinh viên đã nộp đơn trong từng đợt.

#### 3. Cập nhật đợt đăng ký
*   **Bước 1:** Admin chọn `Sửa` tại một đợt đăng ký chưa kết thúc.
*   **Bước 2:** Sửa thông tin (có thể kéo dài thời gian End Date hoặc đổi tên đợt).
*   **Bước 3:** Hệ thống kiểm tra ràng buộc. Nếu đợt đã ở trạng thái `ACTIVE` và đã có sinh viên nộp đơn, tuyệt đối không cho phép đổi Thời gian bắt đầu (Start Date).
*   **Bước 4:** Admin chọn `Lưu`.
*   **Bước 5:** Hệ thống ghi nhận cập nhật và báo thành công.
> **Rẽ nhánh 3.1 (Lỗi sửa đổi dữ liệu đã chạy):**
> - *Bước 3.1:* Admin cố tình sửa Start Date của đợt đang mở và đã có đơn.
> - *Bước 4.1:* Hệ thống chặn thao tác và cảnh báo "Chỉ được phép gia hạn ngày kết thúc, không được sửa ngày bắt đầu".

#### 4. Import danh sách SV đủ điều kiện (Nghiệp vụ cốt lõi)
*   **Bước 1:** Admin click chọn `Import danh sách ưu tiên` tại một đợt đăng ký.
*   **Bước 2:** Hệ thống hiển thị hộp thoại Upload, cung cấp nút tải File Excel mẫu.
*   **Bước 3:** Admin chọn file Excel chứa danh sách MSSV (hoặc số báo danh) đủ điều kiện nội trú và bấm `Tải lên`.
*   **Bước 4:** Hệ thống đọc file Excel và Validate từng dòng (kiểm tra chuẩn định dạng, kiểm tra MSSV có thực sự tồn tại trong CSDL Trường hay không).
*   **Bước 5:** Nếu dữ liệu hợp lệ, hệ thống thực hiện Batch Insert danh sách này vào bảng `RegistrationEligibility` gắn với ID của đợt đăng ký tương ứng.
*   **Bước 6:** Hiển thị báo cáo chi tiết: "Import thành công X dòng, thất bại Y dòng (kèm file log lỗi)".
> **Rẽ nhánh 4.1 (File Excel sai chuẩn):**
> - *Bước 4.1:* Hệ thống phát hiện file sai định dạng (không phải .xlsx/.xls) hoặc sai cấu trúc cột so với file mẫu.
> - *Bước 5.1:* Hệ thống hủy quá trình đọc, báo lỗi "File không đúng định dạng mẫu" và yêu cầu tải lại.
