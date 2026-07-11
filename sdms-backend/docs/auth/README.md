# AUTH MODULE (XÁC THỰC & PHÂN QUYỀN)

## 1. Mục đích
Thư mục này chứa tài liệu về Yêu cầu Nghiệp vụ cốt lõi (Functional Requirements) cho việc xác thực, đăng nhập, phân quyền, và vòng đời tài khoản người dùng (`UserAccount`).

## 2. Danh sách Tài liệu
- `SSR-AuthModule.md`: Đặc tả hệ thống, yêu cầu chức năng (Đổi mật khẩu, Quên mật khẩu, Lưu Refresh Token, v.v).

## 3. Nhật ký Quy hoạch (Quy tắc Code is Truth & UI Separation)
Dựa trên nguyên tắc quy hoạch dự án, các file sau đã được di dời/xử lý:
- **`auth-review-report.md`**: Đã bị XÓA vì đây là báo cáo lỗi thời (Các tính năng như `ErrorCode` đã được code thật).
- **`auth-audit-design.md`**: Đã được DỜI sang `docs/roadmap/features/03_AUTH_AUDIT_LOGGING.md` vì tính năng ghi log Audit Log chưa hề tồn tại trong code (Kiểm chứng theo nguyên tắc *Code is Truth*).
- **`frontend-integration-guide.md`, `role-permission-model.md`, `auth-state-machine.md`**: Đã được DỜI SANG `sdms-frontend/docs/` do chứa code React và luồng State UI của Mobile App.
- **`auth-business-flow.md`, `auth-sequence-diagram.md`**: Đã được DỜI SANG `docs/api/` vì chúng đặc tả Flow giao tiếp qua lại của HTTP Endpoints.
