package com.sdms.backend.modules.smartaccess.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.smartaccess.api.dto.request.UpdateCurfewRequestDto;
import com.sdms.backend.modules.smartaccess.api.dto.response.CurfewRequestDto;
import com.sdms.backend.modules.smartaccess.domain.entity.CurfewRequest;
import com.sdms.backend.modules.smartaccess.domain.enums.CurfewRequestStatus;
import com.sdms.backend.modules.smartaccess.domain.enums.CurfewRequestType;
import com.sdms.backend.modules.smartaccess.domain.repository.CurfewRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sdms.backend.modules.user.entity.UserAccount;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurfewRequestService {

    private final CurfewRequestRepository curfewRequestRepository;

    @Transactional
    public CurfewRequestDto createRequest(com.sdms.backend.modules.smartaccess.api.dto.request.CreateCurfewRequestDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserAccount account = (UserAccount) authentication.getPrincipal();
        
        if (account.getStudent() == null) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Người dùng không phải là sinh viên");
        }
        
        CurfewRequestType type = CurfewRequestType.LATE_RETURN;
        if (dto.getRequestType() != null && dto.getRequestType().equals("ABSENCE")) {
            type = CurfewRequestType.ABSENCE;
        }

        CurfewRequest request = CurfewRequest.builder()
                .student(account.getStudent())
                .reason(dto.getReason())
                .requestType(type)
                .startDate(dto.getStartDate())
                .expectedArrivalTime(dto.getExpectedArrivalTime())
                .status(CurfewRequestStatus.PENDING)
                .build();
                
        request = curfewRequestRepository.save(request);
        return mapToDto(request);
    }

    @Transactional(readOnly = true)
    public Page<CurfewRequestDto> getRequestsByStatus(String status, Pageable pageable) {
        Page<CurfewRequest> requests;
        if (status == null || status.isEmpty()) {
            requests = curfewRequestRepository.findAll(pageable);
        } else {
            requests = curfewRequestRepository.findByStatus(CurfewRequestStatus.valueOf(status), pageable);
        }

        return requests.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<CurfewRequestDto> getMyRequests(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserAccount account = (UserAccount) authentication.getPrincipal();
        
        if (account.getStudent() == null) {
            return Page.empty(pageable);
        }
        
        UUID studentId = account.getStudent().getStudentId();
        
        return curfewRequestRepository.findByStudentStudentId(studentId, pageable).map(this::mapToDto);
    }

    @Transactional
    public CurfewRequestDto updateRequestStatus(UUID requestId, UpdateCurfewRequestDto dto, UUID adminId) {
        CurfewRequest request = curfewRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (dto.getStatus() != null) {
            request.setStatus(dto.getStatus());
        }
        if (dto.getAdminNote() != null) {
            request.setAdminNote(dto.getAdminNote());
        }

        // Normally we would set resolvedBy = userAccount(adminId), but for simplicity in this demo we skip linking the admin entity or we can just fetch it if needed.
        
        request = curfewRequestRepository.save(request);
        return mapToDto(request);
    }

    @Transactional
    public java.util.List<CurfewRequestDto> bulkUpdateStatus(com.sdms.backend.modules.smartaccess.api.dto.BulkCurfewRequestDto dto, CurfewRequestStatus status, UUID adminId) {
        java.util.List<CurfewRequest> requests = curfewRequestRepository.findAllById(dto.getRequestIds());
        for (CurfewRequest req : requests) {
            req.setStatus(status);
            if (dto.getAdminNote() != null) {
                req.setAdminNote(dto.getAdminNote());
            }
        }
        requests = curfewRequestRepository.saveAll(requests);
        return requests.stream().map(this::mapToDto).collect(java.util.stream.Collectors.toList());
    }

    private CurfewRequestDto mapToDto(CurfewRequest req) {
        return CurfewRequestDto.builder()
                .requestId(req.getRequestId())
                .studentId(req.getStudent().getStudentId())
                .studentName(req.getStudent().getFullName())
                .studentCode(req.getStudent().getStudentId().toString()) // Should be studentCode if available
                .reason(req.getReason())
                .requestType(req.getRequestType().name())
                .startDate(req.getStartDate())
                .expectedArrivalTime(req.getExpectedArrivalTime())
                .status(req.getStatus().name())
                .createdAt(req.getCreatedAt())
                .adminNote(req.getAdminNote())
                .build();
    }
}
