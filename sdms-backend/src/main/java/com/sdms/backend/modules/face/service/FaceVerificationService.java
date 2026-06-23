package com.sdms.backend.modules.face.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for runtime identity verification.
 * Processes high-throughput requests from IoT gates.
 *
 * <p>Ownership: Face Module.
 * Manages the FaceVerificationAttempt audit ledger.
 */
public interface FaceVerificationService {

    // DTO contracts are now defined in com.sdms.backend.modules.face.dto.response

    // --- COMMANDS ---

    /**
     * Verifies an incoming face verification payload against the approved embeddings pool.
     * Evaluates distance against the internal governance threshold.
     * @param verificationPayload Abstract payload from IoT Edge (hides vector serialization details)
     * @return FaceVerificationResultResponse containing distance, attempt ID, matched profile ID, etc.
     */
    com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse verifyFace(String gateDeviceId, com.sdms.backend.modules.face.dto.request.FaceVerificationRequest verificationPayload);

    // --- QUERIES ---

    /**
     * Retrieves the audit ledger of verification attempts for a specific student profile.
     *
     * @param profileId The UUID of the FaceProfile
     * @param pageable  Pagination configuration
     * @return Paginated placeholder DTOs (VerificationAttemptSummary)
     */
    Page<com.sdms.backend.modules.face.dto.response.VerificationAttemptSummaryResponse> viewVerificationAttempts(UUID profileId, Pageable pageable);
}
