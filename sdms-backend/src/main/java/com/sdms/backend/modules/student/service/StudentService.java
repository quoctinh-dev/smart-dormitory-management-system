package com.sdms.backend.modules.student.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.student.dto.request.UpdateProfileRequest;
import com.sdms.backend.modules.student.dto.response.StudentProfileResponse;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.repository.StudentRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Mục tiêu/Nghiệp vụ: Quản lý thông tin hồ sơ cá nhân (Profile) của cư dân (Sinh viên) đã được duyệt và cấp tài khoản, phục vụ cho quá trình sinh hoạt nội trú tại KTX.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Cập nhật thông tin qua cơ chế PATCH (chỉ update các trường có dữ liệu) thay vì PUT (ghi đè toàn bộ). Lấy thông tin sinh viên hiện hành trực tiếp từ SecurityContextHolder của Spring Security.
 * Lưu ý Kiến thức (Dành cho phản biện): Tại sao lấy thông tin từ SecurityContextHolder thay vì bắt Frontend truyền studentId: Đây là cơ chế bảo mật quan trọng để chống lỗ hổng IDOR (Insecure Direct Object Reference). Việc lấy thông tin từ JWT Token giải mã tại backend đảm bảo sinh viên A không thể tùy tiện cập nhật profile của sinh viên B bằng cách chặn bắt và thay đổi ID trên request.
 */
import org.springframework.context.ApplicationEventPublisher;
import com.sdms.backend.modules.student.event.StudentRfidAssignedEvent;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final UserAccountRepository userAccountRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public StudentProfileResponse getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserAccount account = (UserAccount) authentication.getPrincipal();

        if (account.getStudent() == null) {
            return null;
        }

        Student student = studentRepository.findById(account.getStudent().getStudentId()).orElse(null);
        if (student == null) {
            return null;
        }

        return StudentProfileResponse.fromEntity(student);
    }

    @Transactional
    public StudentProfileResponse updateMyProfile(UpdateProfileRequest request) {
        // Lấy thông tin user hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserAccount account = (UserAccount) authentication.getPrincipal();

        Student student = account.getStudent();
        if (student == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ sinh viên");
        }

        // Cập nhật các trường thông tin nếu có dữ liệu trong request
        if (request.getPhone() != null) student.setPhone(request.getPhone());
        if (request.getFatherName() != null) student.setFatherName(request.getFatherName());
        if (request.getFatherPhone() != null) student.setFatherPhone(request.getFatherPhone());
        if (request.getMotherName() != null) student.setMotherName(request.getMotherName());
        if (request.getMotherPhone() != null) student.setMotherPhone(request.getMotherPhone());
        if (request.getEmergencyContact() != null) student.setEmergencyContact(request.getEmergencyContact());
        if (request.getPermanentAddress() != null) student.setPermanentAddress(request.getPermanentAddress());
        if (request.getAvatarUrl() != null) student.setAvatarUrl(request.getAvatarUrl());

        // Save vào DB
        Student updatedStudent = studentRepository.save(student);

        // Map sang DTO và return
        return StudentProfileResponse.fromEntity(updatedStudent);
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getStudentProfileById(java.util.UUID studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy sinh viên"));
        return StudentProfileResponse.fromEntity(student);
    }

    @Transactional
    public void assignRfidCode(java.util.UUID studentId, String rfidCode) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy sinh viên"));
        
        student.setRfidCode(rfidCode);
        studentRepository.save(student);
        
        eventPublisher.publishEvent(new StudentRfidAssignedEvent(this, studentId, rfidCode));
    }
}