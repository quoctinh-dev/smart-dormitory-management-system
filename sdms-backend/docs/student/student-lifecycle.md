# Vòng đời và Quản lý Hồ sơ Sinh viên
**Phiên bản:** 1.1 · **Ngày:** 2026-06-26

Tài liệu này mô tả chi tiết vòng đời của một thực thể `Student` và các chức năng quản lý, vận hành liên quan đến sinh viên trong suốt quá trình lưu trú tại Ký túc xá (KTX).

---

## 1. Bối cảnh nghiệp vụ
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

## 2. Các Trạng thái của Sinh viên (`StudentStatus`)
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

## 3. Sơ đồ Chuyển đổi Trạng thái
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

## 4. Quy trình Chi tiết Vòng đời
*(Nội dung không đổi, giữ nguyên như phiên bản 1.0)*

---
## 5. Chức năng Hỗ trợ Quản lý và Vận hành

Để Admin có thể thực sự "quản lý" và "hỗ trợ" sinh viên đang ở, hệ thống cung cấp một giao diện quản lý hồ sơ toàn diện, vượt xa việc chỉ hiển thị thông tin cá nhân.

### 5.1. Hồ sơ 360° của Sinh viên (Student 360° View)

*   **Mục đích:** Cung cấp cho Admin một cái nhìn tổng hợp, đa chiều về toàn bộ lịch sử và hoạt động của một sinh viên tại KTX, chỉ từ một màn hình duy nhất.
*   **Triển khai:** Khi Admin tìm kiếm và chọn một sinh viên, giao diện sẽ hiển thị một trang chi tiết với nhiều tab thông tin:
    *   **Tab 1 - Tổng quan:**
        *   Thông tin cá nhân (họ tên, MSSV, khoa).
        *   Thông tin liên hệ (SĐT, email, liên hệ khẩn cấp).
        *   Trạng thái hiện tại (`ACTIVE`, `SUSPENDED`).
        *   Phòng ở hiện tại (Tòa, Phòng, Giường).
        *   Mã QR code để check-in tạm thời nếu sinh viên quên thẻ/mất điện thoại.
    *   **Tab 2 - Lịch sử Cư trú:**
        *   Danh sách tất cả các `StudentHousingAssignment` đã và đang có.
        *   Hiển thị rõ các lần gia hạn, chuyển phòng (nếu có).
    *   **Tab 3 - Lịch sử Thanh toán:**
        *   Danh sách toàn bộ các hóa đơn (`Bill`) đã được tạo cho sinh viên.
        *   Trạng thái của từng hóa đơn (`PAID`, `UNPAID`, `OVERDUE`).
        *   Cho phép Admin xem chi tiết từng giao dịch thanh toán.
    *   **Tab 4 - Lịch sử Ra vào:**
        *   Log 100 lần ra vào cổng gần nhất.
        *   Hiển thị rõ thời gian, cổng, phương thức (Face/RFID), và kết quả (`GRANTED`/`DENIED`).
        *   Highlight các lần ra vào bất thường (ví dụ: bị từ chối do quá giờ giới nghiêm).
    *   **Tab 5 - Ghi chú & Vi phạm:**
        *   Một khu vực để nhân viên quản lý KTX ghi lại các ghi chú nội bộ.
        *   Ví dụ: "Sinh viên X có hành vi gây mất trật tự ngày Y", "Đã nhắc nhở sinh viên Z về việc vệ sinh phòng".
*   **Luận cứ thực tế:** Giúp Admin nắm bắt toàn bộ bối cảnh khi xử lý một yêu cầu hoặc sự cố của sinh viên. Ví dụ, khi sinh viên báo mất đồ, Admin có thể nhanh chóng kiểm tra lịch sử ra vào. Khi sinh viên hỏi về một khoản phí, Admin có thể xem ngay lịch sử thanh toán.

### 5.2. Các Tác vụ Vận hành Trực tiếp

Từ màn hình Hồ sơ 360°, Admin có thể thực hiện các tác vụ trực tiếp để hỗ trợ sinh viên:

*   **Tác vụ "Gia hạn Hợp đồng":**
    *   **Nghiệp vụ:** Thay vì bắt sinh viên phải tự nộp đơn gia hạn, Admin có thể nhấn nút "Gia hạn" cho các sinh viên có lịch sử tốt.
    *   **Hành động hệ thống:** Tự động tạo một đơn đăng ký mới (`DormitoryApplication`) với loại là `RENEWAL` và điền sẵn thông tin, sau đó chuyển thẳng đến bước `WAITING_PAYMENT`.
*   **Tác vụ "Đình chỉ Lưu trú" (Suspend):**
    *   **Nghiệp vụ:** Dành cho các trường hợp vi phạm nội quy nghiêm trọng.
    *   **Hành động hệ thống:** Chuyển trạng thái của `Student` thành `SUSPENDED`. Trạng thái này sẽ ngay lập tức được Module `SmartAccess` đọc và từ chối mọi quyền ra vào của sinh viên.
*   **Tác vụ "Reset Mật khẩu Tạm thời":**
    *   **Nghiệp vụ:** Khi sinh viên không thể tự reset mật khẩu qua email.
    *   **Hành động hệ thống:** Admin nhấn nút, hệ thống sẽ reset mật khẩu của `UserAccount` về lại số CCCD và chuyển trạng thái tài khoản về `PENDING_ACTIVATION`, đồng thời gửi email thông báo cho sinh viên.
*   **Luận cứ thực tế:** Các tác vụ này cho phép Admin giải quyết nhanh chóng các vấn đề vận hành hàng ngày, tăng hiệu quả quản lý và cải thiện trải nghiệm cho sinh viên.
