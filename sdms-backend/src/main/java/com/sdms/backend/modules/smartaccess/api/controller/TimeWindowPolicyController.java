package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.domain.entity.TimeWindowPolicy;
import com.sdms.backend.modules.smartaccess.domain.repository.TimeWindowPolicyRepository;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access/time-window-policies")
@RequiredArgsConstructor
public class TimeWindowPolicyController {

    private final TimeWindowPolicyRepository timeWindowPolicyRepository;

    @PostMapping
    @PreAuthorize(SmartAccessPermissions.MANAGE_TIME_WINDOW_POLICY)
    public ResponseEntity<TimeWindowPolicy> createPolicy(@RequestBody TimeWindowPolicy policy) {
        return ResponseEntity.ok(timeWindowPolicyRepository.save(policy));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize(SmartAccessPermissions.MANAGE_TIME_WINDOW_POLICY)
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam boolean isActive) {
        timeWindowPolicyRepository.findById(id).ifPresent(p -> {
            p.setIsActive(isActive);
            timeWindowPolicyRepository.save(p);
        });
        return ResponseEntity.noContent().build();
    }
}
