package com.sdms.backend.modules.face.entity;

import com.sdms.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Stores the 512-dimension biometric vector for an APPROVED FaceProfile.
 *
 * <p>Ownership: Face Module only.
 * Vector data MUST NOT be exposed outside this module.
 * Smart Access consumes {@code FaceSyncReadyEvent}, not the raw vector.
 *
 * <p>Vector Library: {@code org.hibernate.orm:hibernate-vector} (6.6.49.Final).
 * Hibernate 6 maps {@code float[]} directly to PostgreSQL {@code vector(512)}.
 * No additional {@code @Type} annotation is required.
 *
 * <p><b>float[] vs double[]:</b> {@code float[]} (32-bit) is used intentionally.
 * A 512-dim {@code double[]} would consume 4 KB per row vs 2 KB for {@code float[]}.
 * AI models (ArcFace, MobileFaceNet) output 32-bit floats — no precision is lost.
 *
 * <p>Similarity search is executed via native SQL in {@code FaceEmbeddingRepository}:
 * {@code ORDER BY embedding_vector <=> ?::vector LIMIT 1}
 *
 * <p>The HNSW index ({@code vector_cosine_ops}) is created by Flyway DDL —
 * JPA {@code @Index} does not support non-BTree index types.
 */
@Entity
@Table(name = "face_embeddings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceEmbedding extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "embedding_id", updatable = false, nullable = false)
    private UUID embeddingId;

    /**
     * 1:1 FK to FaceProfile aggregate root.
     * UNIQUE constraint enforces one embedding per profile.
     */
    @Column(name = "profile_id", nullable = false, unique = true)
    private UUID profileId;

    /**
     * 512-dimension biometric vector.
     * float[] (32-bit) maps directly to PostgreSQL vector(512) via hibernate-vector.
     */
    @Column(name = "vector", nullable = false, columnDefinition = "vector(512)")
    private float[] embeddingVector;
}
