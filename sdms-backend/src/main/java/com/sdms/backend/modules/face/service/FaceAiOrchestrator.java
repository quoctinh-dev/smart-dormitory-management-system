package com.sdms.backend.modules.face.service;

import java.util.UUID;

/**
 * INTERNAL ORCHESTRATION SERVICE.
 * 
 * <p>This service acts as an Anti-Corruption Layer (ACL) between the Face Module 
 * and the external AI Engine.
 *
 * <p><b>Event-Driven:</b> This is NOT a public application service. It should NOT 
 * be called directly by standard REST controllers. It must only be invoked via 
 * Spring Application Event listeners reacting to {@code FaceProfileApprovedEvent}.
 *
 * <p>Ownership: Face Module. Manages the FaceEmbedding aggregate.
 */
public interface FaceAiOrchestrator {

    // --- COMMANDS ---

    /**
     * Generates a biometric embedding for an APPROVED face profile.
     * Consumes FaceProfileApprovedEvent internally.
     * Publishes FaceSyncReadyEvent AFTER_COMMIT upon successful vector persistence.
     *
     * @param profileId The UUID of the FaceProfile to process
     */
    void generateEmbedding(UUID profileId);

    /**
     * Generates a biometric embedding for a pending replacement request.
     * Consumes FaceReplacementApprovedEvent internally.
     * Delegates to FaceProfileService.finalizeReplacement for the atomic swap.
     *
     * @param profileId The UUID of the FaceProfile to process
     */
    void generateReplacementEmbedding(UUID profileId);
}
