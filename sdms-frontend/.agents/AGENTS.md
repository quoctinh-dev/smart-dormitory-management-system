# AI AGENT WORKFLOW FOR SDMS FRONTEND
**Operational Manual for Frontend AI Agents (AGENTS.md)**

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
- **Role:** AI Assistant working on the SDMS Frontend source code.
- **Goal:** Execute UI implementations, fix bugs, and refactor code strictly following the engineering principles.
- **Scope:** Work only within `sdms-frontend/`. Strictly ignore `node_modules/`, `dist/`.

## 3. WORKFLOW: BUSINESS & IMPACT ANALYSIS
Before making any UI modifications, you MUST:
- Read `PROJECT_RULE.md`.
- Read Business Documentation (`docs/business/`) if business logic or UI requirements are affected.
- Read Backend API Contracts, DTOs, and `ApiResponse`.
- Read Hook boundaries and Route permissions.
- **Perform Change Impact Analysis:** Evaluate the impact on Component Layouts, Router Navigation, Context States, and external API Contracts.
- If the impact violates the Business Freeze Policy or breaks external contracts, STOP and report the conflict. **Never silently resolve conflicts.**

## 4. WORKFLOW: PLANNING
Formulate an execution plan:
- **Scope:** Identify exactly which UI components, hooks, or API wrappers need to be modified.
- **Traceability:** Map the code changes to the corresponding Business Rule or UI Workflow.

## 5. WORKFLOW: IMPLEMENTATION
Execute the plan strictly following `PROJECT_RULE.md`:
- Make the minimum necessary changes.
- Do not refactor unrelated code.
- Do not silently modify `axiosClient`, Interceptors, global `Context`, or Folder structures.
- Ensure the Definition of Done (DoD) from `PROJECT_RULE.md` is strictly followed.

## 6. WORKFLOW: VERIFICATION & SYNCHRONIZATION
After modifying code, you MUST self-verify:
- **TypeScript Clean:** Ensure there are no type errors (`npm run build`).
- **Lint Clean:** Ensure there are no linting warnings/errors (`npm run lint`).
- **Validate:** Ensure API Contracts match the Backend. Check for Architecture violations.
- **Synchronize Documentation:** Update any affected documentation (Business Workflows, Route Documentation, README). Implementation is NOT complete until documentation is synchronized.
  - **Documentation Scope Boundaries:** ONLY store UI/UX specs, Frontend routing, and component logic in `sdms-frontend/docs/`. Do NOT store API contracts or backend domain models here (those belong to `docs/api` or backend).
  - **Code is Truth (Audit by Code):** Do NOT blindly trust the markdown documentation. Documentation can be outdated. Always cross-check with the ACTUAL `.tsx`/`.ts` source code before drawing conclusions. If code and docs conflict, code is the truth.
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
# AI AGENT WORKFLOW FOR SDMS FRONTEND
**Operational Manual for Frontend AI Agents (AGENTS.md)**

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
- **Role:** AI Assistant working on the SDMS Frontend source code.
- **Goal:** Execute UI implementations, fix bugs, and refactor code strictly following the engineering principles.
- **Scope:** Work only within `sdms-frontend/`. Strictly ignore `node_modules/`, `dist/`.

## 3. WORKFLOW: BUSINESS & IMPACT ANALYSIS
Before making any UI modifications, you MUST:
- Read `PROJECT_RULE.md`.
- Read Business Documentation (`docs/business/`) if business logic or UI requirements are affected.
- Read Backend API Contracts, DTOs, and `ApiResponse`.
- Read Hook boundaries and Route permissions.
- **Perform Change Impact Analysis:** Evaluate the impact on Component Layouts, Router Navigation, Context States, and external API Contracts.
- If the impact violates the Business Freeze Policy or breaks external contracts, STOP and report the conflict. **Never silently resolve conflicts.**

## 4. WORKFLOW: PLANNING
Formulate an execution plan:
- **Scope:** Identify exactly which UI components, hooks, or API wrappers need to be modified.
- **Traceability:** Map the code changes to the corresponding Business Rule or UI Workflow.

## 5. WORKFLOW: IMPLEMENTATION
Execute the plan strictly following `PROJECT_RULE.md`:
- Make the minimum necessary changes.
- Do not refactor unrelated code.
- Do not silently modify `axiosClient`, Interceptors, global `Context`, or Folder structures.
- Ensure the Definition of Done (DoD) from `PROJECT_RULE.md` is strictly followed.

## 6. WORKFLOW: VERIFICATION & SYNCHRONIZATION
After modifying code, you MUST self-verify:
- **TypeScript Clean:** Ensure there are no type errors (`npm run build`).
- **Lint Clean:** Ensure there are no linting warnings/errors (`npm run lint`).
- **Validate:** Ensure API Contracts match the Backend. Check for Architecture violations.
- **Synchronize Documentation:** Update any affected documentation (Business Workflows, Route Documentation, README). Implementation is NOT complete until documentation is synchronized.
  - **Documentation Scope Boundaries:** ONLY store UI/UX specs, Frontend routing, and component logic in `sdms-frontend/docs/`. Do NOT store API contracts or backend domain models here (those belong to `docs/api` or backend).
  - **Code is Truth (Audit by Code):** Do NOT blindly trust the markdown documentation. Documentation can be outdated. Always cross-check with the ACTUAL `.tsx`/`.ts` source code before drawing conclusions. If code and docs conflict, code is the truth.
## 7. WORKFLOW: CHANGE SUMMARY
At the end of every task, provide the user with a summary containing:
- Files modified
- Documentation modified (and the reason for the update)
- Impact summary
- Remaining technical debt
- Next recommended task

## ANTI-ASSUMPTION & TRUST BUT VERIFY RULE
- **No Guessing/No Memory Reliance:** An AI Agent MUST NOT guess, assume, or rely on its previous context/memory when deleting, modifying, or rewriting files.
- **Mandatory Content Verification:** You MUST strictly read the actual, current content of a file (e.g., using  iew_file) BEFORE making any decisions to delete, move, or refactor it.
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

## API RESPONSE & EXCEPTION ARCHITECTURE CONTRACT (LUẬT CẤU TRÚC PHẢN HỒI & NGOẠI LỆ API)
**Version:** 1.0
**Status:** Mandatory
**Scope:** Entire System (Frontend consumption & Backend generation)

### 1. PURPOSE
This document defines the only allowed API Response Contract and Exception Handling architecture in SDMS.
Every new frontend API call, form submission, and error handling logic MUST follow this contract.

### 2. CORE COMPONENTS (FRONTEND PERSPECTIVE)
The frontend MUST expect ONLY this envelope structure for all responses:
- `ApiResponse<T>`
- `PageResponse<T>`
Do not create custom parsing logic that bypasses this envelope.

### 3. ApiResponse CONTRACT
Every successful API response from Backend MUST follow:
```json
{
    "success": true,
    "message": "...",
    "data": { ... }
}
```

Every failed API response MUST follow:
```json
{
    "success": false,
    "message": "...",
    "errorCode": "...",
    "data": null
}
```

Validation response:
```json
{
    "success": false,
    "message": "...",
    "errorCode": "VALIDATION_FAILED",
    "data": {
        "fieldName": "validation message"
    }
}
```
No additional response format is allowed. Frontend code MUST parse this exact structure.

### 4. ERROR CODE & HTTP STATUS
All business errors are defined inside an `errorCode` string.
HTTP Status represents transport status. `errorCode` represents business status.
Examples:
- `400` -> `VALIDATION_FAILED`
- `401` -> `UNAUTHORIZED`
- `403` -> `FORBIDDEN`
- `404` -> `RESOURCE_NOT_FOUND`
- `409` -> `APPLICATION_ALREADY_EXISTS`
- `500` -> `INTERNAL_SERVER_ERROR`

### 5. FRONTEND EXCEPTION FLOW RULE
When making an API request, the Frontend Agent MUST:
✔ Use a centralized API client (e.g., Axios interceptor) to unwrap the `ApiResponse` if needed.
✔ Always check the `success` field or HTTP Status to determine the flow.
✔ Display the `message` from the backend to the user (unless a specific frontend override is needed for the `errorCode`).
✔ Map validation errors (`errorCode === 'VALIDATION_FAILED'`) in the `data` object to the corresponding UI form fields.

**MUST NOT:**
✘ Assume backend returns a direct object without the `ApiResponse` wrapper.
✘ Re-invent error mapping by ignoring the backend's `errorCode`.
✘ Hardcode success messages when the backend already provides a context-aware `message`.

### 6. PAGINATION
All paging APIs will return `ApiResponse<PageResponse<T>>`.
The frontend table/list components MUST be built to consume `PageResponse` (containing `content`, `pageNumber`, `pageSize`, `totalElements`, etc.).

### 7. AGENT RESPONSIBILITY
Before modifying any frontend API call or UI state, the agent MUST verify:
- Are API responses strictly typed with `ApiResponse<T>`?
- Are errors properly caught and their `errorCode` handled?
- Is form validation utilizing the backend `VALIDATION_FAILED` data map?

If any existing code violates this architecture, the agent SHOULD refactor that code first before adding new functionality. All new frontend services and hooks MUST follow this contract. No alternative parsing structure is allowed.
