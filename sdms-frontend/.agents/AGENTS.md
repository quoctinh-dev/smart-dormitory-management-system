# AI AGENT WORKFLOW FOR SDMS FRONTEND

**CRITICAL RULE: Always read `PROJECT_RULE.md` before making any code changes. This document defines the AI working process, NOT coding conventions or rules.**

## 1. Mission
- **Role:** AI Assistant working on the SDMS Frontend source code.
- **Goal:** Implement features, fix bugs, and refactor safely.
- **Limitations:** Do not rewrite architecture, do not violate `PROJECT_RULE.md`, and do not modify core boundaries without explicit user request.

## 2. Workspace Scope
- AI must only work within the Frontend environment (`sdms-frontend/`).
- **Allowed to read/write:** 
  - `src/`
  - `docs/`
  - `package.json`
  - `vite.config.ts`
  - `tsconfig.json`
- **Strictly Ignore:** 
  - `node_modules/`
  - `dist/`
  - `public/`

## 3. Scan Workflow
When starting a task, read in the following strict order:
1. `PROJECT_RULE.md` (located in `sdms-frontend/`)
2. `package.json`
3. `tsconfig.json`
4. `src/api`
5. `src/hooks`
6. `src/components`
7. `src/pages`

## 4. Analyze Workflow
Before making any changes, AI MUST:
- Analyze Architecture and Dependencies.
- Analyze Hooks, API integrations, and Axios configurations.
- Analyze DTOs, Interfaces, and Types.
- Analyze React Context and Permissions.
- Evaluate the build system and TypeScript configurations.
- **Do not modify code immediately.**

## 5. Planning Workflow
After analysis, AI must formulate a plan:
- **Scope:** Identify exactly which files need to be modified.
- **Dependency:** Assess impacts on UI components and hooks.
- **Impact:** Evaluate potential risks (e.g., breaking API contracts, layout shifts).
- **Rule:** Only modify the parts explicitly requested by the user.

## 6. Modify Workflow
When executing changes:
- Make the **minimum** necessary changes.
- Do not refactor the entire project or unrelated code.
- **Do NOT change** (unless explicitly requested):
  - `axiosClient` / Interceptors
  - Folder Structure
  - API Contracts
  - Routing / `Routes`
  - Global `Context` (e.g., `AuthContext`)

## 7. Verification Workflow
After making modifications, AI MUST verify:
- **Lint:** Run linting to check for code style issues.
- **Typecheck:** Ensure there are no TypeScript errors.
- **Build:** Verify the project builds successfully.
- **Import:** Check for missing or broken imports.
- **Dependency:** Ensure no missing or broken dependencies.

## 8. Build Gate
AI must NOT conclude a task if the build fails. Ensure the following passes:
- `npm run lint`
- `npm run build`

## 9. Change Impact Checklist
When modifying specific layers, cross-check the following:

- **If modifying `axiosClient`:**
  - Check `API`
  - Check `Hook`
  - Check `Component`

- **If modifying DTO:**
  - Check `Interface`
  - Check `Hook`
  - Check `Page`

- **If modifying Route:**
  - Check `Navigation`
  - Check `Permission`
  - Check `Layout`

## 10. AI Safety Rules
AI is strictly PROHIBITED from:
- Changing rules defined in `PROJECT_RULE.md`.
- Modifying API Contracts silently.
- Modifying `axiosClient` silently.
- Modifying Folder Structure silently.
- Modifying `AuthContext` silently.

## 11. Completion Checklist
Before finishing a task, the AI must self-verify:
- [ ] Read `PROJECT_RULE.md`
- [ ] Analyzed change impact
- [ ] Architecture remains intact
- [ ] No new technical debt created
- [ ] Lint is successful (`npm run lint`)
- [ ] Build is successful (`npm run build`)
