# THIẾT KẾ GIAO DIỆN & ĐIỀU HƯỚNG APP NHÂN VIÊN KTX (STAFF APP WIREFRAME)

## Triết lý thiết kế (Mobile-first UX)
Nhân viên (Bảo vệ, Quản lý tòa nhà, Thợ bảo trì) thường xuyên di chuyển, thao tác ngoài trời và ít khi rảnh tay. Do đó, giao diện (UI) phải to, rõ ràng, ít chữ, và điều hướng (Navigation) phải cực kỳ nông (Nhiều nhất là 2 lần chạm để đến được chức năng).

---

## CẤU TRÚC ĐIỀU HƯỚNG CHÍNH (BOTTOM NAVIGATION BAR)
Sử dụng thanh điều hướng 4 Tab dưới đáy màn hình, trong đó Tab "Scanner" được làm nổi bật thành nút tròn to ở giữa (Floating Action Button).

`[ Trang chủ ] --- [ Cửa & IoT ] --- ( [ QUÉT QR ] ) --- [ Sự cố ] --- [ Cá nhân ]`

### 1. Tab Trang chủ (Home / Dashboard)
*Mục đích: Tóm tắt tình hình KTX trong ngày.*
- **Header:** Lời chào + Tên nhân viên (VD: Xin chào Chú Hùng bảo vệ!).
- **Quick Stats (Thẻ thống kê nhanh):**
  - Số sinh viên đã Check-in hôm nay.
  - Số sự cố cơ sở vật chất đang chờ xử lý.
- **Quick Actions (Các nút thao tác nhanh):**
  - Nút "Danh sách sinh viên vắng mặt" (Dùng lúc điểm danh ban đêm).
  - Nút "Duyệt đơn khẩn cấp" (Chỉ hiện khi có đơn xin ra ngoài trễ giờ).

### 2. Nút QUÉT QR (Scanner - Đặt giữa, to nhất)
*Mục đích: Công cụ "Kiếm cơm" hàng ngày của nhân viên.*
- Bấm vào là **mở Camera ngay lập tức** (Không qua màn hình trung gian).
- **Luồng xử lý UX:**
  1. Đưa Camera vào QR Code của sinh viên.
  2. Máy rung nhẹ "Bíp".
  3. Hiện bảng Bottom Sheet (Kéo từ dưới lên) chứa thông tin:
     - ẢNH THẬT CỦA SINH VIÊN (Để bảo vệ nhìn mặt đối chiếu chống quét hộ).
     - Tên, Mã SV, Phòng đang ở.
     - Trạng thái nợ phí (Nếu hiện màu Đỏ báo nợ phí -> Cảnh báo).
  4. Có 2 nút to đùng: `Xác nhận Check-in` / `Xác nhận Check-out`. Bấm xong Bottom Sheet tự cụp xuống để quét người tiếp theo.

### 3. Tab Cửa & IoT (Smart Gate Control)
*Mục đích: Trạm điều khiển từ xa như một cái Remote.*
- **Trạng thái:** Dòng chữ xanh/đỏ báo hiệu Cổng đang Mở hay Đóng. Ảnh chụp từ Camera cổng (nếu có).
- **Bảng điều khiển (Control Panel):** Gồm các nút to, màu sắc kích thích thị giác:
  - Nút 🔵 **MỞ CỬA TẠM THỜI (5s):** Dùng khi sinh viên quên mang thẻ, bảo vệ nhận diện mặt quen và bấm mở qua app.
  - Nút 🔴 **KÍCH HOẠT GIỚI NGHIÊM (Lockdown):** Chỉ Admin mới thấy. Bấm phát là khóa cứng cổng, sinh viên có quẹt thẻ đúng cũng không vào được. Phải yêu cầu xác nhận 2 lớp (Trượt để khóa).
  - Nút 🟢 **SƠ TÁN KHẨN CẤP (Evacuation):** Mở toang toàn bộ cổng khi có cháy. Yêu cầu nhập mã PIN nhân viên để kích hoạt chống bấm nhầm.
- **Log Mini:** Danh sách 5 sinh viên vừa quét mặt/quẹt thẻ vào cổng thành công gần nhất.

### 4. Tab Sự cố (Maintenance Tasks)
*Mục đích: Dành cho đội kỹ thuật / bảo trì tòa nhà.*
- **Danh sách Ticket:** Các báo cáo hư hỏng từ App Sinh viên đổ về. (VD: "Phòng 102 - Cháy bóng đèn").
- **Luồng làm việc (Work flow):**
  1. Thợ bảo trì mở App, nhận Task. Trạng thái đổi thành "Đang xử lý".
  2. Lên phòng thay bóng đèn xong, mở App ra chụp hình cái bóng đèn đang sáng.
  3. Bấm "Hoàn tất". Hệ thống tự bắn Notif về App của sinh viên phòng đó báo là "Đã sửa xong".

### 5. Tab Cá nhân (Profile & Settings)
- Tên nhân viên, ca trực hiện tại.
- Nút báo cáo kết thúc ca trực.
- Đăng xuất.
