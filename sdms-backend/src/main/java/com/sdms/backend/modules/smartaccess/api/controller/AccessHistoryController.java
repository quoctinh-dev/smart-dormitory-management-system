package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.common.exception.AppException;
import org.springframework.http.HttpStatus;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access/history")
@RequiredArgsConstructor
public class AccessHistoryController {

    private final AccessHistoryRepository accessHistoryRepository;

    /**
     * ADMIN/STAFF: Xem toàn bộ lịch sử hệ thống (phân trang).
     */
    @GetMapping
    @PreAuthorize(SmartAccessPermissions.VIEW_ACCESS_HISTORY)
    public ResponseEntity<Page<AccessHistory>> getAllHistory(Pageable pageable) {
        return ResponseEntity.ok(accessHistoryRepository.findAll(pageable));
    }

    /**
     * ADMIN/STAFF: Xem lịch sử ra vào theo studentId bất kỳ.
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize(SmartAccessPermissions.VIEW_ACCESS_HISTORY)
    public ResponseEntity<Page<AccessHistory>> getHistoryByStudent(
            @PathVariable UUID studentId,
            Pageable pageable) {
        return ResponseEntity.ok(accessHistoryRepository.findByStudentId(studentId, pageable));
    }

    /**
     * STUDENT: Xem lịch sử ra vào của chính mình.
     * studentId lấy từ JWT (SecurityContext) — tránh IDOR, sinh viên không thể xem lịch sử người khác.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<AccessHistory>> getMyHistory(
            @AuthenticationPrincipal UserAccount currentUser,
            Pageable pageable) {
        if (currentUser.getStudent() == null) {
            throw new AppException("Tài khoản chưa được liên kết với hồ sơ sinh viên.", HttpStatus.FORBIDDEN);
        }
        UUID studentId = currentUser.getStudent().getStudentId();
        return ResponseEntity.ok(accessHistoryRepository.findByStudentId(studentId, pageable));
    }
}

