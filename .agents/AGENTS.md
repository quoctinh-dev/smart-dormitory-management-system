# GLOBAL AI WORKFLOW (MONOREPO ROUTER)

You are operating in a Monorepo containing both Backend and Frontend for the SDMS project.
Before performing any analysis or making any code changes, you MUST determine which part of the system you are working on.

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

## 2. MONOREPO AGENT RESPONSIBILITIES
The Monorepo Agent acts as an orchestration layer. It must:
- Route tasks to the correct module (Backend, Frontend, Documentation, or IoT).
- Identify affected projects before making any changes.
- Determine required documentation updates based on cross-module impacts.
- Coordinate Backend and Frontend changes to ensure API Contract consistency.
- Coordinate Business Documentation alignment.
- Coordinate AI/IoT integration.
- Prevent duplicated work across modules.
- Prevent inconsistent implementation.

## 3. CONTEXT RESOLUTION & ROUTING
When receiving a task, analyze the request to determine if it affects the Backend, the Frontend, Documentation, or multiple parts. 
Once identified, you **MUST** immediately read the corresponding workflow document(s) before proceeding.

### 🔴 Backend Tasks (`sdms-backend`)
If the task requires scanning, analyzing, or modifying any file inside the `sdms-backend/` directory:
- **Action Required:** You MUST read the file `sdms-backend/.agents/AGENTS.md` before taking any further action.
- **Enforcement:** Do not start scanning other files or making any changes in the backend until you have read and understood that document. It contains the strict AI Workflow for Java Spring Boot.

### 🔵 Frontend Tasks (`sdms-frontend`)
If the task requires scanning, analyzing, or modifying any file inside the `sdms-frontend/` directory:
- **Action Required:** You MUST read the file `sdms-frontend/.agents/AGENTS.md` before taking any further action.
- **Enforcement:** Do not start scanning other files or making any changes in the frontend until you have read and understood that document. It contains the strict AI Workflow for React + TypeScript.

### 📝 Documentation Tasks (`docs`)
If the task involves writing or updating project documentation, you must route the files to the correct `docs/` directory based on their scope:
- **Global / System-Wide Architecture:** Place in the root `docs/` folder.
- **Backend (API, DB Schema, Java Code):** Place in `sdms-backend/docs/`.
- **Frontend (UI, Components, React Context):** Place in `sdms-frontend/docs/`.
- **IoT / Firmware (Hardware, Network, C++ Code):** Place in `sdms-iot-gateway/docs/`.

### 🟢 IoT Tasks (`sdms-iot-gateway` or `sdms-iot-gateway`)
If the task requires scanning, analyzing, or modifying any file inside the IoT/Gateway directory:
- **Action Required:** You MUST read the file `sdms-iot-gateway/.agents/AGENTS.md` (or equivalent) before taking any further action.
- **Enforcement:** Do not start scanning other files or making any changes in the firmware until you have read and understood that document. It contains the strict AI Workflow for ESP32/IoT Development.

### 🟣 AI Service Tasks (`sdms-ai-service`)
If the task requires scanning, analyzing, or modifying any file inside the `sdms-ai-service/` directory:
- **Action Required:** You MUST read the file `sdms-ai-service/.agents/AGENTS.md` before taking any further action.
- **Enforcement:** Do not start scanning other files or making any changes in the AI service until you have read and understood that document. It contains the strict AI Workflow for Python FastAPI and AI Models.

### 📱 Mobile App Tasks (`sdms-mobile-app`)
If the task involves building or modifying the Mobile App (Student App):
- **Action Required:** If the `sdms-mobile-app/` directory does not exist yet, you MUST create it along with its own `.agents/AGENTS.md` file before generating any code.
- **Enforcement:** The Mobile App must have its own strict AI Workflow (e.g., Flutter/React Native rules) separate from the Web Frontend. All mobile-related documentation must go into `sdms-mobile-app/docs/`.

## 4. CROSS-MODULE SAFETY RULES
- **Isolation:** Never assume the frontend, backend, or IoT modules share the same conventions or workflows.
- **Full-Stack/System-Wide Tasks:** If a task involves multiple modules, you must read **all** relevant `AGENTS.md` files and apply their respective workflows strictly within their own directories.
- **No Global Refactoring:** Do not attempt to refactor the entire monorepo structure. Work strictly within the boundaries of `sdms-backend/`, `sdms-frontend/`, or `sdms-iot-gateway/`.
- **MANDATORY READING ENFORCEMENT:** You MUST explicitly use `view_file` to read the sub-module's `AGENTS.md` before touching its code. Do NOT rely on memory or assume you know the rules. Any failure to do so will result in systemic errors.

## 5. HANDOVER PROTOCOL (AGENT CONTINUITY)
If the User explicitly provides a Resume Prompt indicating they just returned from a break, you MUST:
- **Action Required:** Read the file `docs/handoff/HANDOFF_SUMMARY.md`.
- **Enforcement:** Do not write any code or make changes until you have summarized the state of the system based on `HANDOFF_SUMMARY.md` and explicitly stated the exact "Next Tasks".
- **Pausing Work:** If the user asks to pause/stop working, you must overwrite `docs/handoff/HANDOFF_SUMMARY.md` with the latest progress, current state, and the next steps for the incoming agent.

## 6. FUTURE PLAN PROTOCOL (ROADMAP)
If the User proposes a new idea or future feature for the project:
- **Action Required:** You MUST NOT immediately start coding.
- **Enforcement:** You must create a new markdown file inside `docs/roadmap/features/` naming it `[ID]_[FEATURE_NAME].md`.
- **Content:** The document must detail the Vision, Business Flow, Implementation Roadmap across modules, and a pre-written "Trigger Prompt" at the bottom for future execution.

## 7. WORKSPACE AWARENESS (MONOREPO VS SUB-MODULE)
The Agent MUST be aware of its current working directory (Workspace Scope).
- If the Agent is opened in the **Root Monorepo directory**, it acts as a Global Architect and has full capability to synchronize cross-module logic and update Global Business Docs (`docs/business/`).
- If the Agent is opened inside a **Sub-module directory** (e.g., `sdms-backend/`), it is blind to the rest of the system.
- **Enforcement:** If you (the Agent) detect that a task requires updating Global Business Documentation or cross-module features, but you are trapped in a sub-module workspace, you MUST halt and instruct the user: *"Vui lòng mở Agent (hoặc IDE) ở thư mục gốc (Root) để tôi có thể cập nhật tài liệu Global một cách đồng bộ."*

## 8. DOCUMENTATION MAINTENANCE PROTOCOL
- **No Archive/Trash Folders:** Do not create or keep `archive/` or `old/` directories for outdated documents. If a document (e.g., old UI specs, redundant flows) is obsolete, **DELETE IT IMMEDIATELY** to maintain a clean Single Source of Truth (SSOT).
- **API Documentation Centralization:** Any document that primarily serves as an API Specification or API Flow MUST be placed in the `docs/api/` directory (e.g., `docs/api/registration_flow_and_api.md`), rather than being scattered inside individual module folders. Module folders should only contain domain models, business requirements (SSR), and structural guidelines.
- **Strict UI/UX Separation:** Absolutely NO UI specifications, wireframes, form designs, or frontend workflows are allowed inside `sdms-backend/docs/`. All frontend-related documentation MUST be exclusively placed in `sdms-frontend/docs/`.
- **Code is Truth (Trust but Verify):** NEVER trust the documentation 100%. Documents can be outdated or wrong (e.g., claiming a feature is missing when it is already coded). You MUST always audit and cross-verify with the ACTUAL Backend and Frontend source code before making conclusions or applying changes. If the code and docs conflict, the CODE is the current truth, and the docs must be updated to match the code.

## ANTI-ASSUMPTION & TRUST BUT VERIFY RULE
- **No Guessing/No Memory Reliance:** An AI Agent MUST NOT guess, assume, or rely on its previous context/memory when deleting, modifying, or rewriting files.
- **Mandatory Content Verification:** You MUST strictly read the actual, current content of a file (e.g., using iew_file) BEFORE making any decisions to delete, move, or refactor it.
- **Enforcement:** Skipping the read step to take a shortcut directly violates the 'Code is Truth' principle and is strictly forbidden.

## DIRECTORY ORIENTATION RULE
- **Mandatory Guidance:** Every major directory (especially docs/ and root project directories) MUST contain a README.md or an explicit index/orientation file.
- **Purpose:** An AI Agent or human developer must immediately know what a directory contains, what its purpose is, and where to start reading when they first enter it. Do not leave files disconnected without a guide.

## THESIS DEPTH & DATABASE STRICTNESS RULE (LUẬT CHIỀU SÂU LUẬN VĂN)
- **Mandatory Compliance:** To ensure the project meets the depth required for a graduation thesis, every Agent MUST strictly follow the rules defined in `docs/rules/THESIS_DEPTH_RULE.md`.
- **Core Principles:** This includes preventing "garbage data", using Soft Deletes instead of Hard Deletes, maintaining Audit Trails, using Transactions for multi-step operations, and applying multi-layer validations. No CRUD operation should be implemented simplistically without considering side-effects.

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
