# APPLICATION MODULE (QUẢN LÝ ĐƠN ĐĂNG KÝ)

## 1. Mục đích
Thư mục này chứa toàn bộ các tài liệu đặc tả kỹ thuật, thiết kế luồng (Workflow) và mô hình miền (Domain Model) cho Module **Application** (Quản lý Đơn đăng ký lưu trú) của Backend.
Đây là tài liệu được sử dụng bởi Lập trình viên Backend để hiểu cách cấu trúc code, cách các sự kiện (Events) được phát ra, và cách Module này tương tác với các Module khác (Room, Payment, Student).

## 2. Danh sách Tài liệu

| File | Mô tả nội dung |
|---|---|
| `domain-model.md` | Phân tích Mô hình Miền (Domain Driven Design). Định nghĩa Aggregate Root `DormitoryApplication`, ranh giới module, và nguyên tắc decoupling. |
| `form-design.md` | Thiết kế Cấu trúc Dữ liệu Biểu mẫu. Chứa logic phân loại sinh viên (Nhóm A, B, C), các loại giấy tờ xác minh, và luồng sinh file PDF tự động (`ApplicationPdfService`). |
| `registration_flow_and_api.md` | Đặc tả Luồng Đăng ký & Kiểm duyệt Ký túc xá. Giải thích chi tiết các bước chuyển trạng thái (State Machine), các Event được bắn ra ở mỗi bước, và đánh giá UX cho Frontend. |
| `SSR-ApplicationModule.md` | Tài liệu Yêu cầu Hệ thống Phần mềm (Software System Requirements). Định nghĩa chính xác các Functional Requirements (FR) như [FR-APP-SUBMIT], [FR-APP-REVIEW], và các quy trình tự động [FR-APP-AUTO]. |

## 3. Quy tắc cập nhật
- Khi có thay đổi về Cấu trúc Database của `DormitoryApplication` hoặc thêm mới một State (Trạng thái) vào Enum, lập trình viên **BẮT BUỘC** phải cập nhật lại `domain-model.md` và `registration_flow_and_api.md`.
- Các nguyên tắc thiết kế trong `domain-model.md` (đặc biệt là việc sử dụng Event-Driven để decoupling) **KHÔNG ĐƯỢC PHÉP** vi phạm trong quá trình implement code.
