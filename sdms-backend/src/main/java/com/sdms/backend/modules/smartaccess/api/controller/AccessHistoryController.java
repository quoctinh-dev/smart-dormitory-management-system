package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access/history")
@RequiredArgsConstructor
public class AccessHistoryController {

    private final AccessHistoryRepository accessHistoryRepository;

    @GetMapping
    @PreAuthorize(SmartAccessPermissions.VIEW_ACCESS_HISTORY)
    public ResponseEntity<Page<AccessHistory>> getAllHistory(Pageable pageable) {
        // Enforces pagination to protect memory
        return ResponseEntity.ok(accessHistoryRepository.findAll(pageable));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize(SmartAccessPermissions.VIEW_ACCESS_HISTORY)
    public ResponseEntity<Page<AccessHistory>> getHistoryByStudent(@PathVariable UUID studentId, Pageable pageable) {
        return ResponseEntity.ok(accessHistoryRepository.findByStudentId(studentId, pageable));
    }
}
