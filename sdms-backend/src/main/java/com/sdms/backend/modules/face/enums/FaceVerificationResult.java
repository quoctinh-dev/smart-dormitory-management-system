package com.sdms.backend.modules.face.enums;

/**
 * Outcome of an IoT gate verification attempt processed by the AI Engine.
 *
 * <p>Stored in {@link com.sdms.backend.modules.face.entity.FaceVerificationAttempt}
 * for audit and diagnostic purposes.
 */
public enum FaceVerificationResult {
    /** AI Engine matched the frame to a student above the cosine similarity threshold. */
    SUCCESS,

    /** AI Engine found no match above the cosine similarity threshold. */
    FAIL,

    /** AI Engine was unreachable or timed out. Circuit breaker was triggered. */
    AI_TIMEOUT
}
