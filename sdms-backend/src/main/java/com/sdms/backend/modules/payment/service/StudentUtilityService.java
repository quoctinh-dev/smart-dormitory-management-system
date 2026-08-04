package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.payment.dto.response.StudentUtilityResponse;
import com.sdms.backend.modules.payment.entity.UtilityUsage;
import com.sdms.backend.modules.payment.repository.UtilityUsageRepository;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentUtilityService {

    private final UtilityUsageRepository utilityUsageRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;

    public List<StudentUtilityResponse> getMyRoomUtilities() {
        UserAccount currentUser = getCurrentUserAccount();
        UUID studentId = currentUser.getStudent().getStudentId();

        StudentHousingAssignment assignment = assignmentRepository
                .findByStudent_StudentIdAndStatus(studentId, AssignmentStatus.OCCUPIED)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hợp đồng lưu trú hoặc phòng ở hiện hành"));

        UUID roomId = assignment.getBed().getRoom().getRoomId();

        List<UtilityUsage> usages = utilityUsageRepository.findTop24ByRoomIdOrderByYearDescMonthDesc(roomId);
        
        return usages.stream()
                .map(u -> StudentUtilityResponse.builder()
                        .utilityUsageId(u.getId())
                        .roomId(u.getRoomId())
                        .utilityType(u.getUtilityType())
                        .month(u.getMonth())
                        .year(u.getYear())
                        .oldReading(u.getOldReading())
                        .newReading(u.getNewReading())
                        .totalUsage(u.getTotalUsage())
                        .isSettled(u.getIsSettled())
                        .readingDate(u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate() : null)
                        .build())
                .collect(Collectors.toList());
    }

    private UserAccount getCurrentUserAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount)) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Người dùng chưa đăng nhập");
        }
        return (UserAccount) authentication.getPrincipal();
    }
}
