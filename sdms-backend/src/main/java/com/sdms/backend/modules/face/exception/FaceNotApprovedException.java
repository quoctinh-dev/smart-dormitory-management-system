package com.sdms.backend.modules.face.exception;

import com.sdms.backend.modules.face.enums.FaceProfileStatus;

import java.util.UUID;

/**
 * Thrown when an operation requires an APPROVED FaceProfile
 * but the profile is in a different state (e.g., PENDING, REJECTED, REVOKED).
 * Maps to HTTP 422 Unprocessable Entity.
 */
public class FaceNotApprovedException extends RuntimeException {

    public FaceNotApprovedException(UUID profileId, FaceProfileStatus currentStatus) {
        super("Operation requires APPROVED face profile, but profile "
                + profileId + " is currently: " + currentStatus);
    }
}
