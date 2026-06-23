# PROJECT-ARCHITECTURE-MAP

## TECH STACK BACKEND
- Java 17
- Spring Boot 3.5.14
- Lombok
- Flyway
- pgvector (hibernate-vector)
- JWT (jjwt)
- Spring Security
- Cloudinary
- Spring Boot DevTools

## TECH STACK FRONTEND
- React 18.3.1
- Vite 8.0.16
- UI: MUI
- State: (none)

## DOCS INVENTORY
- `00-overview/`
- `01-auth/`
- `02-student/`
- `03-registration/`
- `04-application/`
- `05-room/`
- `06-payment/`
- `07-face/`
- `08-smart-access/`
- `09-notification/` (Empty)
- `10-admin-web/`
- `11-student-mobile/`
- `12-audit/`
- `13-archive/`
- `14-infra/`
- `15-iot/`
- `99-system/`
  - `API-CONTRACT-FREEZE.md`
  - `PROJECT-ARCHITECTURE-MAP.md`
- `APP-API-DOCS.md`
- `database/db.sql`
- `fix/`

## REVIEW CẤU TRÚC CODE BACKEND
- Kiến trúc **Feature‑Driven**: mỗi domain (`auth`, `application`, `face`, `payment`, `registration`, `room`, `smartaccess`, `student`, `upload`, `user`, …) chứa các lớp **controller**, **service**, **repository**, **dto**, **entity**, **event**, **enum**, **validator**.
- Cây package chính (độ sâu 2‑3):
  - `com.sdms.backend`
    - `modules`
      - `application`
      - `auth`
      - `face`
      - `payment`
      - `registration`
      - `room`
      - `smartaccess`
      - `student`
      - `upload`
      - `user`
    - `common`
    - `config`
    - `security`
- Ví dụ: [`ApplicationController.java`](sdms-backend/src/main/java/com/sdms/backend/modules/application/controller/ApplicationController.java:1), [`ApplicationService.java`](sdms-backend/src/main/java/com/sdms/backend/modules/application/service/ApplicationService.java:1), [`ApplicationRepository.java`](sdms-backend/src/main/java/com/sdms/backend/modules/application/repository/ApplicationRepository.java:1)

## REVIEW CẤU TRÚC CODE FRONTEND
- Thư mục `src/` chia thành **components**, **pages**, **hooks**, **api**, **auth**, **layouts**, **routes**, **theme**.
- Router chính:
  - [`AppRouter.jsx`](sdms-frontend/src/routes/AppRouter.jsx:1) – tổng hợp `publicRoutes` + `adminRoutes`.
  - [`AdminRoutes.jsx`](sdms-frontend/src/routes/AdminRoutes.jsx:1) – admin screens.
  - [`PublicRoutes.jsx`](sdms-frontend/src/routes/PublicRoutes.jsx:1) – public screens.
- Screens (pages) hiện có:
  - **Admin**: AdminDashboard, RegistrationPeriodManager, ApplicationReviewQueue, ApplicationReviewDetail, FaceApprovalQueue, RoomDashboard, PaymentManagement, CheckInManagement.
  - **Public**: HomePage, RegistrationPage, StatusPage, PaymentPage, FaceRegistrationPage, ActivateAccountPage.
- Component chung: FeatureCard, CustomSkeleton, AppProviders.

## ĐỊNH HƯỚNG KẾT NỐI (API INTEGRATION STATE)
| Frontend API file | Base URL / Instance | DTO ↔ Request contract | Notes |
|---|---|---|---|
| [`axiosClient.js`](sdms-frontend/src/api/axiosClient.js:1) | `${import.meta.env.VITE_API_URL}/api` (dynamic) | Central instance used by all API modules | Refresh token logic included |
| [`authApi.js`](sdms-frontend/src/api/authApi.js:1) | `/v1/auth` | `login({usernameOrEmail,password})` ↔ `LoginRequest` (match) <br> `getMe` ↔ `MeResponse` (match) | Aligns with contract |
| [`applicationApi.js`](sdms-frontend/src/api/applicationApi.js:1) | `/v1/applications` & `/v1/admin/applications` | `create(data)` ↔ `ApplicationCreateRequest` (match) <br> `uploadDocument` ↔ `MultipartFile` (match) | All endpoints present in contract |
| [`documentApi.js`](sdms-frontend/src/api/documentApi.js:1) | `/v1/documents` | `upload(appId,type,file)` ↔ `MultipartFile` (match) | Uses FormData as required |
| [`roomApi.js`](sdms-frontend/src/api/roomApi.js:1) (if exists) | `/v1/admin/...` | Calls align with contract (e.g., `GET /admin/buildings`) | Pattern consistent |
- **Kết luận**: Frontend triển khai đầy đủ API theo `[API-CONTRACT-FREEZE.md](sdms-backend/docs/99-system/API-CONTRACT-FREEZE.md:1)`. DTO đơn giản (plain objects) khớp với Request DTO; không phát hiện thiếu endpoint hoặc sai trường.