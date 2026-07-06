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
- **IoT / Firmware (Hardware, Network, C++ Code):** Place in `ktx-smart-access-iot/docs/`.

### 🟢 IoT Tasks (`ktx-smart-access-iot`)
If the task requires scanning, analyzing, or modifying any file inside the `ktx-smart-access-iot/` directory:
- **Action Required:** You MUST read the file `ktx-smart-access-iot/.agents/AGENTS.md` before taking any further action.
- **Enforcement:** Do not start scanning other files or making any changes in the firmware until you have read and understood that document. It contains the strict AI Workflow for ESP32 Firmware Development.

## 4. CROSS-MODULE SAFETY RULES
- **Isolation:** Never assume the frontend, backend, or IoT modules share the same conventions or workflows.
- **Full-Stack/System-Wide Tasks:** If a task involves multiple modules, you must read **all** relevant `AGENTS.md` files and apply their respective workflows strictly within their own directories.
- **No Global Refactoring:** Do not attempt to refactor the entire monorepo structure. Work strictly within the boundaries of `sdms-backend/`, `sdms-frontend/`, or `ktx-smart-access-iot/`.
