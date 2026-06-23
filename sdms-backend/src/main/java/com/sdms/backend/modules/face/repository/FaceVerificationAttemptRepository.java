package com.sdms.backend.modules.face.repository;

import com.sdms.backend.modules.face.entity.FaceVerificationAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Repository for {@link FaceVerificationAttempt} — an insert-only audit ledger.
 *
 * <p><b>APPEND-ONLY COMPLIANCE:</b> This interface intentionally extends
 * {@link Repository} (not {@code JpaRepository}) to expose ONLY {@code save()}
 * and read methods. Delete and update operations are structurally prohibited,
 * mirroring the pattern used by {@code AccessHistoryRepository}.
 *
 * <p>Every gate scan attempt must be persisted regardless of outcome.
 * Records must never be mutated or deleted. Data retention cleanup is
 * handled by a scheduled archival job — not by this repository.
 */
@Component
public interface FaceVerificationAttemptRepository extends Repository<FaceVerificationAttempt, UUID> {

    /**
     * Persists a new verification attempt record.
     * The only write operation permitted on this ledger.
     */
    FaceVerificationAttempt save(FaceVerificationAttempt attempt);

    /**
     * Returns paginated verification attempts for a specific face profile.
     * Use case: Admin audit view of all gate scans for a given student.
     */
    Page<FaceVerificationAttempt> findByProfileId(UUID profileId, Pageable pageable);

    /**
     * Returns paginated verification attempts for a specific physical gate device.
     * Use case: Security investigation of a specific gate's activity log.
     */
    Page<FaceVerificationAttempt> findByGateDeviceId(String gateDeviceId, Pageable pageable);
}
