package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.student.dto.ChangeRoomResponseDto;
import com.sdms.backend.modules.student.dto.ChangeRoomSubmitDto;
import com.sdms.backend.modules.student.service.ChangeRoomService;
import com.sdms.backend.modules.user.entity.UserAccount;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/change-room")
@RequiredArgsConstructor
public class StudentChangeRoomController {

    private final ChangeRoomService changeRoomService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChangeRoomResponseDto>> submitRequest(
            Authentication authentication,
            @Valid @RequestBody ChangeRoomSubmitDto dto) {
        
        UserAccount userAccount = (UserAccount) authentication.getPrincipal();
        UUID studentId = userAccount.getStudent().getStudentId();
        
        ChangeRoomResponseDto response = changeRoomService.submitRequest(studentId, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Gửi yêu cầu đổi phòng thành công", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChangeRoomResponseDto>>> getMyRequests(
            Authentication authentication) {
        
        UserAccount userAccount = (UserAccount) authentication.getPrincipal();
        UUID studentId = userAccount.getStudent().getStudentId();
        
        List<ChangeRoomResponseDto> responses = changeRoomService.getStudentRequests(studentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thành công", responses));
    }
}
