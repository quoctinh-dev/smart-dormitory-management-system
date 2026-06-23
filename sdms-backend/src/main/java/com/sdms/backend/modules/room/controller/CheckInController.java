package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import com.sdms.backend.modules.application.entity.VerificationDocument;
import com.sdms.backend.modules.application.enums.VerificationDocumentType;
import com.sdms.backend.modules.application.repository.VerificationDocumentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/check-in")
@RequiredArgsConstructor
@Tag(name = "Check-In Management", description = "API quản lý thủ tục nhận phòng cho Lễ tân KTX")
public class CheckInController {

    private final HousingAssignmentService assignmentService;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final VerificationDocumentRepository documentRepository;

    @Operation(summary = "Tra cứu thông tin nhận phòng bằng CCCD")
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchAssignmentForCheckIn(@RequestParam String cccd) {
        log.info("Admin searching for pending check-in with CCCD: {}", cccd);

        // Tìm kiếm assignment ở trạng thái PENDING_CHECKIN
        Optional<StudentHousingAssignment> assignmentOpt = assignmentRepository.findByStudent_CccdAndStatus(cccd.trim(), AssignmentStatus.PENDING_CHECKIN);

        if (assignmentOpt.isEmpty()) {
            // Có thể sinh viên chưa đóng tiền (RESERVED) hoặc đã nhận phòng (OCCUPIED)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "Không tìm thấy hồ sơ chờ nhận phòng cho CCCD này. Có thể sinh viên chưa thanh toán hoặc đã nhận phòng rồi.", null));
        }

        StudentHousingAssignment assignment = assignmentOpt.get();

        // Lấy ảnh chân dung để lễ tân đối chiếu khuôn mặt
        String portraitUrl = null;
        if (assignment.getApplication() != null) {
            Optional<VerificationDocument> docOpt = documentRepository.findByApplication_ApplicationIdAndDocumentType(
                    assignment.getApplication().getApplicationId(), VerificationDocumentType.PORTRAIT_PHOTO);
            if (docOpt.isPresent()) {
                portraitUrl = docOpt.get().getFileUrl();
            }
        }

        // Đóng gói thông tin trả về Frontend
        Map<String, Object> data = new HashMap<>();
        data.put("assignmentId", assignment.getAssignmentId());
        data.put("studentName", assignment.getStudent().getFullName());
        data.put("studentCode", assignment.getStudent().getStudentCode());
        data.put("cccd", assignment.getStudent().getCccd());
        data.put("gender", assignment.getApplication() != null ? assignment.getApplication().getGender().name() : "N/A");
        
        data.put("buildingName", assignment.getBed().getRoom().getFloor().getBuilding().getName());
        data.put("floorName", "Tầng " + assignment.getBed().getRoom().getFloor().getFloorNumber());
        data.put("roomName", assignment.getBed().getRoom().getRoomCode());
        data.put("bedName", assignment.getBed().getBedCode());
        
        data.put("portraitUrl", portraitUrl);

        return ResponseEntity.ok(ApiResponse.success("Tìm thấy thông tin nhận phòng", data));
    }

    @Operation(summary = "Xác nhận Check-in cho sinh viên")
    @PostMapping("/{assignmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> processCheckIn(@PathVariable UUID assignmentId) {
        log.info("Admin processing check-in for assignment: {}", assignmentId);
        
        // Gọi hàm cốt lõi để chuyển trạng thái Assignment sang OCCUPIED, kích hoạt Student thành ACTIVE
        assignmentService.checkIn(assignmentId);

        return ResponseEntity.ok(ApiResponse.success("Đã hoàn tất thủ tục nhận phòng cho sinh viên!", null));
    }
}
