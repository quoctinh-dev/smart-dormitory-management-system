# PROMPT CHO WRITING AI: VIẾT BẢNG ĐẶC TẢ USE CASE CHI TIẾT (18 BẢNG THEO CHUẨN EXTEND)

**Vai trò của bạn:** Writing AI (Vỹ) - Technical Writer.

**Nhiệm vụ:** 
Dựa vào file `FEATURE_MAP.md` (chứa 18 Use Case Lớn và 97 chức năng con), hãy viết nội dung phần **"3.4.1. Đặc tả Use case chi tiết"** cho Chương 3.

**Yêu cầu nghiêm ngặt:**
1. **Cấu trúc 18 Bảng Đặc Tả:** Hệ thống có 18 Use Case Lớn, do đó bạn phải viết đúng **18 Bảng Đặc tả** (Specification Tables). Không gộp chung, không viết tắt.
2. **Sử dụng Template chuẩn:** Mỗi bảng BẮT BUỘC phải tuân thủ chính xác định dạng học thuật sau:
   - **Tên Use case:** [Tên UC Lớn, ví dụ: Quản lý Tòa nhà & Tầng]
   - **Actor:** [Admin / Sinh viên]
   - **Mô tả:** [Mô tả ngắn gọn]
   - **Pre-conditions:** [Điều kiện tiên quyết]
   - **Post-conditions:** [Success / Fail]
   - **Luồng sự kiện chính:** 
     - Actor chọn chức năng [Tên UC Lớn].
     - Hệ thống hiển thị màn hình [Tên màn hình].
     - Extend Use Case [Tên chức năng con 1]
     - Extend Use Case [Tên chức năng con 2]
     - ...
   - **Luồng sự kiện phụ:** [Các thao tác Thoát, Hủy, Quay lại...]
   - **<Extend Use Case> [Tên chức năng con 1]:**
     - [Liệt kê chi tiết các bước thực hiện. Ví dụ: Actor nhập thông tin -> Kiểm tra hợp lệ -> Nhấn lưu -> Cập nhật CSDL -> Hiển thị kết quả].
     - Rẽ nhánh 1: [Trường hợp lỗi rỗng...]
     - Rẽ nhánh 2: [Trường hợp lỗi trùng lặp...]
   - **<Extend Use Case> [Tên chức năng con 2]:**
     - [Tương tự cho các chức năng tiếp theo...]

3. **Bao phủ 100% (97 chức năng):** Các chức năng con (CRUD hay Nghiệp vụ) nằm dưới mỗi UC Lớn trong file `FEATURE_MAP.md` **CHÍNH LÀ các `<Extend Use Case>`**. Bạn phải biến tất cả 97 chức năng con này thành các block `<Extend Use Case>` nằm bên trong 18 Bảng tương ứng. Tuyệt đối không được bỏ sót chức năng nào.
4. **Phân tách Rõ Ràng:** Định dạng Markdown bằng bảng (table) hoặc danh sách (list) lồng nhau thật rõ ràng để sinh viên dễ dàng copy-paste thẳng vào file Word đồ án. Do khối lượng cực lớn, bạn có thể được yêu cầu xuất ra thành nhiều file hoặc viết theo từng Phân hệ.

**Dữ liệu đầu vào cần đọc:** 
Hãy đọc file `docs/FEATURE_MAP.md` để lấy danh sách 18 Use Case Lớn và 97 chức năng con.
