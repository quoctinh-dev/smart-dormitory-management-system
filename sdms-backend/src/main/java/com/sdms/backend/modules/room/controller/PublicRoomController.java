package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/public/room")
@RequiredArgsConstructor
public class PublicRoomController {

    private final StudentHousingAssignmentRepository assignmentRepository;

    @GetMapping("/assignment/{applicationId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAssignmentByApplicationId(@PathVariable UUID applicationId) {
        List<StudentHousingAssignment> assignments = assignmentRepository.findByApplication_ApplicationId(applicationId);
        
        if (assignments.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "Chưa được cấp phòng", null));
        }

        StudentHousingAssignment assignment = assignments.get(0);
        
        Map<String, Object> data = new HashMap<>();
        data.put("assignmentId", assignment.getAssignmentId());
        data.put("status", assignment.getStatus());
        
        if (assignment.getBed() != null) {
            data.put("bedName", assignment.getBed().getBedCode());
            if (assignment.getBed().getRoom() != null) {
                data.put("roomName", assignment.getBed().getRoom().getRoomCode());
                if (assignment.getBed().getRoom().getFloor() != null) {
                    data.put("floorName", "Tầng " + assignment.getBed().getRoom().getFloor().getFloorNumber());
                    if (assignment.getBed().getRoom().getFloor().getBuilding() != null) {
                        data.put("buildingName", assignment.getBed().getRoom().getFloor().getBuilding().getName());
                    }
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin xếp phòng thành công", data));
    }
}
