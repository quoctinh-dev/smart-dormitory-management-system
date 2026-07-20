# STUDENT APP: GIAO DIỆN GỬI YÊU CẦU VÀO TRỄ (CURFEW REQUEST)

## 1. VISION
Cung cấp cho sinh viên một ứng dụng di động (Student App) để chủ động quản lý các ngoại lệ về an ninh. Khi sinh viên về khuya (sau giờ giới nghiêm) và bị hệ thống AI chặn tại cổng, họ không cần phải đập cửa hay gọi bảo vệ. Thay vào đó, họ mở Student App, gửi một "Yêu cầu vào trễ" (Curfew Request) tới hệ thống. Admin trực đêm sẽ nhận được thông báo, xác minh ảnh chụp từ thẻ (nếu có), và duyệt từ xa.

## 2. BUSINESS FLOW (LUỒNG NGHIỆP VỤ)
1. **Sinh viên:** Mở App -> Chọn mục "Smart Access" -> "Gửi Yêu cầu vào trễ".
2. **Form nhập liệu:**
   - Lý do về trễ (Dropdown: Đi làm thêm, Thực tập, Xe hỏng, Lý do khác...).
   - Giờ dự kiến có mặt tại cổng (Để admin biết và canh chừng).
   - Nội dung chi tiết (Textarea).
3. **Backend xử lý:** Lưu vào bảng `curfew_requests` với trạng thái `PENDING`.
4. **Admin xử lý:** Màn hình Dashboard Web của Admin (đã hoàn thiện) hiển thị yêu cầu -> Admin bấm **DUYỆT**.
5. **Thực thi:** Sinh viên nhận thông báo Push (hoặc trạng thái đổi sang APPROVED) -> Admin bắn lệnh Mở cổng.

## 3. IMPLEMENTATION ROADMAP
- **Phase 1 (Mobile Repo Initialization):** Tạo thư mục `sdms-mobile-app/` và định nghĩa `.agents/AGENTS.md` (chuẩn Flutter hoặc React Native).
- **Phase 2 (API Integration):** Khai báo service `CurfewRequestService` trong Mobile App để gọi POST `/api/v1/curfew-requests`.
- **Phase 3 (UI Design):** Thiết kế màn hình "Yêu cầu vào trễ" (Form, Validation, Lịch sử yêu cầu đã gửi).

---
## 4. TRIGGER PROMPT (LỆNH CHUYỂN GIAO CHO AGENT MOBILE)
*(Copy toàn bộ đoạn dưới đây và dán vào cửa sổ chat mới hoặc gọi Agent mới)*

```prompt
Bạn là Chuyên gia Mobile App (Flutter/React Native) của dự án Smart Dormitory Management System (SDMS).
Dựa trên kiến trúc Backend và API đã hoàn thiện, bạn hãy thực hiện các bước sau:

1. Khởi tạo Workspace: Kiểm tra xem thư mục `sdms-mobile-app/` đã tồn tại chưa. Nếu chưa, hãy tạo nó cùng với file `sdms-mobile-app/.agents/AGENTS.md` chứa luồng làm việc chuẩn của AI Agent khi code Mobile.
2. Tích hợp API: Tạo file kết nối HTTP gọi tới endpoint POST `/api/v1/curfew-requests` của Backend (để gửi Yêu cầu vào trễ).
3. Thiết kế Giao diện Sinh viên: 
   - Xây dựng một form UI đẹp mắt, hiện đại (Vibrant colors, Card Layout) cho phép Sinh viên nhập: Lý do về trễ (Select Box), Giờ dự kiến đến cổng (Time Picker), và Ghi chú thêm.
   - Thêm danh sách "Lịch sử Yêu cầu" để sinh viên có thể xem Yêu cầu của mình đang ở trạng thái PENDING, APPROVED, hay REJECTED.

Lưu ý: Mọi tài liệu thiết kế Mobile phải được lưu vào `sdms-mobile-app/docs/`. Hãy bắt đầu bằng cách khởi tạo thư mục và báo cáo lại cho tôi.
```
