# 🏛️ SMART DORMITORY MANAGEMENT SYSTEM (SDMS) - BACKEND CONSTITUTION
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
- Database Schema
- Architecture Decision
- Configuration
- README

The AI must determine whether documentation requires updates. **Documentation synchronization is part of the implementation.** Implementation is NOT complete until documentation is synchronized.

## 5. CHANGE IMPACT ANALYSIS
Before implementation, evaluate the impact on:
- Business, Architecture, Database
- Backend, Frontend, Mobile, IoT, AI
- API Contract, DTO, Security
- Testing, Documentation, Deployment

If impact exists, report it before implementation.

## 6. TRACEABILITY
Encourage traceability:
Business → Workflow → Rule → Implementation → Test → Documentation.
When possible, always reference affected artifacts in code comments or summaries.

## 7. DEFINITION OF DONE (DoD)
A task is complete ONLY if ALL the following criteria are met:
- [ ] Implementation completed.
- [ ] Project builds successfully.
- [ ] Tests pass.
- [ ] No architecture violation.
- [ ] No Business Rule violation.
- [ ] No Security violation.
- [ ] No API Contract violation.
- [ ] Documentation synchronized.
- [ ] No unresolved TODO.
- [ ] No duplicated logic introduced.
- [ ] No broken dependency introduced.

If documentation is outdated, the task is NOT complete.

---
## ENGINEERING PRINCIPLES

### 8. ARCHITECTURE PRESERVATION
- **Architecture**: Modular Monolith Architecture.
- **Principles**: Preserve Layer boundaries, Clean Architecture, Package responsibilities, Module responsibilities, Dependency direction.
- **Dependency Flow**: `Controller` -> `Service` -> `Repository`. No Circular Dependency.
- Do not move code across layers unless explicitly requested.

### 9. PACKAGE & MODULE PRINCIPLES
- **Package by Feature**: Each module (e.g., student, room) must be self-contained in `com.sdms.backend.modules.*`.
- **Module Internal Boundaries**: `controller`, `service`, `repository`, `entity`, `dto`.
- **Decoupling**: Use Spring ApplicationEvent (`@EventListener`, `@Async`) for cross-module interactions instead of tight coupling.

### 10. API & DTO PRINCIPLES
- **API Contract**: All responses MUST be wrapped in `ApiResponse<T>` or `PageResponse<T>`. Errors must return `success: false` and `errorCode`.
- **DTOs**: Never return or accept Entities in Controllers. Strictly separate `XXXRequest` and `XXXResponse`.
- **Validation**: Use Bean Validation (`@NotNull`, `@NotBlank`) inside DTOs. Do not validate basic formats in Controllers/Services.

### 11. SECURITY PRINCIPLES
- **Stateless Authentication**: JWT via `JwtAuthenticationFilter`.
- **Authorization**: Method-level security (`@PreAuthorize`). Do not hardcode role checks in Services.
- **Ownership (IDOR Prevention)**: Students CANNOT send `studentId` or `userId` in requests. Backend MUST extract ID from the JWT Principal.

### 12. DATABASE PRINCIPLES
- **Schema Management**: Flyway MUST be used for all schema changes (`V*__*.sql`). Never use Hibernate auto-update in production.
- **Transactions**: Use `@Transactional` for all data modifications. Use `readOnly = true` for read-heavy operations.
- **Entity**: Extend `BaseEntity`, use UUID as Primary Key, and use `FetchType.LAZY` for all relations.

### 13. LOGGING & EXCEPTION PRINCIPLES
- **Exceptions**: Throw `AppException` with `ErrorCode`. Let `GlobalExceptionHandler` format the response. Never swallow exceptions.
- **Logging**: Do not log sensitive data (Passwords, Tokens, Face Embeddings, PII). Use appropriate SLF4J log levels.
