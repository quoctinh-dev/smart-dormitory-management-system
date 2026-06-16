# PROJECT_RULES.md

## 1. Mục đích
Tài liệu này đóng vai trò là "Hiến pháp" (Ruleset) của dự án `sdms-frontend`. Mọi lập trình viên và AI Agent khi làm việc trong dự án này đều phải tuân thủ nghiêm ngặt các quy tắc dưới đây nhằm đảm bảo tính nhất quán, dễ bảo trì và mở rộng của mã nguồn.

## 2. Quy tắc cấu trúc thư mục (Folder Structure)
Mọi file phải được đặt đúng vị trí theo kiến trúc đã định. Không đặt file sai chức năng vào các thư mục.

*   `src/api/`: **Chỉ chứa** các file gọi API. Phân tách theo từng tài nguyên (resource).
*   `src/auth/`: **Chỉ chứa** logic xử lý xác thực và phân quyền (AuthContext, RequireAdmin, authStorage).
*   `src/components/`: **Chỉ chứa** các UI component dùng chung (Shared UI) trên toàn dự án.
*   `src/hooks/`: **Chỉ chứa** custom hooks (tách biệt logic nghiệp vụ khỏi UI component).
*   `src/layouts/`: **Chỉ chứa** các component layout (bộ khung) cho các nhóm trang (AdminLayout, PublicLayout, AuthLayout).
*   `src/pages/`: **Chỉ chứa** các component trang (Page). Phân chia rõ ràng thành `admin/` và `public/`.
*   `src/routes/`: **Chỉ chứa** cấu hình định tuyến (AppRouter, AdminRoutes, PublicRoutes, utils).
*   `src/theme/`: **Chỉ chứa** cấu hình và custom theme của Material-UI (MUI).

## 3. Quy tắc API (API Standards)
*   **Centralized Axios:** Mọi HTTP request **BẮT BUỘC** phải đi qua `axiosClient.js`. **KHÔNG** sử dụng `axios` trực tiếp trong các component hoặc hooks.
*   **Interceptor & Refresh Token:** `axiosClient.js` đã được cấu hình sẵn cơ chế tự động đính kèm token vào header và tự động refresh token khi hết hạn (401). Không viết lại logic này ở nơi khác.
*   **Data Envelope:** Response từ backend luôn được thiết kế theo dạng envelope `{ success, message, data, ... }`. `axiosClient` đã được cấu hình interceptor để tự động trích xuất phần `data` (`response.data?.data ?? response.data`). Do đó, các hàm gọi API chỉ cần quan tâm đến dữ liệu cốt lõi.
*   **Resource Modules:** Các endpoint phải được gom nhóm theo file dựa trên resource. Ví dụ: `authApi.js` (xác thực), `applicationApi.js` (hồ sơ), `periodApi.js` (đợt đăng ký).
*   **Barrel Export:** Bắt buộc sử dụng file `index.js` trong thư mục `src/api/` để export tất cả các API modules.

```javascript
// Chuẩn: src/api/userApi.js
import axiosClient from "./axiosClient";

const userApi = {
    getAll: () => axiosClient.get('/users'),
    getById: (id) => axiosClient.get(`/users/${id}`),
};
export default userApi;
```

## 4. Quy tắc Xác thực (Auth Standards)
*   **Global Auth State:** Sử dụng `AuthContext` (`useAuth` hook) để lấy thông tin người dùng và trạng thái xác thực (`admin`, `isAuthenticated`, `login`, `logout`).
*   **Route Protection:** Sử dụng component `<RequireAdmin />` trong cấu hình routes để bảo vệ các trang yêu cầu quyền admin. **Tuyệt đối không** kiểm tra token thủ công trong từng trang.
*   **Token Management:** Quản lý token thông qua `authStorage.js` (`getAccessToken`, `setTokens`, `clear`). **Tuyệt đối không** hardcode token, không ghi trực tiếp vào `localStorage` từ các component.

## 5. Quy tắc UI/UX (Design System)
*   **Material-UI (MUI):** Dự án sử dụng MUI làm bộ UI component chính. Các styling phải sử dụng hệ thống styling của MUI (như `sx` prop, `styled-components` của MUI) và tuân thủ `theme` đã cấu hình trong `src/theme/`.
*   **Loading State:** Khi chờ dữ liệu (fetching), **bắt buộc** sử dụng component `<CustomSkeleton />` (nếu có) hoặc các component Skeleton/CircularProgress của MUI để thể hiện trạng thái loading thay vì màn hình trắng.
*   **Thông báo (Feedback):** Thống nhất cách hiển thị lỗi và thông báo thành công (ví dụ: sử dụng `Snackbar` và `Alert` của MUI).

## 6. Quy tắc Routing (Routing Standards)
*   **Centralized Router:** Mọi route được định nghĩa trong thư mục `src/routes/`.
*   **Thêm Route Mới:**
    *   Route dành cho người dùng công cộng: Thêm vào `publicRoutes` trong file `src/routes/PublicRoutes.jsx`.
    *   Route dành cho admin (yêu cầu xác thực): Thêm vào `adminRoutes` trong file `src/routes/AdminRoutes.jsx` bên dưới component bảo vệ `RequireAdmin`.
*   **Lazy Loading:** Các page component phải được import sử dụng `React.lazy()` và bọc trong hàm `wrap()` (hoặc `Suspense`) để tối ưu hóa hiệu suất tải trang.

## 7. Quy tắc Code (Clean Code & Standards)
*   **Functional Components & Hooks:** Sử dụng 100% Functional Components và Hooks. Không sử dụng Class Components.
*   **Tách biệt Logic và UI:** Đưa các logic phức tạp (gọi API, xử lý form, state phức tạp) ra các Custom Hooks (thư mục `src/hooks/`) để Page/Component chỉ đảm nhiệm việc render UI.
*   **ESLint:** Tuân thủ tuyệt đối các quy tắc được định nghĩa trong `eslint.config.js`. Mã nguồn phải không có lỗi linter trước khi commit.
*   **Barrel Exports:** Sử dụng file `index.js` ở các thư mục (api, auth, components, hooks...) để gom nhóm các exports, giúp import sạch sẽ hơn.
    *   *Tránh:* `import { MyComponent } from '@/components/MyComponent/MyComponent'`
    *   *Nên:* `import { MyComponent } from '@/components'`

## 8. Quy tắc đặt tên (Naming Conventions)
*   **File & Folder:**
    *   Thư mục: `kebab-case` hoặc `camelCase` (vd: `components`, `admin-dashboard`).
    *   File React Components, Layouts, Pages: `PascalCase.jsx` (vd: `AdminDashboard.jsx`, `AuthLayout.jsx`).
    *   File Utilities, Hooks, API, config: `camelCase.js` (vd: `useRegistration.js`, `authApi.js`, `utils.jsx`).
*   **Variables & Functions:** `camelCase` (vd: `fetchStatus`, `userData`).
*   **Constants:** `UPPER_SNAKE_CASE` (vd: `MAX_FILE_SIZE`).
*   **Components:** `PascalCase` (vd: `function CustomSkeleton() { ... }`).

---
*Ghi chú: Bản quy tắc này có thể được cập nhật trong tương lai tùy theo yêu cầu dự án. Bất kỳ thay đổi lớn nào cần có sự đồng thuận của team.*