package com.sdms.backend.modules.student.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.student.dto.request.UpdateProfileRequest;
import com.sdms.backend.modules.student.dto.response.StudentProfileResponse;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.repository.StudentRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Mục tiêu/Nghiệp vụ: Quản lý thông tin hồ sơ cá nhân (Profile) của cư dân (Sinh viên) đã được duyệt và cấp tài khoản, phục vụ cho quá trình sinh hoạt nội trú tại KTX.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Cập nhật thông tin qua cơ chế PATCH (chỉ update các trường có dữ liệu) thay vì PUT (ghi đè toàn bộ). Lấy thông tin sinh viên hiện hành trực tiếp từ SecurityContextHolder của Spring Security.
 * Lưu ý Kiến thức (Dành cho phản biện): Tại sao lấy thông tin từ SecurityContextHolder thay vì bắt Frontend truyền studentId: Đây là cơ chế bảo mật quan trọng để chống lỗ hổng IDOR (Insecure Direct Object Reference). Việc lấy thông tin từ JWT Token giải mã tại backend đảm bảo sinh viên A không thể tùy tiện cập nhật profile của sinh viên B bằng cách chặn bắt và thay đổi ID trên request.
 */
@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;

    public StudentProfileResponse getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserAccount account = (UserAccount) authentication.getPrincipal();

        Student student = account.getStudent();

        if (student == null) {
            throw new AppException(
                    "Student profile not found",
                    HttpStatus.NOT_FOUND
            );
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
            throw new AppException("Student profile not found", HttpStatus.NOT_FOUND);
        }

        // Cập nhật từng field nếu request không null (Cơ chế PATCH)
        if (request.getEmail() != null) student.setEmail(request.getEmail());
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
}