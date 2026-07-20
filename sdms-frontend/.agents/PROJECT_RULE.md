# ⚛️ SMART DORMITORY MANAGEMENT SYSTEM (SDMS) - FRONTEND CONSTITUTION
**Tài liệu Quy tắc Kỹ thuật Tối cao (PROJECT_RULE.md)**
**Phiên bản:** 2.0 | **Cập nhật:** 2026-07-19 | **Trạng thái:** BẮT BUỘC TUÂN THỦ

---

## 1. GOVERNANCE HIERARCHY

```
Business Documentation  (docs/business/)
         ↓
   PROJECT_RULE.md      (luật kỹ thuật tối cao)
         ↓
      AGENTS.md         (quy trình thực thi của AI)
         ↓
   Implementation       (code .ts / .tsx)
         ↓
      Testing
         ↓
     Deployment
```

Higher-level documents always have higher priority. Implementation must NEVER violate higher-level documents.

---

## 2. SINGLE SOURCE OF TRUTH

- **Business Documentation** (`docs/business/`) là Business Baseline chính thức.
- **PROJECT_RULE.md** định nghĩa các quy tắc kỹ thuật.
- **AGENTS.md** định nghĩa quy trình thực thi.
- Implementation phải tuân thủ tất cả. Nếu conflict, phải báo cáo ngay. **Không bao giờ giải quyết âm thầm.**

---

## 3. BUSINESS FREEZE POLICY

Business Documentation được coi là **Frozen (Đóng băng)**.
AI KHÔNG ĐƯỢC tự ý thay đổi:
- Business Rule, Workflow, Permission, Business Decision
- State Machine, Business Glossary, Business Domain

Nếu cần thay đổi Business, AI phải báo cáo conflict và xin phê duyệt.

---

## 4. DEFINITION OF DONE (DoD)

Một task chỉ được coi là HOÀN THÀNH khi TẤT CẢ tiêu chí sau đều được đáp ứng:
- [ ] Implementation hoàn chỉnh.
- [ ] `npm run build` thành công (không có lỗi TypeScript).
- [ ] `npm run lint` sạch (không có errors, tối thiểu warnings).
- [ ] Không có Architecture Violation.
- [ ] Không có Business Rule Violation.
- [ ] Không có API Contract Violation.
- [ ] Documentation đã được đồng bộ.
- [ ] Không có unresolved TODO.
- [ ] Không có duplicated logic.
- [ ] Không có broken dependency.

---

## 5. TECH STACK THỰC TẾ (VERIFIED FROM CODE)

| Công nghệ | Phiên bản | Ghi chú |
|---|---|---|
| React | 18.3.1 | Functional Components + Hooks |
| TypeScript | ^5.7.3 | Strict mode bắt buộc |
| Vite | ^8.0.16 | Build tool, `npm run dev` để chạy |
| MUI Material | ^6.5.0 | Component library chính |
| MUI X Data Grid | ^7.1.0 | Bảng dữ liệu (dùng `GridSlotProps['pagination']` KHÔNG phải `basePagination`) |
| MUI Lab | ^6.0.0-beta.0 | Experimental components |
| React Router DOM | ^6.30.0 | Client-side routing |
| Axios | - | HTTP Client (đã được wrap trong `axiosClient`) |
| Recharts | - | Biểu đồ trong Dashboard |
| notistack | - | Toast/Snackbar notifications |
| ESLint | ^9.21.0 | `eslint.config.js` (flat config format) |

---

## 6. CẤU TRÚC THƯ MỤC (VERIFIED FROM CODE)

```
sdms-frontend/src/
├── api/                   # API Wrappers (gọi axiosClient, định nghĩa types đầu vào)
│   ├── axios-client.ts    # Axios instance, interceptors - KHÔNG CHỈNH SỬA
│   ├── index.ts           # Barrel export của tất cả API wrappers
│   ├── auth-api.ts
│   ├── application-api.ts
│   ├── change-room-api.ts
│   ├── check-in-api.ts
│   ├── checkout-api.ts
│   ├── dashboard-api.ts
│   ├── face-api.ts
│   ├── gate-api.ts
│   ├── notification-api.ts
│   ├── payment-api.ts
│   ├── registration-api.ts
│   ├── room-api.ts
│   ├── room-pin-api.ts
│   ├── smart-access-api.ts
│   ├── stay-extension-api.ts
│   ├── system-config-api.ts
│   └── utility-api.ts
│
├── types/                 # TypeScript interfaces / DTOs (SSOT cho kiểu dữ liệu)
│   ├── api.ts             # ApiErrorData, getErrorMessage(), isNotFoundError()
│   ├── auth.ts            # UserProfile, LoginData, AuthTokens, ...
│   ├── application.ts
│   ├── change-room.ts
│   ├── check-in.ts
│   ├── checkout.ts
│   ├── dashboard.ts
│   ├── face.ts
│   ├── gate.ts
│   ├── notification.ts
│   ├── payment.ts
│   ├── registration.ts
│   ├── room.ts
│   ├── stay-extension.ts
│   ├── student.ts
│   ├── system-config.ts
│   └── utility.ts
│
├── hooks/                 # Custom hooks (chứa tất cả business logic của UI)
│   ├── useCheckInManagement.ts
│   ├── useCheckoutManagement.ts
│   ├── useStayExtensionManagement.ts
│   ├── useSystemConfig.ts
│   ├── useUtilityReading.ts
│   ├── useNotificationHistory.ts
│   ├── useRoomDashboard.ts
│   ├── useRegistration.ts
│   ├── useRegistrationManagerUi.ts
│   ├── useEligibilityManager.ts
│   ├── useFaceApproval.ts
│   ├── useSmartAccess.ts
│   ├── useApplicationReview.ts
│   ├── useApplicationStatus.ts
│   ├── usePayment.ts, usePaymentManagement.ts
│   ├── useLogin.ts, useForgotPassword.ts, useResetPassword.ts
│   ├── useBuildingForm.ts, useFloorForm.ts
│   ├── useCreateRoomForm.ts, useUpdateRoomForm.ts
│   ├── useRoomActionMenu.ts, useBedDetail.ts
│   └── ...
│
├── pages/
│   ├── admin/             # Tất cả trang Admin
│   │   ├── RoomManagement/
│   │   │   ├── RoomManagementPage.tsx
│   │   │   └── components/  (BedDetailDrawer, RoomCard, RoomActionMenu, ...)
│   │   ├── ChangeRoomManagement/
│   │   │   └── index.tsx
│   │   └── ...
│   └── public/            # Trang Public (student)
│       ├── components/
│       │   ├── Registration/
│       │   └── Status/
│       └── ...
│
├── components/
│   ├── common/            # Shared UI (NotificationBell, StatCard, CustomSkeleton, ...)
│   └── pagination/        # DataGridPagination, DataGridPaginationAction, ...
│
├── providers/
│   └── AuthProvider.tsx   # Auth Context - export useAuth() hook
│
├── routes/
│   ├── AdminRoutes.tsx
│   └── PublicRoutes.tsx
│
├── theme/                 # Aurora Theme System
│   ├── index.ts           # Export `theme` (extendTheme)
│   ├── theme.ts           # themeOverrides object
│   ├── typography.ts
│   ├── shadows.ts
│   ├── components/        # MUI component overrides (DataGrid.tsx, Button.tsx, ...)
│   └── palette/           # Color palette
│
├── helpers/
│   ├── auth-storage.ts    # Quản lý token localStorage
│   ├── snackbar.ts        # Wrapper helper: snackbar.success(), snackbar.error()
│   └── route-utils.ts     # wrap() helper cho lazy routes
│
└── layouts/
    ├── AdminLayout.tsx
    └── AuthLayout.tsx
```

---

## 7. KIẾN TRÚC DATA FLOW (LUẬT BẮT BUỘC)

```
Pages/Components  →  Custom Hooks  →  API Wrappers  →  axiosClient  →  Backend
  (Dumb/UI only)     (Business logic)  (HTTP calls)    (Interceptors)
```

### ❌ NGHIÊM CẤM:
- Component/Page gọi trực tiếp API Wrapper (phải qua Hook).
- Hook render JSX hoặc thao tác DOM trực tiếp.
- API Wrapper quản lý state, gọi `snackbar`, dùng `useNavigate`.
- Import kiểu dữ liệu (interfaces) từ `src/api/` (chúng phải ở `src/types/`).

---

## 8. QUY TẮC IMPORT (CRITICAL - PHẢI TUÂN THỦ)

### ✅ ĐÚNG:
```typescript
// Kiểu dữ liệu: import từ src/types/
import type { UserProfile } from '@/types/auth';
import type { RoomWithBeds, BedResponse } from '@/types/room';
import type { HousingAssignmentDto } from '@/types/check-in';

// API functions: import từ src/api/
import checkInApi from '@/api/check-in-api';
import { notificationApi } from '@/api/notification-api';
import { adminRegistrationApi, studentRegistrationApi } from '@/api';

// Shared helpers từ api/notification-api (PageResponse):
import type { PageResponse } from '@/api/notification-api';
```

### ❌ SAI (gây lỗi lint và TS):
```typescript
// Đừng bao giờ import type từ api/ nếu type đã có trong types/
import checkInApi, { HousingAssignmentDto } from '@/api/check-in-api'; // SAI
import { notificationApi, NotificationResponse } from '@/api/notification-api'; // SAI
```

---

## 9. QUY TẮC API WRAPPER

**Trách nhiệm:**
- Build URL
- Map Request DTO (params, body)
- Trả về kiểu đúng: `Promise<T>` (axiosClient interceptor đã unwrap `.data`)

**Ví dụ chuẩn:**
```typescript
// src/api/check-in-api.ts
import axiosClient from './axios-client';
import type { PageResponse } from './notification-api'; // PageResponse dùng chung
import type { HousingAssignmentDto, HousingAssignmentListParams } from '../types/check-in';

const checkInApi = {
  getList(params?: HousingAssignmentListParams): Promise<PageResponse<HousingAssignmentDto>> {
    return axiosClient.get(`/v1/admin/housing-assignments`, { params });
  },
  confirmCheckIn(assignmentId: string): Promise<{ message: string }> {
    return axiosClient.post(`/v1/admin/check-in/${assignmentId}`);
  },
};

export default checkInApi;
```

---

## 10. API RESPONSE CONTRACT (BẮT BUỘC)

### Cấu trúc Backend luôn trả về:
```json
// Thành công:
{ "success": true, "message": "...", "data": { ... } }

// Thất bại:
{ "success": false, "message": "...", "errorCode": "...", "data": null }

// Validation:
{ "success": false, "message": "...", "errorCode": "VALIDATION_FAILED",
  "data": { "fieldName": "validation message" } }
```

### axiosClient Interceptor đã xử lý (KHÔNG làm thủ công lại):
```typescript
// response.interceptors.response -> unwrap data:
(response) => response.data?.data ?? response.data
```
> **⚠️ KẾT QUẢ:** Khi bạn gọi `await checkInApi.getList(...)`, bạn đã nhận được trực tiếp `data` (là `PageResponse<T>`), KHÔNG phải `ApiResponse<PageResponse<T>>`.  
> **KHÔNG cần** thêm `.data` lần nữa. Không cần `res?.data ? res.data : res`.

### Error Codes:
| HTTP Status | errorCode |
|---|---|
| 400 | `VALIDATION_FAILED` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `RESOURCE_NOT_FOUND` |
| 409 | `APPLICATION_ALREADY_EXISTS` |
| 500 | `INTERNAL_SERVER_ERROR` |

---

## 11. QUY TẮC AUTHENTICATION & AUTHPROVIDER

### `AuthProvider` và `useAuth()`:
```typescript
// AuthContext export (src/providers/AuthProvider.tsx):
interface AuthContextType {
  user: UserProfile | null;  // user, KHÔNG phải admin
  loading: boolean;
  login: (authData: AuthData) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Sử dụng trong component:
const { user, isAuthenticated } = useAuth();

// UserProfile interface (src/types/auth.ts):
interface UserProfile {
  accountId: string;
  username: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN' | string;
  status: string;
}
```
> **⚠️ QUAN TRỌNG:** Tên biến trong context là `user`, KHÔNG phải `admin`. Đây là sự thay đổi từ phiên bản cũ. Mọi component sử dụng `const { admin } = useAuth()` là SAI.

### Token Storage:
- Access Token & Refresh Token được lưu qua `authStorage` (`src/helpers/auth-storage.ts`).
- Refresh Token tự động xử lý bởi Axios Interceptor. KHÔNG tự implement lại.

---

## 12. QUY TẮC AURORA THEME

Theme của dự án là **Aurora Theme** (Material UI v6, dark mode first).

```typescript
// Import theme (src/theme/index.ts):
import { theme } from '@/theme';

// Dùng trong component:
import { alpha } from '@mui/material/styles';
sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
```

**MUI X DataGrid v7 - Breaking Changes:**
- Slot name ĐÚNG: `GridSlotProps['pagination']` (KHÔNG phải `basePagination`)
- Xem `src/components/pagination/DataGridPagination.tsx` làm ví dụ.

---

## 13. QUY TẮC TOAST / SNACKBAR

Chỉ được dùng **một trong hai** cách này (không trộn lẫn):

```typescript
// Cách 1: snackbar helper (ưu tiên trong hooks mới)
import { snackbar } from '@/helpers/snackbar';
snackbar.success('Thành công!');
snackbar.error('Lỗi!');

// Cách 2: notistack (dùng trong hooks cũ, không migrate khi không cần thiết)
import { useSnackbar } from 'notistack';
const { enqueueSnackbar } = useSnackbar();
enqueueSnackbar('message', { variant: 'success' });
```

---

## 14. QUY TẮC PHÂN TRANG (PAGINATION)

Tất cả API trả về danh sách dùng `PageResponse<T>`:
```typescript
// src/api/notification-api.ts (PageResponse được định nghĩa ở đây, dùng chung)
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}
```

Hook pagination pattern chuẩn:
```typescript
const [page, setPage] = useState(0);       // 0-indexed
const [rowsPerPage, setRowsPerPage] = useState(10);
const [totalElements, setTotalElements] = useState(0);

const res = await api.getList({ page, size: rowsPerPage, ... });
setData(res.content ?? []);
setTotalElements(res.totalElements ?? 0);
```

---

## 15. QUY TẮC ERROR HANDLING TRONG HOOKS

```typescript
// ✅ Pattern chuẩn:
try {
  await api.doSomething();
  snackbar.success('Thành công!');
} catch (err: unknown) {
  const msg = (err as any)?.message || 'Có lỗi xảy ra';
  snackbar.error(msg);
}

// ✅ Nếu không cần log lỗi:
try {
  await api.doSomething();
} catch {
  snackbar.error('Có lỗi xảy ra');
}

// ❌ SAI - khai báo biến err mà không dùng:
} catch (err: any) {
  snackbar.error('Có lỗi xảy ra'); // err bị khai báo nhưng không sử dụng -> lint error
}
```

---

## 16. QUY TẮC LINT / CODE STYLE

Project dùng ESLint với `eslint.config.js` (Flat Config - ESLint v9+):
- `unused-imports/no-unused-vars`: Bắt buộc - xóa mọi biến khai báo mà không dùng
- `unused-imports/no-unused-imports`: Bắt buộc - xóa mọi import không dùng
- `import/order`: Warning - sắp xếp import theo thứ tự (third-party → @/ → relative)
- `prettier/prettier`: Tự động format qua `npm run lint:fix`
- `react-refresh/only-export-components`: Warning - file React chỉ export components

**Lệnh kiểm tra:**
```bash
npm run build        # Kiểm tra TypeScript
npm run lint         # Kiểm tra ESLint
npm run lint:fix     # Tự sửa các lỗi auto-fixable
```

---

## 17. QUY TẮC AN TOÀN

- Frontend KHÔNG tự gửi `userId`/`studentId` lên các API xác thực (trừ Admin quản lý người khác).
- Không hardcode roles trong components. Dùng `user.role` từ `useAuth()`.
- Không expose token ra ngoài `authStorage` và `axiosClient`.

---

## 18. DOCUMENTATION SYNC POLICY

Khi implementation thay đổi ảnh hưởng tới:
- Business Rule, Workflow, Permission, State Machine, DTO, API Contract, Architecture, Config, README

Agent PHẢI cập nhật documentation tương ứng. **Implementation chưa xong cho đến khi documentation được đồng bộ.**

**Vị trí tài liệu:**
- API Contracts → `docs/api/`
- UI/UX Specs → `sdms-frontend/docs/`
- Work Logs → `docs/work_logs/`
- Handoff → `docs/handoff/HANDOFF_SUMMARY.md`
