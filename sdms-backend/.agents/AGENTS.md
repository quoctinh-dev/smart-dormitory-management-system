# AI AGENT WORKFLOW FOR SDMS BACKEND
**Operational Manual for Backend AI Agents (AGENTS.md)**

## 1. GOVERNANCE HIERARCHY
Ensure every document clearly defines this hierarchy:
Business Documentation
↓
PROJECT_RULE
↓
AGENTS
↓
Implementation
↓
Testing
↓
Deployment

Higher-level documents always have higher priority. Implementation must never violate higher-level documents.

## 2. MISSION & SCOPE
- **Role:** AI Assistant working on the SDMS Backend source code.
- **Goal:** Execute implementations, fix bugs, and refactor code strictly following the engineering principles.
- **Scope:** Work only within `sdms-backend/`. Avoid `target/`, `.idea/`, `logs/`.

## 3. WORKFLOW: BUSINESS & IMPACT ANALYSIS
Before making any code modifications, you MUST:
- Read `PROJECT_RULE.md`.
- Read Business Documentation (`docs/business/`) if business logic is affected.
- Read affected API, DTO, Security configurations.
- Read related Entities, Services, and Repositories.
- **Perform Change Impact Analysis:** Evaluate the impact on Business, Architecture, Database, Frontend/Mobile/IoT API contracts, and Documentation.
- If the impact violates the Business Freeze Policy or breaks external contracts, STOP and report the conflict. **Never silently resolve conflicts.**

## 4. WORKFLOW: PLANNING
Formulate an execution plan:
- **Scope:** Identify exactly which files need to be modified.
- **Traceability:** Map the code changes to the corresponding Business Workflow or Rule.

## 5. WORKFLOW: IMPLEMENTATION
Execute the plan strictly following `PROJECT_RULE.md`:
- Make the minimum necessary changes.
- Do not refactor unrelated code.
- Do not silently modify API Contracts, Database Schemas, or Security Rules.
- Ensure the Definition of Done (DoD) from `PROJECT_RULE.md` is strictly followed.
- **MANDATORY DATABASE MIGRATION RULE:** If you add, remove, or modify ANY field in a JPA `@Entity` or `BaseEntity`, you MUST immediately create a corresponding Flyway migration script (`Vxx__...sql`) in `src/main/resources/db/migration/`. Failure to do so will cause Hibernate to crash the application at runtime due to `ddl-auto: validate`. Do NOT rely only on `mvn compile` since it does not catch DB schema mismatches.

## 6. WORKFLOW: VERIFICATION & SYNCHRONIZATION
After modifying code, you MUST self-verify:
- **Compile:** Ensure syntax is correct (`mvn compile`).
- **Test:** Run tests if available (`mvn test`, `mvn verify`).
- **Validate:** Ensure API Contract, Business Rule, Permission, and Data Ownership are intact.
- **Synchronize Documentation:** Update any affected documentation. 
  - **No Archive/Trash Folders:** Do NOT create or keep `archive/` or `old/` directories for outdated documents. Obsolete documents (old UI specs, redundant API flows) MUST BE DELETED IMMEDIATELY to keep the Single Source of Truth clean.
  - **API Docs Centralization:** All API flows and API specifications MUST be placed in `docs/api/`. Do not scatter them inside module folders. If you modify ANY Controller, you MUST update the corresponding file in `docs/api/`.
  - **Strict UI/UX Separation:** You are operating in the Backend. NEVER create or store UI/UX documentation, form designs, or React workflows in `sdms-backend/docs/`. Those MUST go to `sdms-frontend/docs/`.
  - **Domain/Module Docs Enforcement:** Module folders (`docs/application/`, `docs/room/`) should ONLY contain Domain Models, Functional Requirements (SSR), and structural guidelines. If you modify ANY core Entity or Event-Driven flow, you MUST update the relevant Domain Model inside the module's docs folder.
  - **Code is Truth (Audit by Code):** Do NOT blindly trust the markdown documentation. Documentation can be outdated. Always cross-check with the ACTUAL Java source code. If documentation says a feature is missing (lỗ hổng) but the code exists, you must update the documentation to reflect the codebase, not the other way around.
  - **⚠️ WORKSPACE WARNING:** If your changes affect Global Business Rules (e.g. changing 192-dim to 512-dim), you must update the global docs at `../docs/business/`. IF you cannot access that path because your workspace is limited to `sdms-backend/`, you MUST immediately warn the user: *"Tôi không thể cập nhật tài liệu Business Global vì đang bị nhốt trong sdms-backend. Vui lòng mở Agent ở thư mục gốc."*

## 7. WORKFLOW: CHANGE SUMMARY
At the end of every task, provide the user with a summary containing:
- Files modified
- Documentation modified (and the reason for the update)
- Impact summary
- Remaining technical debt
- Next recommended task

## ANTI-ASSUMPTION & TRUST BUT VERIFY RULE
- **No Guessing/No Memory Reliance:** An AI Agent MUST NOT guess, assume, or rely on its previous context/memory when deleting, modifying, or rewriting files.
- **Mandatory Content Verification:** You MUST strictly read the actual, current content of a file (e.g., using iew_file) BEFORE making any decisions to delete, move, or refactor it.
- **Enforcement:** Skipping the read step to take a shortcut directly violates the 'Code is Truth' principle and is strictly forbidden.

## DIRECTORY ORIENTATION RULE
- **Mandatory Guidance:** Every major directory (especially docs/ and root project directories) MUST contain a README.md or an explicit index/orientation file.
- **Purpose:** An AI Agent or human developer must immediately know what a directory contains, what its purpose is, and where to start reading when they first enter it. Do not leave files disconnected without a guide.

## OPTIMAL SKILLS & PROJECT ORIENTATION RULE
- **Skill Usage:** The Agent MUST utilize the most optimal and specialized tools/skills available for the task at hand. Avoid brute-force or overly generic commands when a specific tool exists.
- **Project Orientation Alignment:** Every solution, code modification, or architectural decision MUST strictly align with the project's established orientation (Clean Architecture, Single Source of Truth). Do not introduce external libraries or design patterns that contradict the project's existing core rules.

## ROADMAP COMPLETION RULE
- **Cleanup Post-Execution:** When a future feature (roadmap item) is fully implemented and successfully tested, the Agent MUST delete the corresponding .md file from docs/roadmap/features/.
- **Documentation Sync:** After deletion, the Agent MUST update all related technical and business documentation (e.g., SSR, API Contracts) to reflect the newly completed feature, ensuring no obsolete or 'future' data is left polluting the Single Source of Truth.

## SESSION HISTORY RULE (LƯU LỊCH SỬ PHIÊN LÀM VIỆC)
- **Mandatory Logging:** At the end of every work session or when completing major tasks, the Agent MUST create or update a work log summarizing the completed work.
- **Location:** All session histories MUST be stored in the `docs/work_logs/` directory (e.g., `docs/work_logs/session_YYYY_MM_DD.md`).
- **Separation:** Do NOT confuse this directory with `docs/handoff/`. The `docs/handoff/` directory is strictly for passing context between immediate agent sessions, while `docs/work_logs/` is for permanent historical tracking of project progress.

## DOCUMENT PLACEMENT & JUSTIFICATION RULE
- **Proper Location:** Whenever an Agent creates or modifies a document, it MUST place the document in the exact correct directory according to the system's governance and architectural rules (e.g., `docs/api/` for API specs, `sdms-frontend/docs/` for UI specs, `docs/work_logs/` for session histories).
- **Mandatory Justification:** The Agent MUST explicitly state the reason (justification) for placing the document in that specific folder. This ensures no documents are lost and prevents the creation of untrackable junk files.

## MANDATORY SELF-VERIFICATION RULE (LUẬT ÉP BUỘC TỰ KIỂM CHỨNG BẰNG COMMAND)
- **Build & Test Before Success:** An Agent MUST NEVER declare a coding task complete without first running the project's native build/compile/test commands to verify there are no syntax or type errors. 
- **Tool Usage:** Use `run_command` to execute `npm run build` (Frontend), `mvn compile` (Backend), `pytest` (AI), or `pio run` (IoT) immediately after editing files. If the build fails, the Agent MUST fix the errors before stopping.

## NO GARBAGE & MEANINGFUL GENERATION RULE (LUẬT DỌN DẸP RÁC VÀ TÍNH CÓ NGHĨA)
- **Meaningful Generation:** Every file, document, or piece of code generated by an Agent MUST have a clear, justifiable purpose. If it is meaningful, it must be properly named, placed in the correct directory, and easily retrievable by future Agents.
- **Mandatory Cleanup:** If an Agent creates a temporary file, a mock script, or a test file, and it is no longer useful, the Agent MUST delete it immediately after use. Do not leave unused or unsuitable files polluting the repository.

## DETAILED TESTING GUIDANCE RULE (LUẬT HƯỚNG DẪN KIỂM THỬ CHI TIẾT)
- **Detailed Scenarios:** When instructing a user to perform an End-to-End (E2E) or Integration test, the Agent MUST provide concrete, step-by-step actions.
- **Log Monitoring & Troubleshooting:** The Agent MUST specify exactly which logs or serial monitors to observe, what the expected success output looks like, and provide troubleshooting steps for common failures. Do not just say "test it".

## STEP-BY-STEP REVIEW & CONFIRMATION RULE (LUẬT LÀM TỪNG BƯỚC VÀ CHỜ XÁC NHẬN)
- **Mandatory Breakdown:** Every complex task MUST be broken down into small, manageable steps.
- **Wait for Confirmation:** After completing a single step, the Agent MUST STOP, send a review/summary to the user, and EXPLICITLY ask for confirmation before proceeding to the next step.
- **Enforcement:** Never execute multiple major changes across different domains or modules without the user's step-by-step approval.

## SDMS BACKEND REFACTOR ARCHITECTURE CONTRACT (STRICT RULES)
Mọi tác vụ backend BẮT BUỘC tuân thủ các quy tắc sau. Trước khi phát triển tính năng mới, Agent phải kiểm tra và refactor code cũ nếu vi phạm:

### 1. API RESPONSE & PAGE RESPONSE
- **Mandatory Pattern:** Hệ thống chỉ sử dụng duy nhất `ApiResponse<T>`. Tuyệt đối không tạo ErrorResponse, BaseResponse, v.v.
  - **Thành công:** `{ "success": true, "message": "...", "data": { ... } }`
  - **Thất bại:** `{ "success": false, "message": "...", "errorCode": "...", "data": null }`
  - **Validation:** `{ "success": false, "message": "...", "errorCode": "VALIDATION_FAILED", "data": { "field": "error_msg" } }`
- **Phân trang:** BẮT BUỘC dùng `ApiResponse<PageResponse<T>>`. Không bao giờ trả trực tiếp Spring `Page` hoặc List thuần.
- **Enforcement:** Agent KHÔNG ĐƯỢC thay đổi cấu trúc `ApiResponse` để tránh làm hỏng luồng parse JSON của Frontend và Mobile App.

### 2. APPEXCEPTION & ERRORCODE
- **Ném lỗi:** Mọi lỗi nghiệp vụ ở Service PHẢI dùng `AppException` kết hợp Enum `ErrorCode` (VD: `throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);`).
- **Nghiêm cấm:** KHÔNG throw `RuntimeException`, `IllegalArgumentException`. KHÔNG hard-code HttpStatus và message (trừ khi dùng constructor ghi đè message nhưng vẫn phải có ErrorCode).
- **GlobalExceptionHandler:** Là nơi DUY NHẤT được catch Exception, build `ApiResponse` thất bại, gán HttpStatus và ErrorCode. Tuyệt đối không try/catch lỗi nghiệp vụ ở Controller.

### 3. CONTROLLER, SERVICE, & ENTITY RULES
- **Controller:** Chỉ được nhận Request DTO -> Gọi Service -> Trả `ApiResponse<ResponseDTO>`. KHÔNG chứa Business Logic, KHÔNG try/catch.
- **Service:** Chỉ xử lý Business Logic, Validation nghiệp vụ, Transaction, và throw AppException. KHÔNG tạo `ApiResponse`, KHÔNG trả ResponseEntity.
- **Entity & DTO:** Entity CHỈ dùng cho Database (Persistence). Bắt buộc tuân theo luồng: Entity -> Mapper -> Response DTO -> ApiResponse. Không bao giờ expose Entity ra ngoài Controller. Không tái sử dụng Entity làm Request/Response.

### 4. NGÔN NGỮ & LOGGING (LANGUAGE & LOGGING RULE)
- **Code (Class, Method, Variable):** BẮT BUỘC 100% đặt tên bằng Tiếng Anh.
- **Thông báo người dùng (User-facing Messages):** BẮT BUỘC sử dụng Tiếng Việt có dấu (trong `ApiResponse.message`, thông báo lỗi của `ErrorCode`).
- **Log hệ thống (System Logs):** BẮT BUỘC ghi bằng Tiếng Anh (ví dụ: `log.info("User {} successfully registered", username)`). Không ghi log tiếng Việt có dấu để tránh lỗi mã hóa (encoding) khi đẩy lên hệ thống Server/Monitor (như ELK, Grafana) và giúp Developer dễ dàng tìm kiếm (grep/search).

### 5. SEEDER DEVELOPMENT RULE (LUẬT PHÁT TRIỂN SEEDER)
- **Nguyên tắc Đơn nhiệm (Single Responsibility):** Mỗi module lớn (User, Room, Payment...) PHẢI có một file Seeder riêng biệt (VD: `UserSeeder`, `DormitorySeeder`, `PaymentSeeder`). Tuyệt đối KHÔNG dồn tất cả logic khởi tạo vào một file `DataSeeder` khổng lồ duy nhất để tránh xung đột dữ liệu và logic skip.
- **Tính tự động hóa:** Sau khi hoàn thành code xong một Module hoặc một Feature mới có tác động đến Database, Agent BẮT BUỘC phải viết bổ sung/cập nhật Seeder tương ứng để Developer khác clone code về chạy lên là có data dùng thử ngay lập tức (không phải nhập tay).
