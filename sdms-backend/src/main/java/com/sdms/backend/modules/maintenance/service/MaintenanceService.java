package com.sdms.backend.modules.maintenance.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.maintenance.dto.request.CreateMaintenanceRequest;
import com.sdms.backend.modules.maintenance.dto.request.UpdateMaintenanceStatusRequest;
import com.sdms.backend.modules.maintenance.dto.response.MaintenanceResponse;
import com.sdms.backend.modules.maintenance.entity.MaintenanceRequest;
import com.sdms.backend.modules.maintenance.enums.MaintenanceStatus;
import com.sdms.backend.modules.maintenance.repository.MaintenanceRequestRepository;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final ApplicationEventPublisher eventPublisher;

    public MaintenanceResponse createRequest(CreateMaintenanceRequest request) {
        UserAccount currentUser = getCurrentUserAccount();
        UUID studentId = currentUser.getStudent().getStudentId();

        StudentHousingAssignment assignment = assignmentRepository
                .findByStudent_StudentIdAndStatus(studentId, AssignmentStatus.OCCUPIED)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Chỉ sinh viên đang lưu trú mới được báo cáo bảo trì"));

        MaintenanceRequest maintenance = new MaintenanceRequest();
        maintenance.setRoomId(assignment.getBed().getRoom().getRoomId());
        maintenance.setStudentId(studentId);
        maintenance.setDescription(request.getDescription());
        maintenance.setImageUrl(request.getImageUrl());
        maintenance.setStatus(MaintenanceStatus.PENDING);

        maintenance = maintenanceRepository.save(maintenance);
        return mapToResponse(maintenance);
    }

    @Transactional(readOnly = true)
    public PageResponse<MaintenanceResponse> getMyRequests(Pageable pageable) {
        UserAccount currentUser = getCurrentUserAccount();
        UUID studentId = currentUser.getStudent().getStudentId();

        Page<MaintenanceRequest> page = maintenanceRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable);
        return PageResponse.of(page.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<MaintenanceResponse> getAllRequests(Pageable pageable) {
        Page<MaintenanceRequest> page = maintenanceRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.of(page.map(this::mapToResponse));
    }

    public MaintenanceResponse updateStatus(UUID id, UpdateMaintenanceStatusRequest request) {
        MaintenanceRequest maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu bảo trì"));

        maintenance.setStatus(request.getStatus());
        maintenance = maintenanceRepository.save(maintenance);
        
        // Publish event for notification
        eventPublisher.publishEvent(new com.sdms.backend.modules.maintenance.event.MaintenanceStatusChangedEvent(
                maintenance.getId(),
                maintenance.getStudentId(),
                maintenance.getStatus(),
                maintenance.getDescription()
        ));
        
        return mapToResponse(maintenance);
    }

    private MaintenanceResponse mapToResponse(MaintenanceRequest entity) {
        return MaintenanceResponse.builder()
                .id(entity.getId())
                .roomId(entity.getRoomId())
                .studentId(entity.getStudentId())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private UserAccount getCurrentUserAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount)) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Người dùng chưa đăng nhập");
        }
        return (UserAccount) authentication.getPrincipal();
    }
}
