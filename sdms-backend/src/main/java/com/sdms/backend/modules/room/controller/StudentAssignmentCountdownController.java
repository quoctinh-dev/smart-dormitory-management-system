package com.sdms.backend.modules.room.controller;

import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/assignments")
@RequiredArgsConstructor
public class StudentAssignmentCountdownController {
    private final StudentHousingAssignmentRepository assignmentRepository;
    
    @GetMapping("/countdown")
    @Cacheable(value = "assignmentCountdown", key = "#assignmentId")
    public ResponseEntity<Map<String, Object>> getCountdown(@RequestParam UUID assignmentId) {
        StudentHousingAssignment assignment = assignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null || assignment.getReservedAt() == null) {
            return ResponseEntity.notFound().build();
        }
        
        LocalDateTime deadline = assignment.getReservedAt().plusDays(3);
        Duration duration = Duration.between(LocalDateTime.now(), deadline);
        long hoursLeft = duration.toHours();
        
        Map<String, Object> response = new HashMap<>();
        response.put("deadline", deadline);
        response.put("hoursLeft", hoursLeft);
        if (hoursLeft <= 0) {
            response.put("status", "EXPIRED");
            response.put("message", "QuÃ¡ háº¡n thanh toÃ¡n giá»¯ chá»—, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng há»§y.");
        } else {
            response.put("status", "ACTIVE");
            response.put("message", "Vui lÃ²ng thanh toÃ¡n trÆ°á»›c háº¡n chÃ³t.");
        }
        
        return ResponseEntity.ok(response);
    }
}
