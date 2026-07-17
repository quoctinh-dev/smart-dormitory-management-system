package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/student/room-result")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
@Tag(name = "Kết quả xếp phòng (Public)", description = "API cho sinh viên xem kết quả xếp phòng của mình")
public class PublicRoomController {

    private final StudentHousingAssignmentRepository assignmentRepository;

    @Operation(summary = "Xem kết quả xếp phòng", description = "Xem kết quả xếp phòng thông qua mã đơn đăng ký (Application ID)")
    @GetMapping("/assignment/{applicationId}")
    public ApiResponse<Map<String, Object>> getAssignmentByApplicationId(@PathVariable UUID applicationId) {
        Optional<StudentHousingAssignment> assignmentOpt = assignmentRepository.findByApplication_ApplicationId(applicationId);
        
        if (assignmentOpt.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Chưa được cấp phòng hoặc không tìm thấy đơn đăng ký này.");
        }

        StudentHousingAssignment assignment = assignmentOpt.get();
        
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

        return ApiResponse.success("Lấy thông tin xếp phòng thành công", data);
    }
}
