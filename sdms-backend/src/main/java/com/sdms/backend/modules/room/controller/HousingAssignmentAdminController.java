package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.response.ActiveAssignmentByBedResponse;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller tra cứu thông tin hợp đồng lưu trú theo Giường.
 * Dùng cho chức năng "Admin Bed Drill-down" trên Interactive Dashboard.
 */
@RestController
@RequestMapping("/api/v1/admin/housing-assignments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Housing Assignment Admin", description = "API tra cứu hợp đồng lưu trú dành cho Admin")
public class HousingAssignmentAdminController {

    private final StudentHousingAssignmentRepository assignmentRepository;

    @Operation(
        summary = "Lấy hợp đồng đang hoạt động theo Giường",
        description = "Tra cứu sinh viên đang ở (RESERVED, PENDING_CHECKIN, OCCUPIED) tại một giường cụ thể."
    )
    @GetMapping("/active/bed/{bedId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<ActiveAssignmentByBedResponse>> getActiveAssignmentByBed(
            @PathVariable UUID bedId
    ) {
        StudentHousingAssignment assignment = assignmentRepository
                .findByBed_BedIdAndStatusIn(
                        bedId,
                        List.of(
                                AssignmentStatus.RESERVED,
                                AssignmentStatus.PENDING_CHECKIN,
                                AssignmentStatus.OCCUPIED
                        )
                )
                .orElseThrow(() -> new AppException(
                        "No active assignment found for this bed",
                        HttpStatus.NOT_FOUND
                ));

        // Map sang DTO — tránh trả về raw Entity
        ActiveAssignmentByBedResponse.StudentSummary studentSummary = null;
        if (assignment.getStudent() != null) {
            var student = assignment.getStudent();
            studentSummary = ActiveAssignmentByBedResponse.StudentSummary.builder()
                    .studentId(student.getStudentId())
                    .studentCode(student.getStudentCode())
                    .fullName(student.getFullName())
                    .email(student.getEmail())
                    .build();
        }

        var bed = assignment.getBed();
        var room = bed.getRoom();
        var building = room.getFloor().getBuilding();

        ActiveAssignmentByBedResponse response = ActiveAssignmentByBedResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .status(assignment.getStatus())
                .reservedAt(assignment.getReservedAt())
                .checkInAt(assignment.getCheckInAt())
                .expectedCheckOutAt(assignment.getExpectedCheckOutAt())
                .student(studentSummary)
                .bedId(bed.getBedId())
                .bedCode(bed.getBedCode())
                .roomCode(room.getRoomCode())
                .buildingName(building.getName())
                .build();
        return ResponseEntity.ok(ApiResponse.success(
                "Active assignment retrieved successfully", response
        ));
    }

    @Operation(summary = "Lấy danh sách Check-in / Hợp đồng lưu trú", description = "Lấy danh sách dùng cho bảng đối soát nhận phòng Web Admin")
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<ActiveAssignmentByBedResponse>>> getHousingAssignments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AssignmentStatus status,
            org.springframework.data.domain.Pageable pageable
    ) {
        org.springframework.data.domain.Page<StudentHousingAssignment> page = assignmentRepository.searchForAudit(status, search, pageable);
        
        org.springframework.data.domain.Page<ActiveAssignmentByBedResponse> dtoPage = page.map(assignment -> {
            ActiveAssignmentByBedResponse.StudentSummary studentSummary = null;
            if (assignment.getStudent() != null) {
                var student = assignment.getStudent();
                studentSummary = ActiveAssignmentByBedResponse.StudentSummary.builder()
                        .studentId(student.getStudentId())
                        .studentCode(student.getStudentCode())
                        .fullName(student.getFullName())
                        .email(student.getEmail())
                        .build();
            }
            var bed = assignment.getBed();
            var room = bed.getRoom();
            var building = room.getFloor().getBuilding();

            return ActiveAssignmentByBedResponse.builder()
                    .assignmentId(assignment.getAssignmentId())
                    .status(assignment.getStatus())
                    .reservedAt(assignment.getReservedAt())
                    .checkInAt(assignment.getCheckInAt())
                    .expectedCheckOutAt(assignment.getExpectedCheckOutAt())
                    .student(studentSummary)
                    .bedId(bed.getBedId())
                    .bedCode(bed.getBedCode())
                    .roomCode(room.getRoomCode())
                    .buildingName(building.getName())
                    .build();
        });

        return ResponseEntity.ok(ApiResponse.success("List retrieved successfully", dtoPage));
    }
}
