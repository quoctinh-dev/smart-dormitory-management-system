# FEATURE ROADMAP: 002 - DASHBOARD TỔNG HỢP & QUẢN LÝ GIỜ GIỚI NGHIÊM

## 1. Vision (Tầm nhìn)
Admin cần một trung tâm kiểm soát (Dashboard) bao quát toàn bộ hoạt động của KTX (Bao nhiêu sinh viên đang ở trong, bao nhiêu đang ở ngoài, tỷ lệ lấp đầy phòng, v.v.) qua các biểu đồ trực quan. Đồng thời, giải quyết nghiệp vụ thực tế: Sinh viên về trễ giờ giới nghiêm (Curfew) hoặc qua đêm bên ngoài phải có tính năng gửi yêu cầu/giải trình cho Admin. Admin có thể xem xét và "mở cổng từ xa" trực tiếp trên giao diện xử lý yêu cầu.

## 2. Business Flow (Luồng nghiệp vụ)
1. **Lọc thông minh (Smart Access):** Trang Lịch sử ra vào được bổ sung các bộ lọc (Ngày tháng, Cổng, Trạng thái Thành công/Thất bại) để dễ dàng tra cứu.
2. **Kiểm soát Hiện diện (Attendance & Curfew):** 
   - Hệ thống dựa vào lịch sử quét thẻ/khuôn mặt (IN/OUT) để biết sinh viên đang ở trong hay ngoài KTX.
   - Khi tới giờ giới nghiêm (ví dụ 23:00), sinh viên đang ở ngoài sẽ bị đánh dấu "Vi phạm giờ giới nghiêm".
   - Sinh viên về trễ quẹt thẻ sẽ bị "DENIED". Lúc này, trên app/web sinh viên có tính năng "Gửi Yêu Cầu Xin Vào Trễ" kèm lý do.
3. **Xử lý Yêu cầu (Admin View):** 
   - Yêu cầu xin vào trễ sẽ đẩy về trang Smart Access / Curfew Management.
   - Admin xem lý do, nếu hợp lý thì bấm "Duyệt & Mở cổng", hệ thống kích hoạt MQTT mở Servo và ghi log.
4. **Dashboard Thống kê:** 
   - Trang `/admin/dashboard` hiển thị biểu đồ tròn (In/Out), biểu đồ cột (Lượng ra vào theo giờ), và thẻ tổng quan.

## 3. Implementation Roadmap (Lộ trình triển khai)

### Giai đoạn 1: Backend - Core API (Mức độ: Vừa)
- [ ] Bổ sung thư viện `Recharts` vào Frontend.
- [ ] **Smart Access:** Cập nhật `AccessHistorySpecification` để hỗ trợ lọc theo Date Range, Gate, Status.
- [ ] **Attendance Service:** Xây dựng tính toán "In/Out" Real-time. Dựa vào `access_history`, lấy record cuối cùng của mỗi `student_id`. Nếu Cổng là cửa chính và chiều là `OUT` -> Sinh viên ở ngoài.
- [ ] **Curfew Request API:** Tạo bảng `curfew_requests` (student_id, reason, status, resolved_by) và API tương ứng.

### Giai đoạn 2: Frontend - Smart Access Cải tiến (Mức độ: Dễ)
- [ ] Cập nhật trang `/admin/smart-access`: Thêm Filter Component (Select Gate, Date Picker).
- [ ] Thêm Tab "Yêu cầu vào trễ" (Curfew Requests). Admin có thể nhấn nút "Cho phép & Mở Cổng".

### Giai đoạn 3: Frontend - Dashboard Module (Mức độ: Vừa)
- [ ] Cài đặt `npm install recharts`.
- [ ] Xây dựng trang `/admin/dashboard` làm Homepage cho Admin.
- [ ] Tích hợp 4 block: (1) Thống kê số lượng sinh viên In/Out, (2) Biểu đồ lượng người vào/ra trong ngày, (3) Tình trạng Phòng (Available, Full), (4) Yêu cầu khẩn cấp/trễ giờ chưa xử lý.

## 4. Trigger Prompt (Lệnh kích hoạt)
*Bạn hãy copy đoạn lệnh dưới đây và gửi lại cho tôi để bắt đầu triển khai:*
**"Tiến hành Giai đoạn 1 và 2 của tài liệu roadmap 002_dashboard_and_curfew.md: Cập nhật API bộ lọc, viết logic tính toán In/Out và thiết kế màn hình Yêu cầu vào trễ."**
