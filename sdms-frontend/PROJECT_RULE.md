# ⚛️ SMART DORMITORY MANAGEMENT SYSTEM (SDMS) - FRONTEND CONSTITUTION
**Tài liệu Quy tắc Kỹ thuật Tối cao (PROJECT_RULE.md)**

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

## 2. SINGLE SOURCE OF TRUTH
- **Business Documentation** (located in `docs/business/`) is the official Business Baseline.
- **PROJECT_RULE.md** defines engineering principles.
- **AGENTS.md** defines the execution workflow.
- Implementation must conform to all of them. If implementation conflicts with Business Documentation, the conflict must be reported immediately. **Never silently resolve conflicts.**

## 3. BUSINESS FREEZE POLICY
Business Documentation is considered **Frozen**.
AI must never silently modify:
- Business Rule
- Workflow
- Permission
- Business Decision
- State Machine
- Business Glossary
- Business Domain

If implementation requires business changes, AI must explicitly report the conflict and request approval.

## 4. DOCUMENTATION SYNCHRONIZATION POLICY
Whenever implementation changes affect:
- Business Rule
- Workflow
- Permission
- State Machine
- DTO
- API Contract
- Architecture Decision
- Configuration
- README

The AI must determine whether documentation requires updates. **Documentation synchronization is part of the implementation.** Implementation is NOT complete until documentation is synchronized.

## 5. CHANGE IMPACT ANALYSIS
Before implementation, evaluate the impact on:
- Business, Architecture
- Backend API Contract, DTO
- Security, Testing, Documentation, Deployment

If impact exists, report it before implementation.

## 6. TRACEABILITY
Encourage traceability:
Business → Workflow → Rule → Implementation → Test → Documentation.
When possible, always reference affected artifacts in code comments or summaries.

## 7. DEFINITION OF DONE (DoD)
A task is complete ONLY if ALL the following criteria are met:
- [ ] Implementation completed.
- [ ] Project builds successfully.
- [ ] TypeScript is clean (no errors/warnings).
- [ ] Linter is clean (`npm run lint`).
- [ ] No architecture violation.
- [ ] No Business Rule violation.
- [ ] No API Contract violation.
- [ ] Documentation synchronized.
- [ ] No unresolved TODO.
- [ ] No duplicated logic introduced.
- [ ] No broken dependency introduced.

If documentation is outdated, the task is NOT complete.

---
## ENGINEERING PRINCIPLES

### 8. ARCHITECTURE PRINCIPLES
- **Data Flow**: `Pages -> Hooks -> API Wrapper -> Axios Client -> Backend`.
- **Strict Prohibition**: No circular dependencies. Components MUST NOT call the API Wrapper directly without a Hook.
- **Component Layer**: `src/components` and `src/pages` are Dumb/Presentational. Logic belongs in Hooks.

### 9. API WRAPPER PRINCIPLES
- **Responsibilities**: Build URL, map Request DTO, define Response DTO.
- **Prohibitions**: No state management (`loading`), no Toast/Snackbar, no Routing (`useNavigate`), no Business Logic.

### 10. HOOK PRINCIPLES
- **Responsibilities**: Call API Wrappers, manage `loading`/`error` states, manage pagination, handle Toast/Snackbar, expose actions.
- **Prohibitions**: Do not render JSX/UI. Do not manipulate the DOM directly.

### 11. SECURITY & OWNERSHIP PRINCIPLES
- **Ownership**: The Frontend NEVER sends personal identifiers (`userId`, `studentId`) to authenticated APIs (unless it's an Admin managing others).
- **Authorization**: Do not hardcode roles in components. Use Context/Store states and custom components (e.g., `<Can permission="...">`).
- **Tokens**: Token rotation is handled invisibly via Axios Interceptors.

### 12. API CONTRACT PRINCIPLES
- **Strict Typing**: If Backend DTOs change, Frontend MUST update `src/api` interfaces immediately.
- **Prohibitions**: Do not use `any` or `@ts-nocheck` to bypass API contract changes.

### 13. ERROR HANDLING PRINCIPLES
- **Normalization**: Interceptor normalizes errors -> Hook -> Component.
- **No Duplication**: If the Interceptor shows a Toast for 500 errors, the Hook should not show a duplicate Toast.

### 14. BUILD PRINCIPLES
- **Strict Mode**: TypeScript strict mode is mandatory.
- Code with compile errors or severe ESLint warnings will not be merged.
