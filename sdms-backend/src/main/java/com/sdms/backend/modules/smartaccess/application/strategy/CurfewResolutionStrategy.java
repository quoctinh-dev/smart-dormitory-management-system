package com.sdms.backend.modules.smartaccess.application.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.sdms.backend.modules.smartaccess.domain.entity.CurfewPolicy;
import com.sdms.backend.modules.smartaccess.domain.repository.CurfewPolicyRepository;

import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CurfewResolutionStrategy {

    private final CurfewPolicyRepository curfewPolicyRepository;

    public boolean isAllowed(UUID buildingId, LocalTime currentTime) {
        List<CurfewPolicy> activePolicies = curfewPolicyRepository.findByBuildingIdAndIsActiveTrue(buildingId);
        
        if (activePolicies.isEmpty()) {
            return true; // No curfew defined, default allow
        }

        // Configuration-driven resolution: highest priority dictates outcome
        Optional<CurfewPolicy> highestPriorityPolicy = activePolicies.stream()
                .max(Comparator.comparingInt(CurfewPolicy::getPriority));

        if (highestPriorityPolicy.isPresent()) {
            CurfewPolicy policy = highestPriorityPolicy.get();
            return !isTimeInWindow(currentTime, policy.getStartTime(), policy.getEndTime());
        }

        return true;
    }

    private boolean isTimeInWindow(LocalTime currentTime, LocalTime start, LocalTime end) {
        if (start.isBefore(end)) {
            return currentTime.isAfter(start) && currentTime.isBefore(end);
        } else {
            // Support for Overnight Windows (e.g., 22:00 -> 05:00)
            return currentTime.isAfter(start) || currentTime.isBefore(end);
        }
    }
}
