> [!WARNING] 
> STATUS: PLANNED (Not Implemented)

# FACE-BACKEND-04A: Service and Event Remediation

## 1. Executive Summary
This document serves as an official remediation audit for `FACE-BACKEND-04`. It executes four architectural adjustments to correct event payloads, eliminate noisy unused events, enforce strict cross-module port boundaries, and refine the data retention process for rejected images. No code or implementation is generated.

## 2. Remediation Execution

### FIX 1: Diagnostic Data Isolation
- **Action**: Removed `confidenceScore` from the payload of `FaceMatchSuccessEvent`. The new payload is strictly: `studentId`, `gateDeviceId`, `verificationAttemptId`.
- **Reason**: The `confidenceScore` is purely diagnostic data belonging to the Face and AI domains. Downstream business domains (like Smart Access) must never implement authorization rules that depend on variable AI confidence metrics. Providing the `verificationAttemptId` guarantees that Smart Access treats the match as a definitive binary fact, while preserving precise audit traceability back to the Face domain log.

### FIX 2: Elimination of Noise
- **Action**: Completely removed `FacePhotoUploadedEvent` from the Domain Event Catalog.
- **Reason**: Domain events should only exist if they drive downstream choreography. Publishing an event with zero active consumers pollutes the application event bus and creates unnecessary system noise. It can be reintroduced in future phases if metrics or audit consumers actively require it.

### FIX 3: Strict Cross-Module Integration Ports
- **Action**: Enforced `StudentQueryPort` interface for cross-module data integration with the Student Module. 
- **Reason**: To maintain Modular Monolith isolation, the Face Module must utilize a dedicated internal port (`StudentQueryPort` or `StudentReadModel`). Direct injection of `StudentService` or `StudentRepository` across module boundaries is strictly prohibited.

### FIX 4: Image Retention Policy Refinement
- **Action**: Modified the Admin Rejection Flow. Rejected images are no longer synchronously deleted by `FaceStorageService`. The new flow enforces: `REJECTED` $\rightarrow$ Image Retained $\rightarrow$ Deferred Retention Policy Cleanup.
- **Reason**: Immediate synchronous deletion destroys forensic evidence required for Auditability, Appeal Handling, and secondary Admin Reviews. Images associated with a `REJECTED` profile will persist in the CDN until scrubbed by a scheduled, asynchronous cleanup job dictated by the global Data Retention Policy.

## Final Decision
**PASS**
All remediation requirements have been cleanly applied. The Service and Event design is fully aligned with event-driven best practices, strict encapsulation, and auditability constraints.
