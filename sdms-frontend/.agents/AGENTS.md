# AI AGENT WORKFLOW FOR SDMS FRONTEND
**Operational Manual for Frontend AI Agents (AGENTS.md)**
**Phiên bản:** 2.0 | **Cập nhật:** 2026-07-19 | **Trạng thái:** BẮT BUỘC TUÂN THỦ

---

## 1. GOVERNANCE HIERARCHY

```
Business Documentation  (docs/business/)
         ↓
   PROJECT_RULE.md      (.agents/PROJECT_RULE.md - đọc TRƯỚC)
         ↓
      AGENTS.md         (file này)
         ↓
   Implementation       (code .ts / .tsx)
```

Higher-level documents always have higher priority. Never violate higher-level documents.

---

## 2. MISSION & SCOPE

- **Role:** AI Agent làm việc trong thư mục `sdms-frontend/`.
- **Goal:** Implement UI, fix bugs, refactor code theo đúng engineering principles.
- **Scope:** Chỉ làm việc trong `sdms-frontend/`. Bỏ qua `node_modules/`, `dist/`.
- **Blind Spot:** Agent ở sub-module KHÔNG thấy `sdms-backend/`. Muốn xem API contracts thực tế, phải đọc `docs/api/`.

---

## 3. BƯỚC BẮT BUỘC TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ

Trước khi phân tích hoặc sửa code, Agent PHẢI:

1. **Đọc `PROJECT_RULE.md`** - Toàn bộ, không skip.
2. **Đọc tài liệu API liên quan** nếu task động đến API call: tìm trong `docs/api/`.
3. **Audit code thực tế** (không đoán, không nhớ từ context cũ):
   - Dùng `view_file` để đọc file trước khi sửa.
   - Dùng `grep_search` để tìm pattern, import, usage.
   - Dùng `list_dir` để xem cấu trúc thư mục thực tế.

> **NGHIÊM CẤM**: Đoán mò, dựa vào memory của context cũ, hoặc bỏ qua bước đọc file.

---

## 4. WORKFLOW: PHÂN TÍCH & LẬP KẾ HOẠCH

Khi nhận được task, thực hiện theo thứ tự:

### Bước 4.1 - Xác định loại task
| Task Type | Phải đọc thêm |
|---|---|
| Thêm/sửa API call | `docs/api/<feature>_api.md` + `src/types/<domain>.ts` |
| Thêm trang mới | `src/routes/AdminRoutes.tsx` hoặc `PublicRoutes.tsx` |
| Thêm component | `src/components/` - kiểm tra đã có chưa |
| Sửa hook | File hook tương ứng + `PROJECT_RULE.md §7-15` |
| Sửa theme | `src/theme/` + `PROJECT_RULE.md §12` |

### Bước 4.2 - Change Impact Analysis
Đánh giá impact trên:
- Component Layout, Router Navigation, AuthContext state
- Backend API Contract (DTO thay đổi → `src/types/` phải cập nhật)
- Lint/Build (biến mới có được dùng không? Import có đúng không?)

### Bước 4.3 - Lập kế hoạch
- Liệt kê chính xác files cần sửa.
- Nếu task ảnh hưởng Business Rule hoặc API Contract: DỪNG, báo cáo user trước.

---

## 5. WORKFLOW: IMPLEMENTATION

### Rule 5.1 - Luồng code bắt buộc
```
Pages/Components → Custom Hooks → API Wrappers → axiosClient → Backend
```

### Rule 5.2 - "Dumb Component" Pattern
Mọi `Page` và `Component` phải là **Dumb (Presentational)**:
- Nhận props, render UI, gọi callback.
- Không chứa `useState` phức tạp, không gọi API trực tiếp.
- Logic nghiệp vụ nằm trong **Custom Hooks** (`src/hooks/`).

### Rule 5.3 - Quy tắc Import bắt buộc

✅ **ĐÚNG:**
```typescript
// Kiểu dữ liệu → import từ src/types/
import type { HousingAssignmentDto } from '@/types/check-in';
import type { NotificationResponse } from '@/types/notification';
import type { UserProfile } from '@/types/auth';

// API functions → import từ src/api/
import checkInApi from '@/api/check-in-api';
import { notificationApi } from '@/api/notification-api';
import { adminRegistrationApi } from '@/api'; // barrel index.ts

// PageResponse dùng chung: import từ api/notification-api
import type { PageResponse } from '@/api/notification-api';
```

❌ **SAI** (Agent bị lỗi lint ngay lập tức):
```typescript
import checkInApi, { HousingAssignmentDto } from '@/api/check-in-api'; // type ở sai chỗ
import { notificationApi, NotificationResponse } from '@/api/notification-api'; // type ở sai chỗ
const { admin } = useAuth(); // 'admin' không tồn tại, phải là 'user'
```

### Rule 5.4 - axiosClient đã unwrap data
Interceptor của `axiosClient` đã xử lý `response.data?.data ?? response.data`.

```typescript
// ✅ ĐÚNG: data đã được unwrap
const list = await roomApi.getList(params); // list là PageResponse<T>
list.content; // Dùng ngay

// ❌ SAI: unwrap thủ công
const res = await roomApi.getList(params);
const list = res?.data ? res.data : res; // KHÔNG CẦN, sẽ bị undefined
```

### Rule 5.5 - Error handling pattern
```typescript
// ✅ Pattern 1: dùng catch không có biến (khi không cần log lỗi)
try {
  await api.doSomething();
  snackbar.success('Thành công!');
} catch {
  snackbar.error('Có lỗi xảy ra');
}

// ✅ Pattern 2: dùng err khi cần message từ backend
try {
  await api.doSomething();
} catch (err: unknown) {
  snackbar.error((err as any)?.message || 'Có lỗi xảy ra');
}

// ❌ SAI: khai báo err nhưng không dùng → lint error
} catch (err: any) { // err bị khai báo nhưng chỉ dùng snackbar fixed string
  snackbar.error('Có lỗi xảy ra');
}
```

### Rule 5.6 - useAuth() context
```typescript
// ✅ ĐÚNG (tên biến thực tế trong context là 'user'):
const { user, isAuthenticated } = useAuth();
if (!user) return;

// ❌ SAI (tên cũ, không còn tồn tại):
const { admin } = useAuth(); // Lỗi runtime
```

### Rule 5.7 - Pagination pattern chuẩn
```typescript
const [page, setPage] = useState(0);           // 0-indexed
const [rowsPerPage, setRowsPerPage] = useState(10);
const [totalElements, setTotalElements] = useState(0);

const res = await api.getList({ page, size: rowsPerPage });
setData(res.content ?? []);
setTotalElements(res.totalElements ?? 0);
```

### Rule 5.8 - MUI DataGrid slot names (v7)
```typescript
// ✅ ĐÚNG (MUI X DataGrid v7):
type BasePaginationProps = GridSlotProps['pagination'];

// ❌ SAI (v6 API, đã bị xóa):
type BasePaginationProps = GridSlotProps['basePagination'];
```

### Rule 5.9 - Quy tắc Comment trong React (JSX)
💡 **Quy tắc nhanh khi viết comment trong file React (.tsx / .jsx):**
- **Bên ngoài lệnh return (Khu vực Logic & Object JavaScript):** Dùng `//` hoặc `/* */` bình thường. (Đặc biệt lưu ý khi viết code bên trong thuộc tính `sx={{ ... }}` của MUI, đây là object JavaScript thuần túy nên PHẢI dùng `//` hoặc `/* */`).
- **Bên trong lệnh return (Khu vực Giao diện/JSX):** Bắt buộc phải bọc comment trong `{/* ... */}`. Nếu dùng HTML comment (`<!-- -->`) hoặc JS comment (`//`), React sẽ bị lỗi cú pháp hoặc render thẳng ra giao diện dưới dạng văn bản.

---

## 6. WORKFLOW: VERIFICATION (BẮT BUỘC sau mỗi thay đổi)

Agent KHÔNG ĐƯỢC tuyên bố task hoàn thành mà không chạy:

```bash
npm run build        # Kiểm tra TypeScript (zero errors bắt buộc)
npm run lint         # Kiểm tra ESLint
npm run lint:fix     # Tự sửa lỗi auto-fixable trước khi lint
```

Nếu build fail → **Agent PHẢI sửa lỗi trước khi dừng**.

### Checklist tự kiểm tra:
- [ ] Không có unused variable / import (`unused-imports` plugin)
- [ ] Không có biến `catch (err)` khai báo mà không dùng
- [ ] `import type { ... }` dùng đúng cho type-only imports
- [ ] Không có `const { admin } = useAuth()` → phải là `user`
- [ ] Không có `.data?.data` manual unwrap sau khi gọi axiosClient
- [ ] Không có `GridSlotProps['basePagination']` → phải là `pagination`

---

## 7. WORKFLOW: ĐỒNG BỘ DOCUMENTATION

Sau khi sửa code, nếu task ảnh hưởng tới:

| Thay đổi | Tài liệu cần cập nhật |
|---|---|
| Thêm/sửa route | Cập nhật `sdms-frontend/docs/routes.md` (nếu có) |
| Thêm/sửa API call | Đối chiếu `docs/api/<feature>.md` |
| Thêm DTO type mới | Tạo/cập nhật `src/types/<domain>.ts` |
| Thêm hook mới | Cập nhật work log `docs/work_logs/session_YYYY_MM_DD.md` |
| Hoàn thành roadmap feature | Xóa `docs/roadmap/features/<ID>_<NAME>.md` |

---

## 8. WORKFLOW: CHANGE SUMMARY

Cuối mỗi task, cung cấp summary cho user:

```
## Tóm tắt thay đổi
**Files đã sửa:**
- `src/hooks/useXxx.ts` - [Lý do]
- `src/pages/admin/Xxx.tsx` - [Lý do]

**Documentation cập nhật:**
- `docs/work_logs/session_YYYY_MM_DD.md` - Ghi lại session

**Impact:**
- [Mô tả impact ngắn gọn]

**Technical Debt còn lại:**
- [Liệt kê nếu có]

**Task khuyến nghị tiếp theo:**
- [Gợi ý task tiếp theo]
```

---

## 9. ANTI-ASSUMPTION RULES

- **Không đoán mò:** Đọc file trước khi sửa. Luôn luôn.
- **Không nhớ từ context cũ:** Session mới = đọc lại từ đầu.
- **Không tin tài liệu 100%:** Document có thể outdated. Code là sự thật. Đối chiếu.
- **Không silent resolve conflict:** Nếu code và docs mâu thuẫn, báo user.

---

## 10. SESSION HISTORY RULE

Cuối mỗi session hoặc hoàn thành major task:
- **Tạo/cập nhật** `docs/work_logs/session_YYYY_MM_DD.md`
- **Ghi lại:** Files thay đổi, lý do thay đổi, trạng thái hiện tại, next steps.
- **Phân biệt:** `docs/work_logs/` = lịch sử vĩnh viễn | `docs/handoff/` = truyền context tức thì.

---

## 11. ROADMAP RULE

Khi user đề xuất ý tưởng mới:
1. **KHÔNG code ngay.**
2. Tạo `docs/roadmap/features/[ID]_[FEATURE_NAME].md` với Vision, Business Flow, Implementation Plan.
3. Khi feature hoàn thành → xóa file roadmap, cập nhật docs chính.

---

## 12. API DOCUMENT READING RULE (MỚI - QUAN TRỌNG)

Khi task có liên quan đến API endpoint (thêm feature mới, sửa API call):

1. **Tìm tài liệu API:** Tìm trong `docs/api/` file tương ứng với feature đó.
2. **Đọc API contract:** Xác nhận endpoint URL, HTTP method, Request DTO, Response DTO.
3. **Kiểm tra types:** Mở `src/types/<domain>.ts` để xem interfaces đã có.
4. **Kiểm tra API wrapper:** Mở `src/api/<domain>-api.ts` để xem wrapper đã implement.
5. **Nếu DTO thay đổi:** Cập nhật `src/types/<domain>.ts` TRƯỚC, sau đó mới sửa hook/component.
6. **Nếu endpoint chưa có wrapper:** Tạo trong `src/api/<domain>-api.ts` theo pattern chuẩn.

> **Nguyên tắc:** Tài liệu API trong `docs/api/` là nguồn chân lý cho Backend contract. Code trong `src/api/` và `src/types/` phải phản ánh đúng những gì tài liệu mô tả.

---

## 13. QUICK REFERENCE - CÁC PATTERNS HAY DÙNG

### Hook mới (template):
```typescript
import { useState, useEffect, useCallback } from 'react';
import { snackbar } from '@/helpers/snackbar';
import type { PageResponse } from '@/api/notification-api';
import domainApi from '@/api/domain-api';
import type { DomainDto, DomainListParams } from '@/types/domain';

export const useDomainList = () => {
  const [data, setData] = useState<DomainDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await domainApi.getList({ page, size: rowsPerPage });
      setData(res.content ?? []);
      setTotalElements(res.totalElements ?? 0);
    } catch {
      snackbar.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => { fetchList(); }, [fetchList]);

  return { data, loading, page, setPage, rowsPerPage, setRowsPerPage, totalElements, fetchList };
};
```

### API Wrapper mới (template):
```typescript
import axiosClient from './axios-client';
import type { PageResponse } from './notification-api';
import type { DomainDto, DomainCreateRequest } from '@/types/domain';

const domainApi = {
  getList(params?: { page?: number; size?: number }): Promise<PageResponse<DomainDto>> {
    return axiosClient.get('/v1/admin/domain', { params });
  },
  create(data: DomainCreateRequest): Promise<DomainDto> {
    return axiosClient.post('/v1/admin/domain', data);
  },
  update(id: string, data: Partial<DomainCreateRequest>): Promise<DomainDto> {
    return axiosClient.put(`/v1/admin/domain/${id}`, data);
  },
  delete(id: string): Promise<void> {
    return axiosClient.delete(`/v1/admin/domain/${id}`);
  },
};

export default domainApi;
```

### Type file mới (template):
```typescript
// src/types/domain.ts
export interface DomainDto {
  id: string;
  name: string;
  // ... other fields matching backend DTO
  createdAt?: string;
  updatedAt?: string;
}

export interface DomainCreateRequest {
  name: string;
  // ... other required fields
}

export interface DomainListParams {
  page?: number;
  size?: number;
  search?: string;
}
```

---

## 14. DIRECTORY ORIENTATION RULE

Mỗi thư mục quan trọng PHẢI có `README.md` hoặc file index. Agent phải tạo file này nếu chưa có khi làm việc trong thư mục đó.

---

## 15. NO GARBAGE RULE

- Mọi file tạo ra phải có mục đích rõ ràng.
- File tạm/test phải xóa ngay sau khi dùng.
- Không để lại `TODO` chưa giải quyết khi kết thúc task.
- Không để lại biến/import dư thừa (`unused-imports` plugin sẽ bắt ngay).
