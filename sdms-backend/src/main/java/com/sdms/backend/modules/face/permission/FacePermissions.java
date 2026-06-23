package com.sdms.backend.modules.face.permission;

/**
 * Centralized permission constants for the Face Module.
 *
 * <p>GOVERNANCE: All @PreAuthorize annotations in FaceStudentController
 * and FaceAdminController MUST reference only these constants.
 * No inline "hasRole(...)" or "hasAuthority(...)" strings are permitted.
 *
 * <p>Actor ownership per ACTOR-MATRIX-01:
 * <ul>
 *   <li>FACE_REGISTER   → Student</li>
 *   <li>FACE_VIEW_SELF  → Student</li>
 *   <li>FACE_VIEW_ALL   → Admin</li>
 *   <li>FACE_APPROVE    → Admin</li>
 *   <li>FACE_REJECT     → Admin</li>
 *   <li>FACE_REVOKE     → Admin</li>
 * </ul>
 */
public final class FacePermissions {

    private FacePermissions() {}

    // ─── Student Permissions ──────────────────────────────────────────────────

    /** Allows uploading or re-uploading a portrait photo. */
    public static final String FACE_REGISTER  = "hasAuthority('FACE_REGISTER')";

    /** Allows a student to view their own face profile status. */
    public static final String FACE_VIEW_SELF = "hasAuthority('FACE_VIEW_SELF')";

    // ─── Admin Permissions ────────────────────────────────────────────────────

    /** Allows admin to view all face profiles and the pending approval queue. */
    public static final String FACE_VIEW_ALL  = "hasAuthority('FACE_VIEW_ALL')";

    /** Allows admin to approve a PENDING profile and trigger AI extraction. */
    public static final String FACE_APPROVE   = "hasAuthority('FACE_APPROVE')";

    /** Allows admin to reject a PENDING profile. */
    public static final String FACE_REJECT    = "hasAuthority('FACE_REJECT')";

    /** Allows admin to revoke an APPROVED profile and disable gate access. */
    public static final String FACE_REVOKE    = "hasAuthority('FACE_REVOKE')";
}
