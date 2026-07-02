# ⚛️ SMART DORMITORY MANAGEMENT SYSTEM (SDMS) - FRONTEND CONSTITUTION
**Tài liệu Quy tắc Kỹ thuật Tối cao (PROJECT_RULE.md)**

Tài liệu này định nghĩa các quy tắc cốt lõi cho Frontend (React + TypeScript + Vite). Mọi Developer và AI Agent bắt buộc phải tuân thủ trước khi phát triển hoặc thay đổi code.

---

## 1. ARCHITECTURE RULES

**[MANDATORY]**
- Kiến trúc luồng dữ liệu (Data Flow) phải đi theo một chiều duy nhất:
  **Pages -> Hooks -> API Wrapper -> Axios Client -> Backend**
- Tuyệt đối KHÔNG ĐƯỢC:
  - Gọi ngược (ví dụ: Component/API Wrapper import từ Pages).
  - Component gọi thẳng API Wrapper mà không thông qua Custom Hook.
  - Vòng lặp phụ thuộc (Circular Dependency).

---

## 2. BACKEND INTEGRATION RULES

**[MANDATORY]**
- **Luồng xử lý Response**:
  **Backend -> ApiResponse<T> -> Axios Interceptor -> API Wrapper -> Hook -> Component**
- Axios Interceptor (tại `src/api/axiosClient.ts`) là **nơi duy nhất** được phép unwrap `ApiResponse`.
- Component **TUYỆT ĐỐI KHÔNG** được xử lý `AxiosResponse`, `response.data`, hay `ApiResponse`. Component chỉ nhận dữ liệu đã được Hook chuẩn hóa (DTO).

---

## 3. API WRAPPER RULES

**[MANDATORY]**
- Các file trong `src/api` (VD: `authApi.ts`, `registrationApi.ts`) chỉ có 3 nhiệm vụ:
  1. Xây dựng URL và gọi HTTP method qua `axiosClient`.
  2. Map dữ liệu truyền vào (Request DTO).
  3. Định nghĩa kiểu dữ liệu trả về (Response DTO).
- **TUYỆT ĐỐI KHÔNG**:
  - Không quản lý state `Loading`.
  - Không gọi thông báo Toast/Snackbar.
  - Không gọi Hook `useNavigate` hay thao tác Router.
  - Không chứa Business Logic.

---

## 4. HOOK RULES

**[MANDATORY]**
- Custom Hook (VD: `useLogin`, `useRegistration`) là cầu nối giữa UI và API.
- **Hook được phép**:
  - Gọi API Wrapper.
  - Quản lý state `loading`, `error`, `data`.
  - Quản lý logic phân trang (Pagination), lọc (Filter).
  - Xử lý Mutation và hiển thị Toast/Snackbar (thông qua store/context).
- **Hook KHÔNG ĐƯỢC phép**:
  - Render UI.
  - Chứa mã JSX/HTML.
  - Thao tác trực tiếp vào cây DOM (trừ trường hợp dùng `useRef` cho tính năng đặc thù).

---

## 5. COMPONENT RULES

**[MANDATORY]**
- Component (trong `src/components` và `src/pages`) là **Dumb / Presentational Component** (kể cả Page level cũng hạn chế logic).
- **Component chỉ làm nhiệm vụ**:
  - Gọi Custom Hook để lấy State và Action.
  - Render JSX dựa trên State.
  - Truyền Props và lắng nghe Event.
- **TUYỆT ĐỐI KHÔNG**:
  - Không import và gọi `axiosClient` hoặc `XxxApi` trực tiếp.
  - Không viết Business Logic phức tạp bên trong Component (phải đẩy ra Hook hoặc Utils).

---

## 6. AUTHENTICATION RULES

**[CURRENT]**
- Trạng thái đăng nhập được quản lý tập trung tại `AuthContext.tsx`.
- Token (Access Token, Refresh Token) phải được đọc/ghi qua lớp `authStorage.ts`.
- Việc tự động cấp mới Token (Refresh Token Rotation) được xử lý ngầm tại Axios Interceptor.
- Các Route cần bảo mật phải được bọc bởi Route Guard (VD: `<RequireAdmin />`).

---

## 7. AUTHORIZATION RULES

**[MANDATORY]**
- Việc kiểm soát quyền (Role/Permission) như `Admin`, `Student` phải được đánh giá qua trạng thái người dùng lưu trong Context/Store.
- **KHÔNG hardcode role** ẩn trong Component (VD: `if (role === 'ADMIN')`). Nên tạo các hàm helper hoặc custom component như `<Can permission="VIEW_DASHBOARD">`.

---

## 8. SECURITY RULES

**[MANDATORY]**
- **QUY TẮC SỞ HỮU**: Frontend KHÔNG BAO GIỜ được gửi các trường định danh cá nhân như `userId`, `studentId`, `accountId` lên các API đã được xác thực (ngoại trừ thao tác của Admin quản lý người khác).
- Backend sẽ tự trích xuất thông tin người dùng hiện tại thông qua Access Token (JWT).
- Frontend chỉ lưu thông tin user để hiển thị (Avatar, Name) chứ không dùng để định danh khi gọi API.

---

## 9. ERROR HANDLING RULES

**[MANDATORY]**
- **Luồng xử lý Lỗi**:
  **Interceptor -> Normalize Error (Chuẩn hóa) -> Hook -> Component (hoặc Toast)**
- Không xử lý lỗi trùng lặp: Nếu Interceptor đã bật Toast cho lỗi 500 (Internal Server Error), Hook không được bật Toast lỗi tương tự nữa.
- Lỗi nghiệp vụ (400, 403, 404) nên được ném về Hook để Hook quyết định hiển thị lỗi vào form (Inline Error) hay bật Toast.

---

## 10. STATE MANAGEMENT RULES

**[CURRENT]**
- **useState**: Cho các state cục bộ, đơn giản (form input, toggle).
- **useReducer**: Cho các state phức tạp, có tính tuần tự trong một component/hook.
- **Context API**: Dành cho Global State ít thay đổi (Auth, Theme, Locale).
- *(Tương lai)* Nếu hệ thống phình to, cân nhắc áp dụng **Zustand** cho Client State và **React Query** cho Server State.

---

## 11. PERFORMANCE RULES

**[RECOMMENDED]**
- Sử dụng `React.lazy()` và `Suspense` cho các Route/Page để áp dụng Code Splitting, giảm dung lượng bundle khởi tạo.
- Áp dụng `useMemo` cho các tính toán dữ liệu lớn, phức tạp.
- Áp dụng `useCallback` khi truyền function xuống các Child Component được bọc bởi `React.memo()`.

---

## 12. BUILD RULES

**[MANDATORY]**
- **TypeScript Strict Mode**: Code phải pass bộ type checker.
- Mọi Pull Request trước khi Merge bắt buộc phải pass:
  - `npm run lint` (ESLint)
  - `npm run build` (tsc && vite build)
- KHÔNG chấp nhận code có lỗi compile TypeScript hoặc cảnh báo ESLint nghiêm trọng.

---

## 13. API CONTRACT RULES

**[MANDATORY]**
- API Contract là khế ước giữa Backend và Frontend.
- Bất kỳ khi nào Backend thay đổi:
  - Cấu trúc DTO (Request/Response)
  - Cấu trúc `ApiResponse<T>` hoặc Pagination
  - Tên trường (Field Name)
- Frontend **BẮT BUỘC** phải cập nhật ngay lập tức:
  - Interface/Type tại `src/api`
  - API Wrapper
  - Custom Hook gọi API
- Không được để lệch Contract và dùng `any` để lấp liếm lỗi TypeScript.

---

## 14. AI CODING RULES

**[MANDATORY FOR AI AGENTS]**
- **AI BẮT BUỘC ĐỌC** tài liệu này trước khi tiến hành code.
- AI phải phân tích source code hiện tại và đánh giá "impact" trước khi sửa.
- AI **TUYỆT ĐỐI KHÔNG TỰ Ý**:
  - Đổi cấu trúc `axiosClient` hoặc `Interceptor`.
  - Thay đổi chuẩn DTO / Interface đã định nghĩa.
  - Thay đổi Router, AuthContext hay Folder Structure.
  - Phá vỡ API Contract.
- Nếu Backend thay đổi, AI phải báo cáo và cập nhật Type/Interface tử tế, không dùng `any` hay `@ts-nocheck`.
- Nếu AI không hiểu hoặc phát hiện rủi ro cao, phải hỏi lại User trước khi thực hiện.

---

## 15. CURRENT PROJECT ISSUES (HIỆN TRẠNG & VI PHẠM)

Sau khi phân tích source code SDMS Frontend, dưới đây là các vi phạm Kiến trúc và Quy tắc cần khắc phục trong tương lai (KHÔNG YÊU CẦU AI TỰ SỬA NẾU KHÔNG CÓ LỆNH):

1. **TypeScript Build Errors & API Contract Violation**:
   - **Module**: `src/api/registrationApi.ts`, `src/hooks/useRegistration.ts`
   - **Hiện trạng**: Sử dụng `// @ts-nocheck` đầu file và ép kiểu `as any` khi nhận response (Ví dụ: `const res = (await studentRegistrationApi.checkEligibility(...)) as any;`).
   - **Ảnh hưởng**: Phá vỡ hoàn toàn khả năng kiểm tra kiểu của TypeScript, rủi ro runtime error rất cao nếu Backend đổi DTO.
   - **Khuyến nghị**: Loại bỏ `@ts-nocheck`, định nghĩa đầy đủ interface `CheckEligibilityResponse`, `RegistrationPeriodResponse` cho API Wrapper và Hook.

2. **Component Gọi API Trực Tiếp**:
   - **Module**: `src/components/common/NotificationBell.tsx`
   - **Hiện trạng**: Import trực tiếp `notificationApi` và thực hiện `await notificationApi.getUnreadCount()` bên trong `useEffect` của Component thay vì thông qua một Hook.
   - **Ảnh hưởng**: Component ôm đồm logic gọi mạng, quản lý loading/error cục bộ. Code khó test và khó tái sử dụng.
   - **Khuyến nghị**: Tách logic call API ra Custom Hook (ví dụ `useNotificationBell()`) hoặc sử dụng lại hook `useNotifications` hiện có.

3. **Hook Truyền Tham Số Thừa (Security/Design Pattern Violation)**:
   - **Module**: `src/hooks/useNotifications.ts`
   - **Hiện trạng**: Hook định nghĩa `export function useNotifications(userId: string | null)` và yêu cầu phải có `userId` mới fetch data (`if (!userId) return;`), trong khi `notificationApi` hoàn toàn không cần `userId` (Backend tự trích xuất từ JWT qua Interceptor).
   - **Ảnh hưởng**: Làm rối luồng dữ liệu, UI phải cố gắng lấy `userId` truyền vào dù không cần thiết. Trái với Security Rules.
   - **Khuyến nghị**: Bỏ tham số `userId`. Chỉ cần check `isAuthenticated` (từ `useAuth`) để trigger fetch.

4. **Hook Quá Tải Business Logic**:
   - **Module**: `src/hooks/useRegistration.ts`
   - **Hiện trạng**: Hàm `handleNext()` dài gần 100 dòng, chứa chi chít logic if-else validate từng trường thông tin (Step 1 -> 4).
   - **Ảnh hưởng**: Khó maintain, khó đọc.
   - **Khuyến nghị**: Tách logic validate ra một utility validation riêng (ví dụ file Schema với Yup/Zod hoặc hàm validator riêng biệt). Hook chỉ gọi `if (!validateForm(formData)) return;`.
