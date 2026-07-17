package com.sdms.backend.modules.face.service.impl;

import com.sdms.backend.modules.face.entity.FaceEmbedding;
import com.sdms.backend.modules.face.entity.FaceProfile;
import com.sdms.backend.modules.face.enums.FaceProfileStatus;
import com.sdms.backend.modules.face.event.*;
import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
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
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin sinh viên khi xác thực chéo: " + studentId);
        }

        Optional<FaceProfile> existingOpt = faceProfileRepository.findByStudentId(studentId);

        if (existingOpt.isPresent()) {
            FaceProfile profile = existingOpt.get();
            if (profile.getStatus() == FaceProfileStatus.APPROVED) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Sinh viên đã có hồ sơ khuôn mặt đang hoạt động. Vui lòng sử dụng tính năng yêu cầu thay thế.");
            }
            if (profile.getPendingFaceImageUrl() != null) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Sinh viên đã có yêu cầu thay thế khuôn mặt đang chờ duyệt.");
            }

            // Luồng đăng ký lại cho các hồ sơ PENDING, REJECTED hoặc REVOKED
            // Cho phép ghi đè hồ sơ PENDING để tối ưu UX khi sinh viên nhận ra họ đã tải lên ảnh xấu
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
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khuôn mặt: " + profileId));

        if (profile.getPendingFaceImageUrl() != null) {
            approveReplacement(profileId, adminId);
            return;
        }

        if (profile.getStatus() != FaceProfileStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hồ sơ phải ở trạng thái CHỜ DUYỆT mới có thể được duyệt.");
        }

        profile.setStatus(FaceProfileStatus.APPROVED);
        profile.setApprovedBy(adminId);
        profile.setApprovedAt(LocalDateTime.now());
        faceProfileRepository.save(profile);

        // Các listener AFTER_COMMIT sẽ xử lý việc này theo transaction
        String email = studentQueryPort.getStudentEmail(profile.getStudentId());
        String fullName = studentQueryPort.getStudentFullName(profile.getStudentId());
        eventPublisher.publishEvent(new FaceProfileApprovedEvent(profileId, profile.getStudentId(), email, fullName));
    }

    @Override
    public void rejectFace(UUID profileId, String rejectionReason) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khuôn mặt: " + profileId));

        if (profile.getPendingFaceImageUrl() != null) {
            rejectReplacement(profileId, rejectionReason);
            return;
        }

        if (profile.getStatus() != FaceProfileStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hồ sơ phải ở trạng thái CHỜ DUYỆT mới có thể bị từ chối.");
        }

        profile.setStatus(FaceProfileStatus.REJECTED);
        profile.setRejectionReason(rejectionReason);
        faceProfileRepository.save(profile);

        eventPublisher.publishEvent(new FaceProfileRejectedEvent(profileId));
    }

    @Override
    public void revokeFace(UUID profileId, String revocationReason) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khuôn mặt: " + profileId));

        if (profile.getStatus() != FaceProfileStatus.APPROVED) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hồ sơ phải ở trạng thái ĐÃ DUYỆT mới có thể bị thu hồi.");
        }

        profile.setStatus(FaceProfileStatus.REVOKED);
        profile.setRejectionReason(revocationReason);
        faceProfileRepository.save(profile);

        // Ngay lập tức chấm dứt quyền truy cập cổng vật lý
        faceEmbeddingRepository.deleteByProfileId(profileId);

        eventPublisher.publishEvent(new FaceProfileRevokedEvent(profileId, revocationReason));
    }

    @Override
    public void requestReplacement(UUID studentId, String pendingFaceImageUrl) {
        FaceProfile profile = faceProfileRepository.findByStudentId(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khuôn mặt cho sinh viên này: " + studentId));

        if (profile.getStatus() != FaceProfileStatus.APPROVED) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hồ sơ phải ở trạng thái ĐÃ DUYỆT mới có thể yêu cầu thay thế.");
        }

        profile.setPendingFaceImageUrl(pendingFaceImageUrl);
        profile.setReplacementRequestedAt(LocalDateTime.now());
        faceProfileRepository.save(profile);

        eventPublisher.publishEvent(new FaceReplacementRequestedEvent(profile.getProfileId()));
    }

    @Override
    public void approveReplacement(UUID profileId, UUID adminId) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khuôn mặt: " + profileId));

        if (profile.getPendingFaceImageUrl() == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Không có yêu cầu thay thế nào cho hồ sơ khuôn mặt này: " + profileId);
        }

        // Chưa cập nhật hồ sơ hoặc xóa vector để đảm bảo tính liên tục của quyền truy cập.
        // Kích hoạt trích xuất AI trước.
        eventPublisher.publishEvent(new FaceReplacementApprovedEvent(profileId));
    }

    @Override
    public void rejectReplacement(UUID profileId, String rejectionReason) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khuôn mặt: " + profileId));

        if (profile.getPendingFaceImageUrl() == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Không có yêu cầu thay thế nào cho hồ sơ khuôn mặt này: " + profileId);
        }

        profile.setPendingFaceImageUrl(null);
        profile.setReplacementRequestedAt(null);
        faceProfileRepository.save(profile);

        eventPublisher.publishEvent(new FaceReplacementRejectedEvent(profileId, rejectionReason));
    }

    @Override
    public void finalizeReplacement(UUID profileId, float[] newVector) {
        FaceProfile profile = faceProfileRepository.findById(profileId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khuôn mặt: " + profileId));

        if (profile.getPendingFaceImageUrl() == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Không có ảnh chờ duyệt để hoàn tất cho hồ sơ khuôn mặt này: " + profileId);
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
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ khuôn mặt cho sinh viên này: " + studentId));
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
