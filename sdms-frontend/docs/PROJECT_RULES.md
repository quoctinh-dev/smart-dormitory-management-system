# PROJECT_RULES.md

# 1. Mục đích

Tài liệu này là bộ quy chuẩn chính thức của dự án **sdms-frontend**.

Mục tiêu của tài liệu nhằm:

* Đảm bảo tính nhất quán trong toàn bộ mã nguồn.
* Duy trì khả năng bảo trì và mở rộng lâu dài.
* Chuẩn hóa kiến trúc hệ thống.
* Tăng tính ổn định và khả năng cộng tác trong quá trình phát triển.
* Hạn chế phát sinh nợ kỹ thuật (Technical Debt).

Mọi thành phần trong hệ thống phải tuân thủ các quy định được mô tả trong tài liệu này.

---

# 2. Quy chuẩn cấu trúc thư mục

Mỗi thư mục chỉ được chứa các thành phần đúng với trách nhiệm đã được định nghĩa.

Không đặt sai chức năng hoặc trộn lẫn trách nhiệm giữa các thư mục.

## src/api

Chỉ chứa các module giao tiếp với Backend.

Chức năng:

* Khai báo API
* Gửi HTTP Request
* Quản lý endpoint theo từng tài nguyên

Ví dụ:

```text
src/api/
├── authApi.js
├── applicationApi.js
├── periodApi.js
└── index.js
```

---

## src/auth

Chứa toàn bộ logic xác thực và phân quyền.

Chức năng:

* AuthContext
* Auth Hooks
* Lưu trữ Token
* Bảo vệ Route

Ví dụ:

```text
src/auth/
├── AuthContext.jsx
├── RequireAdmin.jsx
├── authStorage.js
└── index.js
```

---

## src/components

Chỉ chứa các UI Component dùng chung cho toàn hệ thống.

Ví dụ:

```text
src/components/
├── CustomButton
├── CustomTable
├── CustomModal
└── CustomSkeleton
```

Không đặt component đặc thù của từng trang vào thư mục này.

---

## src/hooks

Chứa các Custom Hooks.

Chức năng:

* Xử lý nghiệp vụ
* Quản lý State
* Điều phối API
* Xử lý Form

Không chứa mã nguồn render giao diện.

---

## src/layouts

Chứa các Layout dùng làm khung giao diện.

Ví dụ:

```text
AdminLayout
PublicLayout
AuthLayout
```

Layout chỉ chịu trách nhiệm về cấu trúc hiển thị.

---

## src/pages

Chứa các trang hoàn chỉnh của hệ thống.

Cấu trúc:

```text
src/pages/
├── admin/
└── public/
```

Page đóng vai trò lớp trình bày (Presentation Layer).

---

## src/routes

Chứa toàn bộ cấu hình định tuyến.

Ví dụ:

```text
AppRouter.jsx
AdminRoutes.jsx
PublicRoutes.jsx
routePaths.js
```

---

## src/theme

Chứa toàn bộ cấu hình giao diện Material UI.

Bao gồm:

* Màu sắc
* Typography
* Theme
* Component Overrides

---

# 3. Quy chuẩn API

## Axios tập trung

Toàn bộ HTTP Request phải đi qua:

```javascript
src/api/axiosClient.js
```

Không được sử dụng trực tiếp axios ở bất kỳ nơi nào khác.

---

## Interceptor và Refresh Token

Việc xử lý:

* Gắn Access Token
* Refresh Token
* Xử lý lỗi xác thực

được thực hiện duy nhất tại:

```javascript
axiosClient.js
```

Không triển khai lại logic này ở các module khác.

---

## Chuẩn dữ liệu phản hồi

Backend sử dụng cấu trúc:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Interceptor sẽ tự động giải nén dữ liệu:

```javascript
response.data?.data ?? response.data
```

Các module sử dụng API chỉ nhận dữ liệu nghiệp vụ cuối cùng.

---

## Phân nhóm API theo tài nguyên

Mỗi tài nguyên phải có module riêng.

Ví dụ:

```javascript
authApi.js
applicationApi.js
periodApi.js
studentApi.js
```

---

## Barrel Export

Tất cả API phải được export thông qua:

```javascript
src/api/index.js
```

Ví dụ:

```javascript
export { default as authApi } from './authApi';
export { default as applicationApi } from './applicationApi';
```

---

# 4. Quy chuẩn Xác thực và Quản lý State

## Trạng thái xác thực

Trạng thái đăng nhập được quản lý thông qua:

```javascript
AuthContext
useAuth()
```

Bao gồm:

* Người dùng hiện tại
* Trạng thái đăng nhập
* Đăng nhập
* Đăng xuất
* Thông tin phân quyền

---

## Bảo vệ Route

Các trang yêu cầu quyền truy cập phải sử dụng cơ chế bảo vệ tập trung.

Ví dụ:

```jsx
<RequireAdmin>
    <AdminPage />
</RequireAdmin>
```

Không kiểm tra quyền truy cập riêng lẻ tại từng trang.

---

## Quản lý Token

Toàn bộ thao tác với Token phải thông qua:

```javascript
authStorage.js
```

Các hàm được phép sử dụng:

```javascript
getAccessToken()
setTokens()
clear()
```

Không truy cập trực tiếp localStorage hoặc sessionStorage bên ngoài module này.

---

## Quản lý State Toàn Cục

Ngoài trạng thái xác thực, các trạng thái toàn cục khác phải được quản lý bằng:

* Context riêng biệt
* Hoặc giải pháp quản lý State được thống nhất

Không sử dụng AuthContext để lưu trữ dữ liệu không liên quan đến xác thực.

---

# 5. Quy chuẩn UI/UX

## Hệ sinh thái Material UI

Material UI là thư viện giao diện chính của dự án.

Ưu tiên sử dụng:

* sx prop
* Stack
* Grid
* styled()

Hạn chế:

* CSS thuần
* Inline Style
* Styling không theo Theme

---

## Trạng thái tải dữ liệu

Khi đang tải dữ liệu phải sử dụng:

```jsx
<CustomSkeleton />
```

hoặc

```jsx
<Skeleton />
<CircularProgress />
```

Không hiển thị màn hình trắng hoặc văn bản "Loading...".

---

## Thông báo hệ thống

Thông báo thành công hoặc lỗi phải sử dụng hệ thống tập trung:

* Snackbar
* Alert

Không triển khai nhiều cơ chế thông báo khác nhau.

---

## Xử lý lỗi

Mọi tác vụ bất đồng bộ phải có xử lý lỗi.

Ví dụ:

```javascript
try {
    const data = await applicationApi.getAll();
} catch (error) {
    handleError(error);
}
```

Thông báo lỗi phải rõ ràng và thân thiện với người dùng.

Không để ứng dụng phát sinh lỗi chưa được xử lý.

---

# 6. Quy chuẩn Định tuyến

## Quản lý Route tập trung

Tất cả Route phải được khai báo trong:

```text
src/routes/
```

---

## Route Công khai

Được khai báo tại:

```text
src/routes/PublicRoutes.jsx
```

---

## Route Quản trị

Được khai báo tại:

```text
src/routes/AdminRoutes.jsx
```

và đặt bên trong cơ chế bảo vệ quyền truy cập.

---

## Lazy Loading

Mọi Page phải được tải bằng:

```javascript
React.lazy()
```

và hiển thị thông qua:

```jsx
<Suspense>
```

hoặc utility wrapper tương đương.

Code Splitting là yêu cầu bắt buộc.

---

# 7. Quy chuẩn Viết mã nguồn

## Functional Component

Toàn bộ giao diện phải sử dụng:

* Functional Component
* React Hooks

Không sử dụng Class Component.

---

## Tách biệt Logic và Giao diện

Logic nghiệp vụ thuộc:

```text
src/hooks/
```

Giao diện thuộc:

```text
pages/
components/
```

Page và Component chỉ chịu trách nhiệm hiển thị dữ liệu.

---

## Absolute Import

Sử dụng Alias:

```javascript
@/
```

Ví dụ:

```javascript
import { CustomButton } from '@/components';
```

Không sử dụng đường dẫn tương đối nhiều cấp.

---

## ESLint và Formatter

Mã nguồn phải tuân thủ:

```text
eslint.config.js
Prettier
```

Không được tồn tại lỗi nghiêm trọng từ hệ thống kiểm tra mã nguồn.

---

## Barrel Export

Các thư mục chính phải sử dụng:

```javascript
index.js
```

để gom nhóm export.

Ví dụ:

```javascript
import { CustomButton } from '@/components';
```

Thay vì:

```javascript
import CustomButton from '@/components/CustomButton/CustomButton';
```

---

# 8. Quy ước Đặt tên

## Thư mục

Ưu tiên:

```text
kebab-case
```

Ví dụ:

```text
admin-dashboard
user-profile
```

Các thư mục lõi của dự án có thể sử dụng camelCase.

---

## Component React

Sử dụng:

```text
PascalCase.jsx
```

Ví dụ:

```text
AdminDashboard.jsx
AuthLayout.jsx
CustomButton.jsx
```

---

## Hooks, API, Utilities

Sử dụng:

```text
camelCase.js
```

Ví dụ:

```text
useRegistration.js
authApi.js
formatDate.js
```

---

## Biến và Hàm

Sử dụng:

```javascript
camelCase
```

Ví dụ:

```javascript
userData
fetchStatus
handleSubmit()
```

---

## Hằng số

Sử dụng:

```javascript
UPPER_SNAKE_CASE
```

Ví dụ:

```javascript
MAX_FILE_SIZE
API_TIMEOUT
DEFAULT_PAGE_SIZE
```

---

## Tên Component

Tên Component phải trùng với tên file.

Ví dụ:

```javascript
function CustomSkeleton() {
    return ...
}
```

File:

```text
CustomSkeleton.jsx
```

---

# 9. Nguyên tắc Quản trị Dự án

Tài liệu này là tiêu chuẩn kỹ thuật chính thức của dự án sdms-frontend.

Mọi thay đổi liên quan đến:

* Kiến trúc hệ thống
* Cấu trúc thư mục
* Công nghệ nền tảng
* Quy trình phát triển

đều cần được xem xét và thống nhất trước khi triển khai.

Tài liệu có thể được cập nhật theo quá trình phát triển của dự án nhưng phải luôn đảm bảo tính nhất quán và khả năng bảo trì lâu dài của hệ thống.
