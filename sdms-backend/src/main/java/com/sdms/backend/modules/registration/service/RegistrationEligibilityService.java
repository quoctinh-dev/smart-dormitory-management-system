package com.sdms.backend.modules.registration.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.registration.dto.response.EligibilityImportResponse;
import com.sdms.backend.modules.registration.dto.response.EligibilityResponse;
import com.sdms.backend.modules.registration.entity.RegistrationEligibility;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.enums.RegistrationType;
import com.sdms.backend.modules.registration.enums.RegistrationTarget;
import com.sdms.backend.modules.registration.repository.RegistrationEligibilityRepository;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationEligibilityService {

    private final RegistrationPeriodRepository periodRepository;
    private final RegistrationEligibilityRepository eligibilityRepository;
    private final DataFormatter dataFormatter = new DataFormatter();

    /**
     * Import danh sách từ Excel (Có Transaction bảo vệ toàn vẹn dữ liệu)
     */
    @Transactional
    public EligibilityImportResponse importEligibility(UUID periodId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "File không được để trống");
        }
        if (file.getOriginalFilename() != null && !file.getOriginalFilename().endsWith(".xlsx")) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ chấp nhận file định dạng .xlsx");
        }

        RegistrationPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đợt đăng ký"));

        if (period.getRegistrationType() == RegistrationType.OPEN_REGISTRATION) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Đợt đăng ký tự do không cần import danh sách");
        }

        Set<String> existingStudentCodes = eligibilityRepository.findStudentCodeByRegistrationPeriod_PeriodId(periodId);
        List<RegistrationEligibility> newEligibilities = new ArrayList<>();

        int total = 0, imported = 0, skipped = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String cccd = getCellValue(row.getCell(0));
                String fullName = getCellValue(row.getCell(1));
                String studentCode = getCellValue(row.getCell(2));
                String email = getCellValue(row.getCell(3));
                String targetStr = getCellValue(row.getCell(4));

                // Bỏ qua nếu dòng hoàn toàn trống để tránh tăng biến "total" ảo
                if (studentCode.isEmpty() && email.isEmpty()) continue;

                total++; // Tăng total dựa trên dòng có dữ liệu thực tế

                if (studentCode.isEmpty() || email.isEmpty() || existingStudentCodes.contains(studentCode)) {
                    skipped++;
                } else {
                    RegistrationEligibility e = new RegistrationEligibility();
                    e.setRegistrationPeriod(period);
                    if (!cccd.isEmpty()) e.setCccd(cccd);
                    e.setFullName(fullName);
                    e.setStudentCode(studentCode);
                    e.setEmail(email);

                    // Map Enum sạch sẽ bằng cách tận dụng biến import cụ thể
                    e.setTarget(RegistrationTarget.FRESHMAN);
                    if (!targetStr.isEmpty()) {
                        try {
                            e.setTarget(RegistrationTarget.valueOf(targetStr.toUpperCase().trim()));
                        } catch (IllegalArgumentException ex) {
                            // Giữ nguyên mặc định FRESHMAN khi gõ sai
                        }
                    }

                    newEligibilities.add(e);
                    existingStudentCodes.add(studentCode); // Chống trùng lặp nội bộ trong file
                    imported++;
                }
            }
        }

        if (!newEligibilities.isEmpty()) {
            eligibilityRepository.saveAll(newEligibilities);
        }

        return new EligibilityImportResponse(total, imported, skipped);
    }

    /**
     * Xem danh sách phân trang (ReadOnly tối ưu kết nối DB)
     */
    @Transactional(readOnly = true)
    public Page<EligibilityResponse> getEligibilities(UUID periodId, Pageable pageable) {
        if (!periodRepository.existsById(periodId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đợt đăng ký");
        }
        return eligibilityRepository.findByRegistrationPeriod_PeriodId(periodId, pageable)
                .map(e -> new EligibilityResponse(e.getEligibilityId(), e.getCccd(), e.getFullName(), e.getStudentCode(), e.getEmail()));
    }

    /**
     * Xóa bản ghi
     */
    @Transactional
    public void deleteEligibility(UUID periodId, UUID eligibilityId) {
        RegistrationEligibility e = eligibilityRepository.findById(eligibilityId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi cần xóa"));

        if (!e.getRegistrationPeriod().getPeriodId().equals(periodId)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Bản ghi không thuộc về đợt đăng ký này");
        }

        eligibilityRepository.delete(e);
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return dataFormatter.formatCellValue(cell).trim();
    }
}