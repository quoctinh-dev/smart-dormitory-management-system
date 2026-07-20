package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistorySpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access/history")
@RequiredArgsConstructor
@Tag(name = "Lịch sử ra vào cổng (Access History)", description = "API quản lý và tra cứu lịch sử ra vào của sinh viên")
public class AccessHistoryController {

    private final AccessHistoryRepository accessHistoryRepository;

    /**
     * ADMIN/STAFF: Xem toàn bộ lịch sử hệ thống (phân trang).
     */
    @Operation(summary = "Xem toàn bộ lịch sử", description = "Dành cho Admin/Staff xem toàn bộ lịch sử ra vào của hệ thống")
    @GetMapping
    @PreAuthorize(SmartAccessPermissions.VIEW_ACCESS_HISTORY)
    public ApiResponse<PageResponse<AccessHistory>> getAllHistory(
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) UUID gateId,
            @RequestParam(required = false) String decision,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        
        Specification<AccessHistory> spec = AccessHistorySpecification.filter(studentId, gateId, decision, startDate, endDate);
        Page<AccessHistory> page = accessHistoryRepository.findAll(spec, pageable);
        return ApiResponse.success("Lấy danh sách lịch sử thành công", PageResponse.of(page));
    }

    /**
     * ADMIN/STAFF: Xem lịch sử ra vào theo studentId bất kỳ.
     */
    @Operation(summary = "Xem lịch sử theo sinh viên", description = "Dành cho Admin/Staff tra cứu lịch sử của một sinh viên cụ thể")
    @GetMapping("/student/{studentId}")
    @PreAuthorize(SmartAccessPermissions.VIEW_ACCESS_HISTORY)
    public ApiResponse<PageResponse<AccessHistory>> getHistoryByStudent(
            @PathVariable UUID studentId,
            Pageable pageable) {
        Page<AccessHistory> page = accessHistoryRepository.findByStudentId(studentId, pageable);
        return ApiResponse.success("Lấy lịch sử sinh viên thành công", PageResponse.of(page));
    }

    /**
     * STUDENT: Xem lịch sử ra vào của chính mình.
     * studentId lấy từ JWT (SecurityContext) — tránh IDOR, sinh viên không thể xem lịch sử người khác.
     */
    @Operation(summary = "Xem lịch sử của tôi", description = "Dành cho Sinh viên xem lịch sử ra vào của chính mình")
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<PageResponse<AccessHistory>> getMyHistory(
            @AuthenticationPrincipal UserAccount currentUser,
            Pageable pageable) {
        if (currentUser.getStudent() == null) {
            throw new AppException(ErrorCode.FORBIDDEN, "Tài khoản chưa được liên kết với hồ sơ sinh viên.");
        }
        UUID studentId = currentUser.getStudent().getStudentId();
        Page<AccessHistory> page = accessHistoryRepository.findByStudentId(studentId, pageable);
        return ApiResponse.success("Lấy lịch sử của tôi thành công", PageResponse.of(page));
    }

    /**
     * ADMIN/STAFF: Xem lịch sử ra vào theo Gate ID.
     */
    @Operation(summary = "Xem lịch sử theo cổng", description = "Dành cho Admin/Staff tra cứu lịch sử ra vào tại một cổng (Gate) cụ thể")
    @GetMapping("/gate/{gateId}")
    @PreAuthorize(SmartAccessPermissions.VIEW_ACCESS_HISTORY)
    public ApiResponse<PageResponse<AccessHistory>> getHistoryByGate(
            @PathVariable UUID gateId,
            Pageable pageable) {
        Page<AccessHistory> page = accessHistoryRepository.findByGateId(gateId, pageable);
        return ApiResponse.success("Lấy lịch sử theo cổng thành công", PageResponse.of(page));
    }

    /**
     * ADMIN/STAFF: Xem lịch sử ra vào theo Building ID.
     */
    @Operation(summary = "Xem lịch sử theo tòa nhà", description = "Dành cho Admin/Staff tra cứu lịch sử ra vào tại một tòa nhà cụ thể")
    @GetMapping("/building/{buildingId}")
    @PreAuthorize(SmartAccessPermissions.VIEW_ACCESS_HISTORY)
    public ApiResponse<PageResponse<AccessHistory>> getHistoryByBuilding(
            @PathVariable UUID buildingId,
            Pageable pageable) {
        Page<AccessHistory> page = accessHistoryRepository.findByBuildingId(buildingId, pageable);
        return ApiResponse.success("Lấy lịch sử theo tòa nhà thành công", PageResponse.of(page));
    }

    @Operation(summary = "Lấy danh sách sinh viên đang ở ngoài", description = "Lấy đích danh các sinh viên chưa về KTX (hiện đang OUT)")
    @GetMapping("/outside")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ApiResponse<java.util.List<com.sdms.backend.modules.smartaccess.api.dto.response.OutsideStudentDto>> getOutsideStudents() {
        java.util.List<Object[]> rawList = accessHistoryRepository.findOccupiedStudentsCurrentlyOutside();
        java.util.List<com.sdms.backend.modules.smartaccess.api.dto.response.OutsideStudentDto> result = new java.util.ArrayList<>();
        for (Object[] row : rawList) {
            result.add(com.sdms.backend.modules.smartaccess.api.dto.response.OutsideStudentDto.builder()
                .studentId(java.util.UUID.fromString((String) row[0]))
                .studentName((String) row[1])
                .studentCode((String) row[2])
                .roomCode((String) row[3])
                .buildingName((String) row[4])
                .lastOutTime(((java.sql.Timestamp) row[5]).toLocalDateTime())
                .build());
        }
        return ApiResponse.success("Lấy danh sách sinh viên chưa về thành công", result);
    }
}

