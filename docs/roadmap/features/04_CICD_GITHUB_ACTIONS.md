# TÍCH HỢP CI/CD VỚI GITHUB ACTIONS (CONTINUOUS INTEGRATION)

## 1. VISION (Tầm nhìn)
Hiện tại dự án chưa có hệ thống tự động kiểm thử và build code (CI/CD) khi có người push code lên nhánh `main`. Mục tiêu của tính năng này là thiết lập thư mục `.github/workflows/` để tự động hóa hoàn toàn quy trình kiểm định chất lượng phần mềm, đảm bảo không có code rác hay code lỗi (compile error) được merge vào hệ thống.

## 2. BUSINESS FLOW / ARCHITECTURE (Luồng kiến trúc)
Kiến trúc CI Pipeline mong đợi:
- **Backend Pipeline (`backend-ci.yml`):** Chạy `mvn clean test` để kiểm tra Unit Test và Compile Java Spring Boot mỗi khi có thay đổi trong thư mục `sdms-backend/`.
- **Frontend Pipeline (`frontend-ci.yml`):** Chạy `npm run lint` và `npm run build` để kiểm tra lỗi cú pháp React/TypeScript mỗi khi có thay đổi trong `sdms-frontend/`.
- **AI Service Pipeline (`ai-ci.yml`):** Chạy `pytest` và `flake8` cho thư mục `sdms-ai-service/`.
- **Docker Build Pipeline:** (Tùy chọn) Tự động build và push Image lên Docker Hub nếu có Release mới.

## 3. IMPLEMENTATION ROADMAP (Lộ trình triển khai)
- **Bước 1:** Khởi tạo lại thư mục `.github/workflows/` tại gốc dự án.
- **Bước 2:** Viết các kịch bản YAML cho từng phân hệ (Backend, Frontend, AI). Tận dụng tính năng `paths:` của GitHub Actions để pipeline chỉ chạy khi đúng thư mục của module đó bị thay đổi (tối ưu hóa phút chạy CI của Monorepo).
- **Bước 3:** Bổ sung README hướng dẫn cách xem trạng thái Pipeline trên GitHub.

---

## 🤖 BÙA CHÚ KÍCH HOẠT (TRIGGER PROMPT)
*Khi bạn muốn AI bắt tay vào lập trình tính năng này, hãy Copy và Paste đoạn Prompt sau vào khung chat:*

```text
Tiến hành thực thi tính năng: "TÍCH HỢP CI/CD GITHUB ACTIONS". 
Hãy đọc tài liệu `docs/roadmap/features/04_CICD_GITHUB_ACTIONS.md`. Nhiệm vụ của bạn là:
1. Tạo thư mục `.github/workflows/` tại gốc dự án.
2. Viết file `backend-ci.yml` chạy bằng Ubuntu, setup JDK 17 và chạy lệnh Maven.
3. Viết file `frontend-ci.yml` chạy bằng Ubuntu, setup Node 20 và chạy lệnh npm build.
Đảm bảo cấu hình `paths` đúng để tối ưu Monorepo.
```
