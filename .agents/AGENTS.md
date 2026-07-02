# GLOBAL AI WORKFLOW (MONOREPO ROUTER)

You are operating in a Monorepo containing both Backend and Frontend for the SDMS project.
Before performing any analysis or making any code changes, you MUST determine which part of the system you are working on.

## 1. Context Resolution & Routing
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

## 2. Cross-Module Safety Rules
- **Isolation:** Never assume the frontend and backend share the same conventions or workflows.
- **Full-Stack Tasks:** If a task involves both modules, you must read **both** `AGENTS.md` files and apply their respective workflows strictly within their own directories.
- **No Global Refactoring:** Do not attempt to refactor the entire monorepo structure. Work strictly within the boundaries of `sdms-backend/` or `sdms-frontend/`.
