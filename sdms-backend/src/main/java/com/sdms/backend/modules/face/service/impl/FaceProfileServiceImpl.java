package com.sdms.backend.modules.face.service.impl;

import com.sdms.backend.modules.face.entity.FaceEmbedding;
import com.sdms.backend.modules.face.entity.FaceProfile;
import com.sdms.backend.modules.face.enums.FaceProfileStatus;
import com.sdms.backend.modules.face.event.*;
import com.sdms.backend.modules.face.exception.*;
import com.sdms.backend.modules.face.port.StudentQueryPort;
import com.sdms.backend.modules.face.repository.FaceEmbeddingRepository;
import com.sdms.backend.modules.face.repository.FaceProfileRepository;
import com.sdms.backend.modules.face.service.FaceProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class FaceProfileServiceImpl implements FaceProfileService {

    private final FaceProfileRepository faceProfileRepository;
    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final StudentQueryPort studentQueryPort;

    @Override
    public UUID registerFace(UUID studentId, String faceImageUrl) {
        if (!studentQueryPort.existsById(studentId)) {
            throw new StudentNotFoundException("Student not found in cross-context verification: " + studentId);
        }

        Optional<FaceProfile> existingOpt = faceProfileRepository.findByStudentId(studentId);

        if (existingOpt.isPresent()) {
            FaceProfile profile = existingOpt.get();
            if (profile.getStatus() == FaceProfileStatus.APPROVED) {
                throw new FaceAlreadyRegisteredException("Student already has an active face profile. Please use replacement request instead.");
            }
            if (profile.getPendingFaceImageUrl() != null) {
                throw new FaceAlreadyRegisteredException("Student already has a replacement request pending.");
            }

            // Re-registration flow for PENDING, REJECTED or REVOKED profiles
            // Allow overwriting PENDING profile to optimize UX when student realizes they uploaded a bad photo
            profile.setFaceImageUrl(faceImageUrl);
            profile.setStatus(FaceProfileStatus.PENDING);
            profile.setRejectionReason(null);
            return faceProfileRepository.save(profile).getProfileId();
        }

        FaceProfile newProfile = FaceProfile.builder()
                .studentId(studentId)
                .faceImageUrl(faceImageUrl)
                .status(FaceProfileStatus.PENDING)
                .build();

        return faceProfileRepository.save(newProfile).getProfileId();
    }

    @Override
    public void approveFace(UUID profileId, UUID adminId) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new FaceProfileNotFoundException("Face profile not found: " + profileId));

        if (profile.getPendingFaceImageUrl() != null) {
            approveReplacement(profileId, adminId);
            return;
        }

        if (profile.getStatus() != FaceProfileStatus.PENDING) {
            throw new InvalidFaceProfileStateException("Profile must be PENDING to be approved.");
        }

        profile.setStatus(FaceProfileStatus.APPROVED);
        profile.setApprovedBy(adminId);
        profile.setApprovedAt(LocalDateTime.now());
        faceProfileRepository.save(profile);

        // AFTER_COMMIT listeners will handle this transactionally
        eventPublisher.publishEvent(new FaceProfileApprovedEvent(profileId, profile.getStudentId(), null, null));
    }

    @Override
    public void rejectFace(UUID profileId, String rejectionReason) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new FaceProfileNotFoundException("Face profile not found: " + profileId));

        if (profile.getPendingFaceImageUrl() != null) {
            rejectReplacement(profileId, rejectionReason);
            return;
        }

        if (profile.getStatus() != FaceProfileStatus.PENDING) {
            throw new InvalidFaceProfileStateException("Profile must be PENDING to be rejected.");
        }

        profile.setStatus(FaceProfileStatus.REJECTED);
        profile.setRejectionReason(rejectionReason);
        faceProfileRepository.save(profile);

        eventPublisher.publishEvent(new FaceProfileRejectedEvent(profileId));
    }

    @Override
    public void revokeFace(UUID profileId, String revocationReason) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new FaceProfileNotFoundException("Face profile not found: " + profileId));

        if (profile.getStatus() != FaceProfileStatus.APPROVED) {
            throw new InvalidFaceProfileStateException("Profile must be APPROVED to be revoked.");
        }

        profile.setStatus(FaceProfileStatus.REVOKED);
        profile.setRejectionReason(revocationReason);
        faceProfileRepository.save(profile);

        // Instantly terminate gate physical access
        faceEmbeddingRepository.deleteByProfileId(profileId);

        eventPublisher.publishEvent(new FaceProfileRevokedEvent(profileId, revocationReason));
    }

    @Override
    public void requestReplacement(UUID studentId, String pendingFaceImageUrl) {
        FaceProfile profile = faceProfileRepository.findByStudentId(studentId)
                .orElseThrow(() -> new FaceProfileNotFoundException("No face profile found for student: " + studentId));

        if (profile.getStatus() != FaceProfileStatus.APPROVED) {
            throw new InvalidFaceProfileStateException("Profile must be APPROVED to request a replacement.");
        }

        profile.setPendingFaceImageUrl(pendingFaceImageUrl);
        profile.setReplacementRequestedAt(LocalDateTime.now());
        faceProfileRepository.save(profile);

        eventPublisher.publishEvent(new FaceReplacementRequestedEvent(profile.getProfileId()));
    }

    @Override
    public void approveReplacement(UUID profileId, UUID adminId) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new FaceProfileNotFoundException("Face profile not found: " + profileId));

        if (profile.getPendingFaceImageUrl() == null) {
            throw new ReplacementNotRequestedException("No replacement requested for profile: " + profileId);
        }

        // Do not update profile or delete embedding yet to guarantee access continuity.
        // Trigger AI extraction first.
        eventPublisher.publishEvent(new FaceReplacementApprovedEvent(profileId));
    }

    @Override
    public void rejectReplacement(UUID profileId, String rejectionReason) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new FaceProfileNotFoundException("Face profile not found: " + profileId));

        if (profile.getPendingFaceImageUrl() == null) {
            throw new ReplacementNotRequestedException("No replacement requested for profile: " + profileId);
        }

        profile.setPendingFaceImageUrl(null);
        profile.setReplacementRequestedAt(null);
        faceProfileRepository.save(profile);

        eventPublisher.publishEvent(new FaceReplacementRejectedEvent(profileId, rejectionReason));
    }

    @Override
    public void finalizeReplacement(UUID profileId, float[] newVector) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new FaceProfileNotFoundException("Face profile not found: " + profileId));

        if (profile.getPendingFaceImageUrl() == null) {
            throw new ReplacementNotRequestedException("No pending image to finalize for profile: " + profileId);
        }

        profile.setFaceImageUrl(profile.getPendingFaceImageUrl());
        profile.setPendingFaceImageUrl(null);
        profile.setReplacementRequestedAt(null);
        faceProfileRepository.save(profile);

        faceEmbeddingRepository.deleteByProfileId(profileId);
        
        FaceEmbedding newEmbedding = FaceEmbedding.builder()
                .profileId(profileId)
                .embeddingVector(newVector)
                .build();
        faceEmbeddingRepository.save(newEmbedding);

        eventPublisher.publishEvent(new FaceSyncReadyEvent(profileId));
    }

    @Override
    @Transactional(readOnly = true)
    public com.sdms.backend.modules.face.dto.response.FaceProfileDetailResponse getMyFaceProfile(UUID studentId) {
        return faceProfileRepository.findByStudentId(studentId)
                .map(profile -> new com.sdms.backend.modules.face.dto.response.FaceProfileDetailResponse(
                        profile.getProfileId(),
                        profile.getStudentId(),
                        profile.getFaceImageUrl(),
                        profile.getStatus(),
                        profile.getRejectionReason(),
                        profile.getPendingFaceImageUrl(),
                        profile.getReplacementRequestedAt(),
                        profile.getCreatedAt(),
                        profile.getUpdatedAt()
                ))
                .orElseThrow(() -> new FaceProfileNotFoundException("No face profile found for student: " + studentId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<com.sdms.backend.modules.face.dto.response.FaceProfileSummaryResponse> searchPendingProfiles(Pageable pageable) {
        return faceProfileRepository.findByStatusOrPendingFaceImageUrlIsNotNull(FaceProfileStatus.PENDING, pageable)
                .map(profile -> new com.sdms.backend.modules.face.dto.response.FaceProfileSummaryResponse(
                        profile.getProfileId(),
                        profile.getStudentId(),
                        profile.getPendingFaceImageUrl() != null ? profile.getPendingFaceImageUrl() : profile.getFaceImageUrl(),
                        profile.getStatus(),
                        profile.getCreatedAt()
                ));
    }
}
