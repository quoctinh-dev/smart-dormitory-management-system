# AI AGENT WORKFLOW FOR SDMS AI SERVICE
**Operational Manual for AI Agents working on the Python AI Service**

## 1. GOVERNANCE HIERARCHY
Ensure every document clearly defines this hierarchy:
Business Documentation (Global)
↓
PROJECT_RULE (Local: `sdms-ai-service/PROJECT_RULE.md`)
↓
AGENTS (This file)
↓
Implementation (Python/FastAPI)

Higher-level documents always have higher priority. Implementation must never violate higher-level documents.

## 2. MISSION & SCOPE
- **Role:** AI Assistant working on the SDMS Python AI Service.
- **Goal:** Build robust, highly accurate AI feature extraction APIs that integrate seamlessly with the Java Backend.
- **Scope:** Work ONLY within the `sdms-ai-service/` directory.

## 3. WORKFLOW: ANALYSIS & PLANNING
Before writing Python code or modifying the AI pipeline, you MUST:
- Read `PROJECT_RULE.md` inside this directory.
- Verify the exact shape and size of the Vector Embedding expected by the Backend (Strictly **512 dimensions**).
- Formulate a plan that ensures stateless processing and handles missing/blurry faces securely.

## 4. WORKFLOW: IMPLEMENTATION
Execute the plan strictly following Python & FastAPI conventions:
- Use standard AI libraries (OpenCV, InsightFace, RetinaFace, MediaPipe).
- Do not output mock vectors unless strictly instructed for a test.
- Handle exceptions (e.g. `cv2.error`, face not found) using FastAPI's `HTTPException(status_code=400)`.
- Write type hints for all parameters.

## 5. WORKFLOW: VERIFICATION
After modifying code, you MUST:
- Check syntax using `flake8` or `ruff` if available.
- Verify the API contract matches the backend expectations.
- Update the Swagger documentation/Pydantic schemas.

## 6. WORKFLOW: SYNCHRONIZATION
If a change is made to the Vector size or API Response schema, you MUST notify the Monorepo Router Agent to update the Java Backend (`sdms-backend`) API Adapter accordingly. Silent API contract breaks are STRICTLY PROHIBITED.

## 7. DOCUMENTATION & AUDIT RULES
- **Code is Truth (Trust but Verify):** Do NOT blindly trust markdown documentation. Always cross-check with the ACTUAL Python source code. If documentation says a feature is missing but the code has it, update the documentation.
- **Documentation Scope Boundaries:** Store AI pipeline flows, model specifications, and Python logic ONLY in `sdms-ai-service/docs/`. Do NOT store Backend API flows or Frontend UI specs here.

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

## API RESPONSE & EXCEPTION ARCHITECTURE CONTRACT (LUẬT CẤU TRÚC PHẢN HỒI & NGOẠI LỆ API)
**Version:** 1.0
**Status:** Mandatory
**Scope:** AI Service (FastAPI) API Responses

### 1. PURPOSE
This document defines the only allowed API Response Contract and Exception Handling architecture in SDMS.
Even though the AI Service is written in Python (FastAPI), its API responses MUST STRICTLY MATCH the Java Backend `ApiResponse<T>` envelope so that the Frontend and Mobile apps can parse them consistently.

### 2. ApiResponse CONTRACT
Every successful API response MUST follow:
```json
{
    "success": true,
    "message": "...",
    "data": { ... }
}
```

Every failed API response (e.g. Face Not Found, Invalid Image) MUST follow:
```json
{
    "success": false,
    "message": "...",
    "errorCode": "...",
    "data": null
}
```

### 3. ERROR CODE & HTTP STATUS
Do not throw raw `HTTPException(status_code=400, detail="Error string")` if it doesn't match the `ApiResponse` shape.
You MUST format the FastAPI JSONResponse to match the exact envelope above.
- HTTP Status represents transport status (400, 404, 500).
- `errorCode` represents business status (e.g., `FACE_NOT_FOUND`, `IMAGE_BLURRY`).
