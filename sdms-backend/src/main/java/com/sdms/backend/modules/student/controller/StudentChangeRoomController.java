package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.student.dto.ChangeRoomResponseDto;
import com.sdms.backend.modules.student.dto.ChangeRoomSubmitDto;
import com.sdms.backend.modules.student.service.ChangeRoomService;
import com.sdms.backend.modules.user.entity.UserAccount;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/change-room")
@RequiredArgsConstructor
@Tag(name = "Student Change Room", description = "API quản lý đơn xin đổi phòng (dành cho Sinh viên)")
public class StudentChangeRoomController {

    private final ChangeRoomService changeRoomService;

    @Operation(summary = "Gửi yêu cầu đổi phòng", description = "Sinh viên tạo và nộp yêu cầu xin đổi phòng")
    @PostMapping
    public ApiResponse<ChangeRoomResponseDto> submitRequest(
            Authentication authentication,
            @Valid @RequestBody ChangeRoomSubmitDto dto) {
        
        UserAccount userAccount = (UserAccount) authentication.getPrincipal();
        if (userAccount.getStudent() == null) {
            return new ApiResponse<>(false, "Không tìm thấy hồ sơ sinh viên", null, "RESOURCE_NOT_FOUND");
        }
        UUID studentId = userAccount.getStudent().getStudentId();
        
        ChangeRoomResponseDto response = changeRoomService.submitRequest(studentId, dto);
        return ApiResponse.success("Gửi yêu cầu đổi phòng thành công", response);
    }

    @Operation(summary = "Lấy danh sách yêu cầu của tôi", description = "Lấy tất cả yêu cầu đổi phòng mà sinh viên đã nộp")
    @GetMapping
    public ApiResponse<List<ChangeRoomResponseDto>> getMyRequests(
            Authentication authentication) {
        
        UserAccount userAccount = (UserAccount) authentication.getPrincipal();
        if (userAccount.getStudent() == null) {
            return ApiResponse.success("Lấy danh sách thành công", java.util.Collections.emptyList());
        }
        UUID studentId = userAccount.getStudent().getStudentId();
        
        List<ChangeRoomResponseDto> responses = changeRoomService.getStudentRequests(studentId);
        return ApiResponse.success("Lấy danh sách thành công", responses);
    }
}
