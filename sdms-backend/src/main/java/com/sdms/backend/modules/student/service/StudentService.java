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