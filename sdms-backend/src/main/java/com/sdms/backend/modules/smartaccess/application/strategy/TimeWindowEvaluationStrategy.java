package com.sdms.backend.modules.smartaccess.application.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.sdms.backend.modules.smartaccess.domain.entity.TimeWindowPolicy;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;
import com.sdms.backend.modules.smartaccess.domain.repository.TimeWindowPolicyRepository;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TimeWindowEvaluationStrategy {

    private final TimeWindowPolicyRepository timeWindowPolicyRepository;

    public boolean isAllowed(UUID buildingId, ResidentType residentType, LocalTime currentTime) {
        List<TimeWindowPolicy> policies = timeWindowPolicyRepository
                .findByBuildingIdAndResidentTypeAndIsActiveTrue(buildingId, residentType);

        if (policies.isEmpty()) {
            return false; // Fail Closed: If no window defined, deny access.
        }

        return policies.stream().anyMatch(policy -> isTimeInWindow(currentTime, policy.getStartTime(), policy.getEndTime()));
    }

    private boolean isTimeInWindow(LocalTime currentTime, LocalTime start, LocalTime end) {
        if (start.isBefore(end)) {
            return !currentTime.isBefore(start) && !currentTime.isAfter(end);
        } else {
            // Support for Overnight Windows
            return !currentTime.isBefore(start) || !currentTime.isAfter(end);
        }
    }
}
