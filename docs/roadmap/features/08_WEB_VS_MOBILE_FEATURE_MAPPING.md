# CHIẾN LƯỢC PHÂN TÁCH CHỨC NĂNG WEB VÀ MOBILE APP (CROSS-PLATFORM FEATURE MAPPING)

## 1. Triết lý Thiết kế (Design Philosophy)
Dự án áp dụng mô hình kiến trúc **"Web = Management Dashboard"** và **"Mobile = Real-time Utility"**.
- **Web App (React):** Được thiết kế để làm việc trên màn hình lớn, dùng chuột và bàn phím. Phù hợp cho các tác vụ: Cấu hình hệ thống, duyệt hàng loạt, xem báo cáo tổng hợp, tải Excel. Web App chịu tải trọng lớn về hiển thị Dữ liệu (Heavy Data).
- **Mobile App (Flutter/React Native):** Định vị là một "Tiện ích bỏ túi" (Pocket Utility). Tối ưu cho thao tác một chạm (One-tap action), thông báo thời gian thực (Push Notification), và khai thác phần cứng điện thoại (Camera, NFC, Bluetooth). Tuyệt đối **KHÔNG** bê nguyên toàn bộ chức năng của Web nhét vào App để tránh App bị "phình to" và trùng lặp chức năng không cần thiết.

---

## 2. Bản đồ Phân tách Chức năng Sinh viên (Student App)

| Chức năng | Web App (Public Web) | Mobile App (Student App) | Lý do phân tách (Triết lý) |
| :--- | :--- | :--- | :--- |
| **Đăng ký nội trú (Nộp đơn)** | ✅ Dùng để điền form dài, tải PDF, nộp ảnh CCCD. | ❌ KHÔNG LÀM | Form đăng ký có hàng chục trường thông tin. Gõ trên điện thoại rất cực. Gom hết lên Web để giảm tải dung lượng App. |
| **Tra cứu trạng thái đơn** | ✅ Tra cứu bằng CCCD. | ❌ KHÔNG LÀM | Sinh viên chưa có tài khoản đăng nhập App nên chỉ có thể tra cứu trên Web. |
| **Báo cáo sự cố (Maintenance)** | ❌ KHÔNG LÀM | ✅ Chụp ảnh hỏng hóc, gửi yêu cầu. | Chụp ảnh ống nước vỡ, bóng đèn cháy bằng Camera điện thoại nhanh hơn nhiều so với việc tải ảnh lên máy tính rồi mới up Web. |
| **Thanh toán (Payment)** | ✅ Quét mã QR QRVNPay trên màn hình máy tính. | ✅ Chuyển hướng App Ngân hàng (Deep Link). | Tiện ích cốt lõi. Trên App bấm thanh toán -> Mở thẳng App Momo/MBBank trên điện thoại cực nhanh. |
| **Lịch sử ra vào cổng (Smart Access)** | ❌ KHÔNG LÀM | ✅ Nhận Push Notification khi quét mặt. | Web không cần thiết. App nhận thông báo real-time khi cửa mở, tạo cảm giác an tâm. |
| **Chấm điểm Kỷ luật / Gia hạn** | ✅ Xem bảng điểm tổng hợp. | ✅ Xem cảnh báo kỷ luật. | App tập trung cảnh báo. Web xem chi tiết. |

---

## 3. Bản đồ Phân tách Chức năng Ban Quản lý (Admin/Staff App)

| Chức năng | Web App (Admin Portal) | Mobile App (Staff/Admin Utility) | Lý do phân tách (Triết lý) |
| :--- | :--- | :--- | :--- |
| **Cấu hình Đợt Đăng ký / Import Excel** | ✅ Bắt buộc làm. | ❌ KHÔNG LÀM | Ai lại đi tải file Excel lên bằng điện thoại? App không xử lý Data Import. |
| **Sắp xếp Phòng (Room Assignment)** | ✅ Thao tác kéo-thả (Drag & Drop), Batch process. | ❌ KHÔNG LÀM | Màn hình điện thoại quá nhỏ để xếp 500 sinh viên vào 100 phòng. |
| **Quản lý Cổng An Ninh (Smart Access)** | ✅ Xem chi tiết Log, Camera stream. | ✅ Mở cổng khẩn cấp (Emergency Button). | Staff đi tuần tra dùng App để mở cổng từ xa. KHÔNG xem toàn bộ log dài trên App. |
| **Duyệt Đơn / Duyệt Khuôn mặt** | ✅ Duyệt hàng loạt. | ❌ (Hoặc chỉ duyệt ca lẻ) | Web để làm việc cường độ cao. App chỉ dùng khi nhận Notif "Có 1 đơn khẩn cấp cần duyệt". |
| **Quản lý Check-in / Check-out** | ✅ Xem báo cáo tổng hợp. | ✅ Dùng Camera điện thoại quét mã QR sinh viên. | Staff cầm điện thoại đứng ở sảnh, sinh viên đưa QR code ra quét -> Auto Check-in. Cực kỳ cơ động! |

---

## 4. Tổng kết: Đề xuất Danh sách Tính năng cho Mobile App
Để dự án thực sự "Thực chiến" và được Hội đồng đánh giá cao về tính ứng dụng, **Mobile App chỉ nên tập trung vào các chức năng (Features) sau:**

### Dành cho Sinh viên (Student Mobile App):
1. **Trang chủ Dashboard:** Hiện mã QR Code cá nhân to rõ (Để quét ra vào dự phòng nếu Face ID lỗi).
2. **Push Notifications:** Nhận thông báo (Phí điện nước đến hạn, Nhắc nhở giới nghiêm, Có bưu phẩm).
3. **Thanh toán nhanh (Quick Pay):** Deep-link thẳng sang App Ngân hàng.
4. **Báo cáo sự cố (Report Issue):** Chụp ảnh bằng camera và gửi yêu cầu sửa chữa cơ sở vật chất.

### Dành cho Nhân viên (Staff Mobile App):
1. **Smart Scanner (Quét QR Check-in/out):** Chức năng cốt lõi khi đứng đón sinh viên tại sảnh đầu năm.
2. **Điều khiển IoT Cổng (Gate Control):** Nút mở cổng từ xa hoặc kích hoạt chế độ Khẩn cấp (Evacuation).
3. **Tiếp nhận sự cố (Maintenance Ticket):** Nhận Notif khi sinh viên báo hỏng đồ, update trạng thái "Đang sửa".

### Giá trị Luận văn mang lại:
Việc phân tách này chứng minh sinh viên hiểu rõ **"Hành vi người dùng" (User Behavior)**:
- Không bắt sinh viên điền Form Đăng ký nội trú dài dằng dặc trên App (Xóa tính năng Đăng ký trên App).
- Không bắt Bảo vệ phải ngồi ôm máy tính mới mở được cửa (Dùng Staff App để mở).
- Hệ thống hoạt động theo triết lý OMO (Online Merge Offline).
