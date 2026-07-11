# STUDENT MODULE (QUẢN LÝ HỒ SƠ SINH VIÊN)

## 1. Mục đích
Thư mục này chứa các tài liệu nghiệp vụ cốt lõi của Module **Student** tại Backend. Module này là "Nguồn sự thật" (Source of Truth) quản lý vòng đời cư trú của sinh viên từ lúc được tạo tài khoản (`PROVISIONING`), đang ở (`ACTIVE`), cho đến khi bị đình chỉ (`SUSPENDED`) hoặc dọn đi (`ALUMNI`).

## 2. Danh sách Tài liệu Cốt lõi
- `student-lifecycle.md`: Đặc tả chi tiết Vòng đời trạng thái của sinh viên (`StudentStatus`). Nêu rõ sự kiện nào kích hoạt trạng thái nào, và các nghiệp vụ hỗ trợ quản lý 360 độ của Admin (Đình chỉ, Reset mật khẩu tạm, Xem log ra vào).
- `SSR-StudentModule.md`: Yêu cầu chức năng hệ thống (Functional Requirements) bắt buộc phải tuân thủ khi lập trình module này.

## 3. Quy tắc (Áp dụng theo Root AGENTS.md)
- **Tài liệu API:** Tất cả đặc tả API liên quan đến gia hạn (Extension), trả phòng (Checkout), hoặc nộp ảnh khuôn mặt (Face Registration) **ĐÃ ĐƯỢC DI DỜI** sang thư mục `docs/api/`.
- **Thiết kế UI/UX:** Cấm tuyệt đối lưu trữ các hướng dẫn thiết kế màn hình Mobile App hoặc Admin Dashboard tại đây. Vui lòng sang repository `sdms-frontend` để tìm kiếm.
