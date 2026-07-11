# CHIẾN LƯỢC KIẾN TRÚC GIAO DIỆN XUYÊN NỀN TẢNG (WEB VS MOBILE)

**Cập nhật lần cuối:** 10/07/2026
**Phạm vi áp dụng:** Toàn bộ Monorepo (`sdms-frontend` và `sdms-mobile-app`)

Tài liệu này định hướng nguyên tắc thiết kế UI/UX và phân bổ chức năng giữa nền tảng Web và Mobile App nhằm đảm bảo tính nhất quán, tối ưu hiệu suất sử dụng (User Behavior) và bám sát quy trình hoạt động thực tế của dự án Ký túc xá thông minh (SDMS).

---

## 1. TRIẾT LÝ THIẾT KẾ (THE CORE PHILOSOPHY)

Sự phân bổ chức năng giữa Web và App không dựa trên "Có API thì làm", mà dựa trên **Hoàn cảnh sử dụng (Context of Use)** của từng đối tượng:

*   **Web Frontend (`sdms-frontend`): ĐƯỢC XEM LÀ "COMMAND CENTER" (Trung tâm chỉ huy).**
    *   **Đặc điểm:** Màn hình lớn, thao tác bằng chuột/phím, dùng để làm việc tập trung tại văn phòng.
    *   **Nhiệm vụ:** Phụ trách giám sát tổng thể, phân tích dữ liệu, báo cáo thống kê, và đặc biệt là **Heavy CRUD** (Thêm/Sửa/Xóa cấu trúc hệ thống phức tạp, điền form dài).
*   **Mobile App (`sdms-mobile-app`): ĐƯỢC XEM LÀ "TACTICAL TOOL" (Công cụ tác chiến).**
    *   **Đặc điểm:** Màn hình nhỏ, thao tác cảm ứng một tay, dùng khi đang di chuyển ngoài hiện trường.
    *   **Nhiệm vụ:** Phụ trách các thao tác xử lý nhanh gọn (Quick Actions), tiếp nhận thông báo (Push Notifications), và giao tiếp thiết bị phần cứng (Quét QR Code, Nhận diện khuôn mặt, Bật tắt IoT).

---

## 2. QUY TẮC PHÂN BỔ CHỨC NĂNG THEO ROLE (ROLE-BASED ALLOCATION)

Dù API Backend cấp quyền truy cập, nhưng UI/UX sẽ ẩn/hiện chức năng tùy theo nền tảng.

### A. Đối với Role `ADMIN` (Quản trị viên cấp cao)
*   **Trên Web:** Có quyền lực tối cao. Cấu hình hệ thống (System Config), Thêm/Xóa tòa nhà (Building/Room), phân bổ phòng (Housing Assignment), xuất báo cáo tài chính.
*   **Trên Mobile:** Chức năng bị lược bỏ 90% so với Web. Chỉ hiển thị các **Nút gạt khẩn cấp** (Ví dụ: Đóng cổng KTX lập tức, Dừng đợt đăng ký ngay lập tức) và xem thống kê tổng quan (Mini Dashboard). Tuyệt đối **KHÔNG** mang form tạo mới tòa nhà/đợt đăng ký lên App.

### B. Đối với Role `STAFF` (Nhân viên, Bảo vệ, Quản lý tòa nhà)
*   **Trên Web:** Dùng để đối soát danh sách sinh viên, xuất file Excel, trực ban tại phòng bảo vệ.
*   **Trên Mobile (Core User của Admin App):** Là vũ khí chính. Giao diện thiết kế theo chuẩn *Mobile-first UX* (Nút to, chữ rõ):
    *   Quét mã QR Code bằng Camera để Check-in/Check-out.
    *   Mở cổng IoT từ xa (Smart Access).
    *   Nhận thông báo sửa chữa (Maintenance Ticket) và chụp ảnh báo cáo hoàn thành.
    *   Duyệt nhanh đơn xin về quê/ra ngoài trễ.

### C. Đối với Role `STUDENT` (Sinh viên)
*   **Trên Web:** Nơi để làm những việc cần đọc nhiều tài liệu kỹ lưỡng (Khai báo hồ sơ tân sinh viên, Xem chi tiết nội quy, Đăng ký đợt phòng mới).
*   **Trên Mobile (Core User):** 
    *   **ID Card điện tử:** Mã QR để ra vào cổng.
    *   **Thanh toán:** Xem bill điện/nước/phòng và thanh toán nhanh qua MoMo/SePay.
    *   **Báo cáo:** Chụp ảnh bóng đèn hỏng gửi yêu cầu sửa chữa.

---

## 3. QUY TRÌNH IMPLEMENT TỪNG MODULE (STEP-BY-STEP)

Bất kỳ Agent hoặc lập trình viên nào khi triển khai một Module mới (Ví dụ: Module Registration, Module Payment) **BẮT BUỘC** phải tuân thủ luồng phân tích sau trước khi code:

1.  **Backend Verification:** Kiểm tra API đã có những gì (Role nào được gọi).
2.  **Web Projection:** Ánh xạ API lên Web. Những API nào dạng `POST`/`PUT` chứa Payload lớn (Form dài) -> Đẩy hết sang Web.
3.  **Mobile Projection:** Ánh xạ API lên Mobile. Chỉ lấy những API dạng `GET` (danh sách tóm tắt), `PATCH` (đổi trạng thái nhanh), và những nghiệp vụ đòi hỏi Camera/Location.
4.  **Confirm:** Xin xác nhận từ người dùng về luồng UI/UX vừa phác thảo.
5.  **Code First:** Triển khai code React (Web) và Kotlin (App).

*Tài liệu này đóng vai trò kim chỉ nam (Single Source of Truth về mặt UI/UX Architecture) để tránh hiện tượng "Scope Creep" (Phình to tính năng App) hoặc "Làm sai nền tảng" (Bắt user điền form 5 trang trên điện thoại di động).*
