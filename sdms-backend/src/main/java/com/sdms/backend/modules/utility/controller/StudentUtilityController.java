package com.sdms.backend.modules.utility.controller;

import com.sdms.backend.modules.utility.entity.ElectricityUsage;
import com.sdms.backend.modules.utility.repository.ElectricityUsageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/v1/student/utility")
@RequiredArgsConstructor
public class StudentUtilityController {
    private final ElectricityUsageRepository electricityUsageRepository;
    
    @GetMapping("/electricity-warning")
    @Cacheable(value = "studentElectricityWarning", key = "#roomId")
    public ResponseEntity<Map<String, Object>> getElectricityWarning(@RequestParam UUID roomId) {
        ElectricityUsage usage = electricityUsageRepository.findTopByRoomIdOrderByYearDescMonthDesc(roomId).orElse(null);
        if (usage == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<ElectricityUsage> allUsages = electricityUsageRepository.findAll();
        double avgKwh = allUsages.stream().mapToInt(ElectricityUsage::getTotalKwh).average().orElse(0);
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalKwh", usage.getTotalKwh());
        response.put("averageKwh", avgKwh);
        
        if (usage.getTotalKwh() > avgKwh * 1.2) {
            response.put("warning", "PhÃ²ng cá»§a báº¡n Ä‘ang tiÃªu thá»¥ Ä‘iá»‡n vÆ°á»£t quÃ¡ 120% má»©c trung bÃ¬nh há»‡ thá»‘ng. HÃ£y chÃº Ã½ tiáº¿t kiá»‡m Ä‘iá»‡n!");
        }
        
        return ResponseEntity.ok(response);
    }
}
