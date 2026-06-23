package com.sdms.backend.modules.face.exception;

import java.util.UUID;

/**
 * Thrown when a FaceProfile cannot be located by its ID or student ID.
 * Maps to HTTP 404 Not Found.
 */
public class FaceProfileNotFoundException extends RuntimeException {

    public FaceProfileNotFoundException(UUID profileId) {
        super("Face profile not found: " + profileId);
    }

    public FaceProfileNotFoundException(String message) {
        super(message);
    }

    public static FaceProfileNotFoundException forStudent(UUID studentId) {
        return new FaceProfileNotFoundException(
                "No face profile found for student: " + studentId
        );
    }
}
