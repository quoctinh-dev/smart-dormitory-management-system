package com.sdms.backend.modules.smartaccess.application.strategy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.sdms.backend.modules.smartaccess.domain.entity.CurfewPolicy;
import com.sdms.backend.modules.smartaccess.domain.repository.CurfewPolicyRepository;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CurfewResolutionStrategyTest {

    @Mock
    private CurfewPolicyRepository repository;

    @InjectMocks
    private CurfewResolutionStrategy strategy;

    @Test
    void shouldResolveHighestPriorityAndAllowOutsideCurfew() {
        UUID buildingId = UUID.randomUUID();
        // Weekday curfew 23:00 -> 05:00 (Priority 10)
        CurfewPolicy weekday = CurfewPolicy.builder().priority(10).startTime(LocalTime.of(23, 0)).endTime(LocalTime.of(5, 0)).build();
        // Holiday extended curfew 01:00 -> 04:00 (Priority 80)
        CurfewPolicy holiday = CurfewPolicy.builder().priority(80).startTime(LocalTime.of(1, 0)).endTime(LocalTime.of(4, 0)).build(); 
        
        when(repository.findByBuildingIdAndIsActiveTrue(buildingId)).thenReturn(List.of(weekday, holiday));

        // Evaluation time: 00:30. 
        // Under weekday rules this is a violation. Under holiday rules it is allowed.
        // Highest priority wins (Holiday > Weekday) -> Output should be True
        boolean allowed = strategy.isAllowed(buildingId, LocalTime.of(0, 30));
        assertTrue(allowed, "Holiday priority 80 should override weekday priority 10");
    }

    @Test
    void shouldDenyIfInsideOvernightCurfew() {
        UUID buildingId = UUID.randomUUID();
        CurfewPolicy overnight = CurfewPolicy.builder().priority(50).startTime(LocalTime.of(22, 0)).endTime(LocalTime.of(5, 0)).build();
        
        when(repository.findByBuildingIdAndIsActiveTrue(buildingId)).thenReturn(List.of(overnight));

        // Evaluation time: 23:00 -> Should fail overnight window calculation
        boolean allowed = strategy.isAllowed(buildingId, LocalTime.of(23, 0));
        assertFalse(allowed, "Should deny access during active overnight curfew");
    }
}
