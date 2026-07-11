# MODULE CẤU HÌNH ĐỢT ĐĂNG KÝ VÀ KIỂM SOÁT ĐIỀU KIỆN (REGISTRATION PERIOD & ELIGIBILITY MANAGER)

## 1. Giới thiệu Module (Module Overview)
Đây là module cốt lõi dành cho **Ban Quản lý (Admin)**, đóng vai trò như một chiếc "Van kiểm soát" luồng dữ liệu đầu vào của toàn bộ Ký túc xá. Module không chỉ giúp định nghĩa khung thời gian của các đợt lưu trú (Học kỳ 1, Học kỳ 2, Hè...) mà còn giải quyết bài toán chống "Spam rác" thông qua cơ chế Whitelist (Danh sách đủ điều kiện) nạp vào từ hệ thống của Trường (University ERP).

## 2. Thiết kế Cơ sở dữ liệu (Database Design)
Hệ thống sử dụng 2 thực thể (Entity) chính có mối quan hệ 1-N:

### 2.1. Bảng `registration_periods` (Đợt đăng ký)
- **Nhiệm vụ:** Lưu trữ các mốc thời gian quan trọng (`startDate`, `endDate` cho việc nộp đơn và `stayStartDate`, `stayEndDate` cho hợp đồng lưu trú).
- **Ràng buộc nghiệp vụ (Business Constraint):** Tại một thời điểm, chỉ cho phép **Duyệt một Đợt ở trạng thái Active**. Khi Admin kích hoạt một đợt mới, hệ thống tự động cảnh báo vô hiệu hóa các đợt cũ, tránh tình trạng sinh viên nộp nhầm đợt.

### 2.2. Bảng `registration_eligibilities` (Danh sách Whitelist)
- **Nhiệm vụ:** Hoạt động như một bộ lọc (Filter). Chỉ những sinh viên có thông tin nằm trong bảng này mới được phép điền form đăng ký KTX.
- **Tối ưu hóa Khóa chính kép (Composite Unique Constraint):** Áp dụng `@UniqueConstraint(columnNames = {"period_id", "cccd"})` ở cấp độ Database để đảm bảo tính toàn vẹn dữ liệu, ngăn chặn tuyệt đối một sinh viên bị import trùng lặp hai lần trong cùng một đợt.

## 3. Kiến trúc Hệ thống & Điểm nhấn Kỹ thuật (Technical Highlights)

### 3.1. Thuật toán Import Excel (Batch Processing)
Khi Admin tải lên file `.xlsx` chứa hàng ngàn sinh viên ưu tiên, Backend (`RegistrationEligibilityService`) sử dụng thư viện **Apache POI** kết hợp thuật toán tối ưu:
- **Set Lookup:** Thay vì query Database để check trùng lặp từng dòng một (N+1 Query Problem), hệ thống load toàn bộ CCCD đã tồn tại của đợt đó lên một bộ nhớ tạm (`Set<String> existingCccds`). Tốc độ tra cứu là O(1), giúp việc import 5.000 dòng chỉ mất chưa tới 2 giây.
- **Thống kê chi tiết:** Trả về chính xác số lượng `imported` (thêm mới), `skipped` (bỏ qua do trùng lặp) giúp Admin kiểm soát tính toàn vẹn dữ liệu.

### 3.2. Cơ sở dữ liệu Đồng nhất hóa (Single Source of Truth)
- Đã nâng cấp luồng dữ liệu để nhận diện bằng **Mã số sinh viên (studentCode)** bên cạnh số CCCD.
- Sự kết hợp này mang tính thực tiễn cao, giúp luận văn chứng minh được khả năng tích hợp linh hoạt (Native Integration) giữa Hệ thống KTX và Cổng thông tin Quản lý Đào tạo của Trường Đại học.

### 3.3. Tối ưu hóa UI/UX và Phân trang (Pagination)
- **Bảo vệ Runtime (Safe UX):** Các hành động nhạy cảm như "Xóa sinh viên khỏi whitelist" hay "Chuyển trạng thái đợt đăng ký" đều được bảo vệ bằng Dialog Confirm (Hộp thoại xác nhận) để ngăn chặn rủi ro thao tác nhầm của con người (Human Error).
- **Server-Side Pagination:** Bảng hiển thị danh sách hàng ngàn sinh viên Whitelist không load một lần mà dùng Pagination đẩy từ Database qua `PageResponse<T>`, tiết kiệm băng thông mạng và RAM cho trình duyệt.

## 4. Tầm quan trọng đối với Luận văn
Phân hệ này thể hiện tư duy thiết kế phần mềm trưởng thành: Không chỉ quan tâm đến việc sinh viên nộp đơn ra sao, mà còn tính toán đến bài toán vận hành (Operation) của ban quản lý. Giải quyết được bài toán **Toàn vẹn dữ liệu (Data Integrity)** trước khi dữ liệu rác kịp xâm nhập vào phần lõi của hệ thống thông qua hệ thống Whitelist/Blacklist.
