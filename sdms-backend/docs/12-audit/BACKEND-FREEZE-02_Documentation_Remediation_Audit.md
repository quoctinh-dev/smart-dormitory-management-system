# BACKEND-FREEZE-02: Documentation Remediation Audit

## 1. Executive Summary
This audit reverses the standard governance paradigm: **The physical source code is treated as the absolute source of truth.** All architectural documentation (`docs/`) has been evaluated against the actual Spring Boot implementation to identify where documentation is outdated, over-specified, or missing. The goal is to produce a documentation remediation matrix that aligns the blueprints with the current reality of the codebase.

## 2. Special Check: Registration & Application Ownership
- **Current State:** The `docs/` taxonomy groups both administrative registration periods and student dormitory applications into a single `04-registration` directory. However, the source code strictly separates `com.sdms.backend.modules.registration` and `com.sdms.backend.modules.application` into distinct bounded contexts.
- **Remediation Plan:** Since the codebase is the source of truth, the documentation taxonomy is **Incorrect (Under-Specified)**. We must split the documentation to mirror the codebase.
- **Action:** 
  1. `DOC-ADD`: Create a new `05-application` documentation directory to house all `DormitoryApplication` workflows.
  2. `DOC-FIX`: Cleanse `04-registration` documents to focus exclusively on `RegistrationPeriod` and `Eligibility` administration.

## 3. Documentation Remediation Matrix

| Module | Discrepancy Type | Classification | Affected Documents | Proposed Action | Priority |
| --- | --- | --- | --- | --- | --- |
| **Auth** | Fully Aligned | N/A | None | No action needed. | NONE |
| **Smart Access**| Fully Aligned | N/A | None | No action needed. | NONE |
| **Application** | Missing Doc Folder | `DOC-ADD` | `docs/04-registration/*` | Extract application logic into a new `05-application` documentation domain. | CRITICAL |
| **Registration**| Over-Specified | `DOC-FIX` | `docs/04-registration/*` | Remove application submission logic from these files to reflect the code boundary. | CRITICAL |
| **Upload** | Documentation Missing| `DOC-ADD` | `docs/12-infra/` (New) | Document the `CloudinaryService` and its APIs, as it physically exists in code but is invisible in docs. | HIGH |
| **Face** | Over-Specified (Future)| `DOC-FIX` | All `docs/07-face/*` | The code is empty. The documents read as if the system is built. Add "STATUS: PLANNED/BLUEPRINT" headers to all Face documents. | HIGH |
| **IoT** | Over-Specified (Future)| `DOC-FIX` | All `docs/08-iot/*` | Add "STATUS: PLANNED/BLUEPRINT" headers to indicate MQTT backend code does not yet exist. | HIGH |
| **Payment** | Over-Specified | `DOC-FIX` | `payment_architecture_audit.md` | Update documents to state that only `PaymentSuccessEvent` is currently implemented in code. | MEDIUM |
| **Student** | Incorrect Security | `DOC-FIX` | `student_code_architecture_audit.md` | Document that `StudentController` utilizes legacy hardcoded String roles (`hasRole('STUDENT')`), not the Smart Access constant pattern. | MEDIUM |
| **Room** | Incorrect Security | `DOC-FIX` | `room_business_architecture_audit.md` | Document the presence of legacy String role technical debt. | MEDIUM |

## 4. Impact Analysis & Team Handoff

### Handoff Impact Matrix
| Team | Remediation Impact | Mitigation |
| --- | --- | --- |
| **Student Mobile Team**| **High** - They must know that `/application` and `/registration` are distinct APIs, not a monolithic service. | Executing the Application/Registration split (`DOC-ADD`) prevents frontend route confusion. |
| **Admin Web Team** | **High** - The Admin UI must decouple period management from application review. | Same as above. |
| **AI Team** | **Medium** - They must understand that the Face Spring Boot implementation has not started. | Adding `STATUS: PLANNED` headers prevents the AI team from attempting integration too early. |
| **Spring Team** | **Low** - They already know the code state. | The remediation matrix serves as their future backlog. |

## 5. Final Recommendations
1. **Immediately spin up `05-application`** in the documentation taxonomy to match the code repository structure.
2. **Tag Future Architectures:** Apply a clear `STATUS: PLANNED (Not Implemented)` watermark to all `Face` and `IoT` documentation to protect downstream teams from assuming these modules are functional.
3. **Embrace Technical Debt in Docs:** Officially document the legacy String-based `@PreAuthorize` security patterns in `Student` and `Room` docs so the security reality is transparent to auditors.

## Final Decision
**PASS**
By shifting the paradigm to treat the physical code as the absolute source of truth, we successfully identified critical documentation taxonomy errors (Application vs Registration) and generated a concrete roadmap to realign the blueprints with reality.
