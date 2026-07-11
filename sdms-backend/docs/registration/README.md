# REGISTRATION MODULE (QUẢN LÝ ĐỢT ĐĂNG KÝ)

## 1. Mục đích
Thư mục này chứa tài liệu cốt lõi về nghiệp vụ cho Module **Registration**. Module này chuyên trách việc cấu hình các "Đợt mở đăng ký" (Registration Period) và kiểm tra "Tính hợp lệ" (Eligibility) của sinh viên. 
Nó đóng vai trò như "Người gác cổng" trước khi sinh viên có thể bước vào luồng điền Đơn đăng ký (Application Module).

## 2. Danh sách Tài liệu Cốt lõi
- `SSR-RegistrationModule.md`: Yêu cầu chức năng hệ thống (Functional Requirements). Bao gồm các quy tắc như Tạo đợt đăng ký, Import danh sách sinh viên hợp lệ qua Excel, và logic kiểm tra tư cách.

## 3. Quy tắc Đọc và Cập nhật
- Mọi tài liệu liên quan đến API của module này (Ví dụ: `registration-period-design.md` đặc tả các HTTP endpoints) **ĐÃ ĐƯỢC DI DỜI** sang thư mục trung tâm `docs/api/`.
- Nếu có sự thay đổi về Logic kiểm tra tư cách (Eligibility), lập trình viên phải cập nhật file SSR trước khi sửa code.
- Tuyệt đối không lưu UI flow của sinh viên khi thấy báo lỗi "Không đủ điều kiện" tại đây. Tài liệu UI thuộc về dự án Frontend.
