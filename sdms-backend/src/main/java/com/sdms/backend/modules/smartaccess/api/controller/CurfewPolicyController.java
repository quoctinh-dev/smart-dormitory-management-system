package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.domain.entity.CurfewPolicy;
import com.sdms.backend.modules.smartaccess.domain.repository.CurfewPolicyRepository;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access/curfew-policies")
@RequiredArgsConstructor
public class CurfewPolicyController {

    private final CurfewPolicyRepository curfewPolicyRepository;

    @PostMapping
    @PreAuthorize(SmartAccessPermissions.MANAGE_CURFEW_POLICY)
    public ResponseEntity<CurfewPolicy> createPolicy(@RequestBody CurfewPolicy policy) {
        return ResponseEntity.ok(curfewPolicyRepository.save(policy));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize(SmartAccessPermissions.MANAGE_CURFEW_POLICY)
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam boolean isActive) {
        curfewPolicyRepository.findById(id).ifPresent(p -> {
            p.setIsActive(isActive);
            curfewPolicyRepository.save(p);
        });
        return ResponseEntity.noContent().build();
    }
}
