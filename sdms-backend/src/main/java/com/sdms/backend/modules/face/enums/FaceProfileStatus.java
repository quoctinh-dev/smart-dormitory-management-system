package com.sdms.backend.modules.face.enums;

/**
 * Lifecycle states for a FaceProfile aggregate root.
 *
 * <p>Valid state machine transitions:
 * <pre>
 *   [Student Upload]  → PENDING
 *   PENDING           → APPROVED    (Admin approves)
 *   PENDING           → REJECTED    (Admin rejects)
 *   APPROVED          → REVOKED     (Admin revokes)
 *   REJECTED          → PENDING     (Student re-uploads)
 *   REVOKED           → PENDING     (Student re-uploads)
 * </pre>
 *
 * <p>NOT_REGISTERED is intentionally excluded:
 * absence of a FaceProfile record represents the unregistered state.
 */
public enum FaceProfileStatus {
    PENDING,
    APPROVED,
    REJECTED,
    REVOKED
}
