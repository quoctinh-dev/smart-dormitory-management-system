package com.sdms.backend.modules.face.repository;

import com.sdms.backend.modules.face.entity.FaceEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link FaceEmbedding}.
 *
 * <p>Ownership: Face Module only.
 * The raw vector must never be exposed outside this module.
 * Smart Access consumes {@code FaceSyncReadyEvent} — not the embedding directly.
 *
 * <p><b>Threshold Governance:</b> This repository does NOT contain threshold logic.
 * The cosine similarity threshold (e.g. 0.8) is the exclusive responsibility
 * of the Service Layer ({@code FaceVerificationService}), not this repository.
 */
@Repository
public interface FaceEmbeddingRepository extends JpaRepository<FaceEmbedding, UUID> {

    /**
     * Looks up the embedding for a specific profile.
     * Used by {@code FaceAiOrchestrator} to check whether extraction has already occurred.
     */
    Optional<FaceEmbedding> findByProfileId(UUID profileId);

    /**
     * Deletes the embedding for a specific profile.
     * Used by FaceProfileService during an Atomic Swap replacement.
     */
    void deleteByProfileId(UUID profileId);

    /**
     * Executes a pgvector cosine similarity nearest-neighbor search against all
     * APPROVED face embeddings and returns the profile ID of the closest match.
     *
     * <p><b>Threshold Governance:</b> This query intentionally returns the single
     * closest match WITHOUT applying a threshold filter. The calling Service Layer
     * ({@code FaceVerificationService}) is solely responsible for evaluating
     * whether the returned distance satisfies the acceptance threshold.
     *
     * <p><b>Vector format:</b> {@code queryVector} must be a PostgreSQL vector literal
     * string, e.g. {@code "[0.1,0.2,...,0.5]"}, cast via {@code ::vector} in the query.
     *
     * <p><b>Index:</b> Requires the HNSW index ({@code idx_face_embeddings_vector})
     * on the {@code vector} column, created by Flyway migration.
     *
     * @param queryVector the 512-dimension vector string from the AI Engine
     * @return the profile_id and cosine distance of the nearest embedding, or empty if none found
     */
    @Query(value = """
            SELECT fe.profile_id AS profileId,
                   (fe.vector <=> CAST(:queryVector AS vector)) AS distance
            FROM face_embeddings fe
            JOIN face_profiles fp ON fe.profile_id = fp.profile_id
            WHERE fp.status = 'APPROVED'
            ORDER BY fe.vector <=> CAST(:queryVector AS vector) ASC
            LIMIT 1
            """,
            nativeQuery = true)
    Optional<VectorMatchResult> findNearestMatch(@Param("queryVector") String queryVector);

    /**
     * Projection interface for the vector similarity query result.
     * Decouples the raw query result from the {@link FaceEmbedding} entity.
     *
     * <p>The Service Layer reads {@code getDistance()} and applies its own threshold.
     */
    interface VectorMatchResult {
        UUID getProfileId();
        Double getDistance();
    }
}
