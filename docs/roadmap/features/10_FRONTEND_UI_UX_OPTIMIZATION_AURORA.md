# 10_FRONTEND_UI_UX_OPTIMIZATION_AURORA

## 1. VISION & PURPOSE
Nâng cấp và chuẩn hóa toàn bộ giao diện Frontend (React) của hệ thống Quản lý Ký túc xá (SDMS) theo **Material Design 3**, lấy cảm hứng từ template **Aurora Free Admin Dashboard**. 
Mục tiêu là mang lại một giao diện hiện đại, nhất quán về Layout, Typography, Colors, và Spacing, đồng thời **bảo lưu 100%** Workflow nghiệp vụ, cấu trúc Routing, và tích hợp API hiện tại.

## 2. PRELIMINARY UI AUDIT RESULTS
Dựa trên kiến trúc Frontend hiện tại (`sdms-frontend`), hệ thống cần tối ưu các điểm sau:
- **Layout & Spacing:** Chia tách rõ ràng AdminLayout, AuthLayout, và PublicLayout. Tuy nhiên khoảng cách (Padding/Margin) giữa các Card, Table chưa đồng bộ.
- **Card & Table Consistency:** Các trang (RoomManagement, CheckoutManagement...) đang dùng Paper/Card chưa thống nhất về `elevation` (đổ bóng) và `border-radius`. Cần chuyển sang phong cách Flat/Bordered của Aurora.
- **Reusable Components:** Đang thiếu các Component cốt lõi có thể dùng chung như `StatCard` (cho Dashboard), `DataTable` (bảng dữ liệu chuẩn), và `PageHeader` (Tiêu đề trang kèm Breadcrumbs).
- **Typography & Colors:** Chưa tận dụng triệt để `theme.palette` và `theme.typography` được định nghĩa trong `theme/index.ts`.

## 3. IMPLEMENTATION ROADMAP (PRIORITY LIST)

### Priority 1: Giao diện nền tảng (Shared Layout & Dashboard)
- Tối ưu hóa `AdminLayout.tsx` (Sidebar, Header, Spacing tổng thể).
- Chuẩn hóa `theme/index.ts` (Colors, Typography chuẩn Material 3).
- Cấu trúc lại `AdminDashboard.tsx` bằng cách tạo và sử dụng Component `StatCard` dùng chung.

### Priority 2: Các trang Bảng dữ liệu cốt lõi (Core Data Tables)
- Tối ưu `RoomManagement/index.tsx` và `AccountManagementPage.tsx`.
- Refactor Table thành một Reusable Component `DataTable` để các trang khác tái sử dụng, giúp đồng bộ UI cho toàn bộ Grid dữ liệu.

### Priority 3: Các trang Đăng ký & Xác thực (Public Pages)
- Refactor `RegistrationPage.tsx`, `LoginPage.tsx`, `ActivateAccountPage.tsx` đảm bảo form nhập liệu rộng rãi, padding chuẩn, nút bấm rõ ràng.

### Priority 4: Các trang hàng đợi & Xử lý đơn (Queues & Processing)
- Refactor `ApplicationReviewQueue.tsx` và `ChangeRoomManagement/index.tsx`.
- Chuẩn hóa các Dialog duyệt đơn (Khoảng cách nút bấm, Typography tiêu đề).
- Tối ưu Loading States (Sử dụng `CustomSkeleton.tsx`) và Empty States.

---

## 4. BINDING RULES
- Không dùng: Bootstrap, TailwindCSS, Ant Design.
- Không thay đổi nghiệp vụ: Không đụng vào API (Axios), Routing, hay các logic phân quyền (Role).
- Chỉ sử dụng Material UI (MUI v6) và Emotion (nếu cần).

---

## 5. TRIGGER PROMPT
*(Khi bạn muốn Agent bắt đầu thực hiện tối ưu hóa giao diện theo quy trình 7 bước đã thống nhất, hãy copy và dán đoạn Prompt dưới đây)*

```text
Hãy thực thi bản thiết kế UI/UX theo lộ trình trong file "docs/roadmap/features/10_FRONTEND_UI_UX_OPTIMIZATION_AURORA.md".
Bạn đang đóng vai trò Frontend AI Architect. Vui lòng thực hiện NGAY "Priority 1: Giao diện nền tảng (Shared Layout & Dashboard)". 
Yêu cầu làm chuẩn theo quy trình 7 bước trong "ui/UI_RULE.md":
- Hãy bắt đầu bằng cách đọc kỹ code của `AdminLayout.tsx` và `AdminDashboard.tsx`.
- So sánh cấu trúc với `ui/aurora-free/`.
- Phân tích và đề xuất thay đổi (Propose Improvements).
- Chờ tôi duyệt (Wait for approval) trước khi bạn bắt đầu viết/sửa code.
```
