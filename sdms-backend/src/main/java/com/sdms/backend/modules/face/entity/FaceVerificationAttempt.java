package com.sdms.backend.modules.face.entity;

import com.sdms.backend.modules.face.enums.FaceVerificationResult;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Insert-only audit ledger for every IoT gate verification request.
 *
 * <p>This entity deliberately does NOT extend BaseEntity.
 * It is immutable: created once per gate scan, never updated.
 *
 * <p>Ownership: Face Module only.
 * camera capture data is NOT stored here — that belongs to the IoT Module boundary.
 */
@Entity
@Table(
        name = "face_verification_attempts",
        indexes = {
                @Index(name = "idx_face_verif_profile_id", columnList = "profile_id"),
                @Index(name = "idx_face_verif_gate_time", columnList = "gate_device_id, attempted_at")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class FaceVerificationAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attempt_id", updatable = false, nullable = false)
    private UUID attemptId;

    /**
     * Identifier of the physical IoT gate device.
     */
    @Column(name = "gate_device_id", nullable = false, length = 100)
    private String gateDeviceId;

    /**
     * The matched FaceProfile, if the verification was successful.
     * Nullable for FAIL and AI_TIMEOUT outcomes.
     * ON DELETE SET NULL: retained for audit even if profile is later deleted.
     */
    @Column(name = "profile_id")
    private UUID profileId;

    /**
     * Cosine similarity distance returned by the pgvector nearest-neighbor query.
     *
     * <p><b>DIAGNOSTIC ONLY.</b> This value exists solely for audit, observability,
     * and AI model performance monitoring.
     *
     * <p><b>GOVERNANCE CONSTRAINT — MUST NEVER be used for:</b>
     * <ul>
     *   <li>Authorization decisions</li>
     *   <li>Access control logic</li>
     *   <li>Permission grants or denials</li>
     * </ul>
     *
     * <p>All access decisions are the exclusive responsibility of the
     * Smart Access Module, which consumes {@code FaceMatchSuccessEvent}
     * and evaluates its own independent policy chain (curfew, time window, student status).
     *
     * <p>Nullable: absent for {@code FAIL} and {@code AI_TIMEOUT} outcomes.
     */
    @Column(name = "confidence_score", precision = 10, scale = 8)
    private BigDecimal confidenceScore;

    /**
     * Outcome of the AI verification attempt.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private FaceVerificationResult status;

    // Immutable timestamp — no updatedAt column on this ledger table.
    @CreatedDate
    @Column(name = "attempted_at", nullable = false, updatable = false)
    private LocalDateTime attemptedAt;
}
