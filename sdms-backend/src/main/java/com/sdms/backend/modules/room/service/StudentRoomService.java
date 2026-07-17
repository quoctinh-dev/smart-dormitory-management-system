package com.sdms.backend.modules.room.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.room.dto.response.CurrentRoomResponse;
import com.sdms.backend.modules.room.entity.*;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentRoomService {

    private final StudentHousingAssignmentRepository assignmentRepository;

    /**
     * Lấy thông tin phòng hiện tại của sinh viên đang đăng nhập.
     * Dữ liệu được đảm bảo an toàn nhờ SecurityContext.
     */
    public CurrentRoomResponse getCurrentRoom() {
        // 1. Lấy thông tin User từ SecurityContext (đã được xác thực qua JwtAuthenticationFilter)
        UserAccount currentUser = getCurrentUserAccount();

        // 2. Giả định UserAccount có liên kết với StudentId
        // Nếu UserAccount chưa có studentId trực tiếp, cần fetch qua StudentRepository
        UUID studentId = currentUser.getStudent().getStudentId();

        // 3. Truy vấn Assignment theo status OCCUPIED (nguồn sự thật)
        StudentHousingAssignment assignment = assignmentRepository
                .findByStudent_StudentIdAndStatus(studentId, AssignmentStatus.OCCUPIED)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hợp đồng lưu trú hoặc phòng ở hiện hành"));

        // 4. Map dữ liệu hạ tầng (Assignment -> Bed -> Room -> Floor -> Building)
        Bed bed = assignment.getBed();
        Room room = bed.getRoom();
        Floor floor = room.getFloor();
        Building building = floor.getBuilding();

        return CurrentRoomResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .buildingCode(building.getCode())
                .buildingName(building.getName())
                .floorNumber(floor.getFloorNumber())
                .roomCode(room.getRoomCode())
                .roomStatus(room.getStatus())
                .bedCode(bed.getBedCode())
                .bedStatus(bed.getStatus())
                .assignmentStatus(assignment.getStatus())
                .checkInAt(assignment.getCheckInAt())
                .expectedCheckOutAt(assignment.getExpectedCheckOutAt())
                .build();
    }

    /**
     * Helper lấy thông tin UserAccount từ SecurityContext.
     */
    private UserAccount getCurrentUserAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount)) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Người dùng chưa đăng nhập");
        }
        return (UserAccount) authentication.getPrincipal();
    }
}