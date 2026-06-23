package com.sdms.backend.modules.face.exception;

import java.util.UUID;

/**
 * Thrown when a student attempts to register a new face photo
 * while an existing PENDING profile is still awaiting admin review.
 * Maps to HTTP 409 Conflict.
 */
public class FaceAlreadyRegisteredException extends RuntimeException {

    public FaceAlreadyRegisteredException(UUID studentId) {
        super("A face profile is already pending review for student: " + studentId
                + ". Please wait for the current submission to be reviewed.");
    }

    public FaceAlreadyRegisteredException(String message) {
        super(message);
    }
}
