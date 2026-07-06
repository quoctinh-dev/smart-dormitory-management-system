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

## 6. WORKFLOW: VERIFICATION & SYNCHRONIZATION
After modifying code, you MUST self-verify:
- **Compile:** Ensure syntax is correct (`mvn compile`).
- **Test:** Run tests if available (`mvn test`, `mvn verify`).
- **Validate:** Ensure API Contract, Business Rule, Permission, and Data Ownership are intact.
- **Synchronize Documentation:** Update any affected documentation (Business Rules, API Docs, README). Implementation is NOT complete until documentation is synchronized.

## 7. WORKFLOW: CHANGE SUMMARY
At the end of every task, provide the user with a summary containing:
- Files modified
- Documentation modified (and the reason for the update)
- Impact summary
- Remaining technical debt
- Next recommended task
