package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.response.RoomResponse;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.repository.RoomRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/v1/student/rooms")
@RequiredArgsConstructor
@Tag(name = "Student Rooms", description = "API lấy danh sách phòng (Sinh viên)")
public class RoomStudentController {

    private final RoomRepository roomRepository;
    private final com.sdms.backend.modules.student.repository.StudentRepository studentRepository;

    @Operation(summary = "Lấy danh sách phòng trống", description = "Trả về danh sách các phòng khả dụng (có giường trống)")
    @GetMapping("/available")
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional(readOnly = true)
    public ApiResponse<List<RoomResponse>> getAvailableRooms(org.springframework.security.core.Authentication authentication) {
        com.sdms.backend.modules.user.entity.UserAccount account = (com.sdms.backend.modules.user.entity.UserAccount) authentication.getPrincipal();
        if (account.getStudent() == null) {
            return ApiResponse.success("Lấy danh sách phòng trống thành công", java.util.Collections.emptyList());
        }
        
        com.sdms.backend.modules.student.entity.Student student = studentRepository.findById(account.getStudent().getStudentId()).orElse(null);
        if (student == null || student.getSourceApplication() == null) {
            return ApiResponse.success("Lấy danh sách phòng trống thành công", java.util.Collections.emptyList());
        }
        
        com.sdms.backend.common.enums.Gender studentGender = student.getSourceApplication().getGender();
        com.sdms.backend.modules.room.enums.BuildingGender buildingGender = 
            studentGender == com.sdms.backend.common.enums.Gender.MALE ? 
                com.sdms.backend.modules.room.enums.BuildingGender.MALE : 
                com.sdms.backend.modules.room.enums.BuildingGender.FEMALE;

        List<RoomResponse> availableRooms = roomRepository.findAvailableRoomsByGender(studentGender, buildingGender, RoomStatus.AVAILABLE).stream()
                .filter(room -> (room.getCapacity() - room.getOccupiedBeds()) > 0)
                .map(room -> RoomResponse.builder()
                        .roomId(room.getRoomId())
                        .roomCode(room.getRoomCode())
                        .buildingName(room.getFloor().getBuilding().getName())
                        .floorNumber(room.getFloor().getFloorNumber())
                        .capacity(room.getCapacity())
                        .occupiedBeds(room.getOccupiedBeds())
                        .availableBeds(room.getCapacity() - room.getOccupiedBeds())
                        .status(room.getStatus())
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.success("Lấy danh sách phòng trống thành công", availableRooms);
    }
}
