# AI AGENT WORKFLOW FOR SDMS BACKEND

**CRITICAL RULE: Always read `PROJECT_RULE.md` before making any code changes. This document defines the AI working process, NOT coding conventions or rules.**

## 1. Mission
- **Role:** AI Assistant working on the SDMS Backend source code.
- **Goal:** Implement features, fix bugs, and refactor code safely within defined boundaries.
- **Limitations:** Do not rewrite architecture, do not violate `PROJECT_RULE.md`, and do not modify core boundaries without explicit user request.

## 2. Workspace Scope
- AI must only work within the Backend environment (`sdms-backend/`).
- **Allowed to read/write:** `src/`, `docs/`, `pom.xml`, `application.yml`, and relevant modules.
- **Strictly Ignore:** 
  - `target/`
  - `.idea/`
  - `logs/`

## 3. Scan Workflow
When starting a task, read in the following strict order:
1. `PROJECT_RULE.md` (located in `sdms-backend/`)
2. `pom.xml`
3. `application.yml` (and other configs)
4. Relevant modules based on the task
5. Dependencies
6. Code implementations

## 4. Analyze Workflow
Before making any changes, AI MUST:
- Read related modules and classes.
- Analyze dependencies.
- Analyze DTOs (Request/Response).
- Analyze Entities and database relationships.
- Analyze Security rules and permissions.
- Analyze API Contracts.
- Evaluate the impact of potential changes.
- **Do not modify code immediately.**

## 5. Planning Workflow
After analysis, AI must formulate a plan:
- **Scope:** Identify exactly which files need to be modified.
- **Impact:** Assess what other parts of the system will be affected.
- **Risk:** Evaluate potential risks (e.g., breaking API contracts, security loopholes).
- **Rule:** Only modify the parts explicitly requested by the user.

## 6. Modify Workflow
When executing changes:
- Make the **minimum** necessary changes.
- Do not refactor the entire project or unrelated code.
- **Do NOT change** (unless explicitly requested):
  - Package Structure
  - API Contracts (Endpoints, Request/Response formats)
  - Database Schemas / Flyway scripts
  - Security Configurations
  - Module Boundaries

## 7. Verification Workflow
After making modifications, AI MUST verify:
- **Compile:** Check for syntax and compilation errors.
- **Test:** Run relevant unit/integration tests.
- **Dependency:** Verify no missing or broken dependencies.
- **Impact:** Ensure no unintended side-effects on other modules.

## 8. Build Gate
AI must NOT conclude a task if the build fails. Ensure the following passes:
- `mvn test`
- `mvn verify`

## 9. Change Impact Checklist
When modifying specific layers, cross-check the following:

- **If modifying DTO:**
  - Check `Mapper`
  - Check `Service`
  - Check `Controller`
  - Check Frontend Contract

- **If modifying Entity:**
  - Check `Repository`
  - Check `Service`
  - Check `Flyway` migrations
  - Check `Mapper`

- **If modifying Security:**
  - Check `Controller`
  - Check `JWT`
  - Check `Permission` settings

## 10. AI Safety Rules
AI is strictly PROHIBITED from:
- Breaking existing architecture.
- Changing rules defined in `PROJECT_RULE.md`.
- Modifying API Contracts silently.
- Modifying the Database schema silently.
- Modifying Security rules silently.
- Adding major dependencies without user permission.

## 11. Completion Checklist
Before finishing a task, the AI must self-verify:
- [ ] Read `PROJECT_RULE.md`
- [ ] Analyzed change impact
- [ ] Architecture remains intact
- [ ] No new technical debt created
- [ ] Build is successful (`mvn verify`)
- [ ] Tests passed (if applicable)
