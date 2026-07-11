# Hướng dẫn Tích hợp & UX/UI Guidelines cho Gia hạn & Trả phòng

Tài liệu này được trích xuất từ các yêu cầu nghiệp vụ của Backend để định hướng thiết kế giao diện cho Frontend (Mobile App và Web Admin).

## 1. Ứng dụng Sinh viên (Mobile App)
- **Màn hình Gia hạn**: Hiển thị Banner cảnh báo nếu không nằm trong đợt gia hạn. Chỉ hiển thị nút nộp đơn nếu API cho phép. Khi đơn đã nộp, thay thế form bằng màn hình `Trạng thái đơn (Đang xử lý/Đã duyệt)`, có nút tải PDF hợp đồng mới.
- **Màn hình Trả phòng (Checkout)**: Cần có bước Check Nợ phí. Nếu API trả về `400 BAD_REQUEST` với thông báo nợ phí, App cần điều hướng sinh viên sang màn hình "Thanh toán Hóa đơn" trước khi cho phép quay lại màn hình Checkout.
- **Nhập ngân hàng**: Bổ sung ghi chú *"Tài khoản ngân hàng dùng để KTX hoàn lại tiền cọc (nếu có)."*

## 2. Web Quản trị (Admin Dashboard)
- Cần có 2 màn hình riêng biệt: **Quản lý Gia hạn** và **Quản lý Trả phòng**.
- **Quản lý Trả phòng**: Nên có Badge màu đỏ (Unpaid/Debts) nếu Admin muốn xem chi tiết nợ của sinh viên, mặc dù hệ thống đã chặn nộp đơn nếu có nợ, nhưng Admin cần biết lịch sử thanh toán để làm thủ tục hoàn cọc.
- Khi Duyệt Checkout, Admin nên được hỏi xác nhận Dialog: *"Bạn có chắc chắn duyệt trả phòng? Quyền ra vào KTX của sinh viên sẽ bị thu hồi ngay lập tức."*

## 3. Public Web
- Hoàn toàn KHÔNG liên quan đến Public Web do yêu cầu Token Đăng nhập và trạng thái Nội trú (Active Resident). Không cần hiển thị bất kỳ menu nào về Gia hạn hay Checkout ở Landing Page.
