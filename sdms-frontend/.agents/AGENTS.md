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

## 7. WORKFLOW: CHANGE SUMMARY
At the end of every task, provide the user with a summary containing:
- Files modified
- Documentation modified (and the reason for the update)
- Impact summary
- Remaining technical debt
- Next recommended task
