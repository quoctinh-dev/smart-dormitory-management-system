package com.sdms.backend.modules.face.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.face.enums.FaceProfileStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregate root for the Face Domain.
 * Tracks the lifecycle of a student's face registration.
 *
 * <p>Ownership: Face Module only.
 * Cross-module reference: student_id (read-only foreign key to Student Module).
 *
 * <p>Constraint: student_id is UNIQUE — 1 Student can have at most 1 FaceProfile at any time.
 */
@Entity
@Table(
        name = "face_profiles",
        indexes = {
                @Index(name = "idx_face_profiles_student_id", columnList = "student_id"),
                @Index(name = "idx_face_profiles_status_created", columnList = "status, created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "profile_id", updatable = false, nullable = false)
    private UUID profileId;

    /**
     * Cross-module reference to the Student Module.
     * UNIQUE constraint enforces 1:0..1 cardinality at the database level.
     * DO NOT inject StudentRepository or StudentService here.
     */
    @Column(name = "student_id", nullable = false, unique = true)
    private UUID studentId;

    /**
     * CDN URL of the uploaded portrait.
     * Nullable: cleared during deferred retention cleanup after REJECTED.
     */
    @Column(name = "face_image_url", length = 500)
    private String faceImageUrl;

    /**
     * CDN URL of the newly uploaded portrait awaiting admin approval.
     * Nullable: only populated during a Replacement Request flow.
     */
    @Column(name = "pending_face_image_url", length = 500)
    private String pendingFaceImageUrl;

    /**
     * Timestamp of the replacement request for Admin Queue sorting (FIFO).
     */
    @Column(name = "replacement_requested_at")
    private LocalDateTime replacementRequestedAt;

    /**
     * Approval lifecycle state. Never null.
     * Valid transitions:
     *   Upload        → PENDING
     *   Admin Approve → APPROVED
     *   Admin Reject  → REJECTED
     *   Admin Revoke  → REVOKED
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private FaceProfileStatus status;

    /**
     * Reason for REJECTED or REVOKED state.
     * Nullable for PENDING and APPROVED states.
     */
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    /**
     * UUID of the Admin who approved this profile.
     * Nullable: only populated when status transitions to APPROVED.
     * Cross-module reference to UserAccount — stored as plain UUID (no JPA join).
     */
    @Column(name = "approved_by")
    private UUID approvedBy;

    /**
     * Timestamp when the Admin approved this profile.
     * Nullable: only populated when status transitions to APPROVED.
     */
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}
