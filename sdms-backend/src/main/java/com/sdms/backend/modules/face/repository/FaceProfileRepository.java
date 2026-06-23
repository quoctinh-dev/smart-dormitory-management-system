package com.sdms.backend.modules.face.repository;

import com.sdms.backend.modules.face.entity.FaceProfile;
import com.sdms.backend.modules.face.enums.FaceProfileStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link FaceProfile} aggregate root.
 *
 * <p>Ownership: Face Module only.
 * Do NOT inject this repository into any other module directly.
 * Cross-module reads must go through a dedicated port interface.
 */
@Repository
public interface FaceProfileRepository extends JpaRepository<FaceProfile, UUID> {

    /**
     * Looks up the face profile for a given student.
     * Used to enforce the 1:0..1 cardinality check before creating a new profile.
     */
    Optional<FaceProfile> findByStudentId(UUID studentId);

    /**
     * Returns true if any FaceProfile record exists for the given student.
     * Used for fast existence checks before upload without loading the entity.
     */
    boolean existsByStudentId(UUID studentId);

    /**
     * Returns a paginated list of profiles filtered by status.
     * Primary use case: Admin approval queue — {@code findByStatus(PENDING, pageable)}.
     * Results are sorted by {@code created_at ASC} to enforce FIFO review order
     * via {@code Pageable} (e.g., {@code PageRequest.of(0, 20, Sort.by("createdAt").ascending())}).
     */
    Page<FaceProfile> findByStatus(FaceProfileStatus status, Pageable pageable);

    /**
     * Returns a paginated list of profiles that are either PENDING or have a replacement request pending.
     * Used for the unified Admin Queue.
     */
    Page<FaceProfile> findByStatusOrPendingFaceImageUrlIsNotNull(FaceProfileStatus status, Pageable pageable);
}
