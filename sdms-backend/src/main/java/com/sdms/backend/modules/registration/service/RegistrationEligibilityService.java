package com.sdms.backend.modules.registration.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.registration.dto.response.EligibilityImportResponse;
import com.sdms.backend.modules.registration.dto.response.EligibilityResponse;
import com.sdms.backend.modules.registration.entity.RegistrationEligibility;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.enums.RegistrationType;
import com.sdms.backend.modules.registration.repository.RegistrationEligibilityRepository;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationEligibilityService {

    private final RegistrationPeriodRepository periodRepository;
    private final RegistrationEligibilityRepository eligibilityRepository;

    /**
     * STEP 5 - Import danh sách từ Excel
     */
    public EligibilityImportResponse importEligibility(UUID periodId, MultipartFile file) throws IOException {
        // 1. Kiểm tra file
        if (file.isEmpty()) {
            throw new AppException("File không được để trống", HttpStatus.BAD_REQUEST);
        }
        if (file.getOriginalFilename() != null && !file.getOriginalFilename().endsWith(".xlsx")) {
            throw new AppException("Chỉ chấp nhận file định dạng .xlsx", HttpStatus.BAD_REQUEST);
        }

        // 2. Kiểm tra đợt đăng ký
        RegistrationPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new AppException("Không tìm thấy đợt đăng ký", HttpStatus.NOT_FOUND));

        if (period.getRegistrationType() == RegistrationType.OPEN_REGISTRATION) {
            throw new AppException("Đợt đăng ký tự do không cần import danh sách", HttpStatus.BAD_REQUEST);
        }

        List<RegistrationEligibility> newEligibilities = new ArrayList<>();
        int total = 0, imported = 0, skipped = 0;

        // 3. Đọc Excel
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                total++;

                String cccd = getCellValue(row.getCell(0));
                String fullName = getCellValue(row.getCell(1));

                // 4. Validate & Skip nếu trùng
                if (cccd.isEmpty() || eligibilityRepository.existsByRegistrationPeriod_PeriodIdAndCccd(periodId, cccd)) {
                    skipped++;
                } else {
                    RegistrationEligibility e = new RegistrationEligibility();
                    e.setRegistrationPeriod(period);
                    e.setCccd(cccd);
                    e.setFullName(fullName);
                    newEligibilities.add(e);
                    imported++;
                }
            }
        }

        // 5. Lưu batch
        if (!newEligibilities.isEmpty()) {
            eligibilityRepository.saveAll(newEligibilities);
        }

        return new EligibilityImportResponse(total, imported, skipped);
    }

    /**
     * STEP 7 - Lấy danh sách đủ điều kiện
     */
    @Transactional(readOnly = true)
    public List<EligibilityResponse> getEligibilities(UUID periodId) {
        return eligibilityRepository.findByRegistrationPeriod_PeriodId(periodId)
                .stream()
                .map(e -> new EligibilityResponse(e.getEligibilityId(), e.getCccd(), e.getFullName()))
                .collect(Collectors.toList());
    }

    /**
     * STEP 8 - Xóa bản ghi (Đã thêm logic kiểm tra chéo periodId)
     */
    public void deleteEligibility(UUID periodId, UUID eligibilityId) {
        RegistrationEligibility e = eligibilityRepository.findById(eligibilityId)
                .orElseThrow(() -> new AppException("Không tìm thấy bản ghi cần xóa", HttpStatus.NOT_FOUND));

        // Kiểm tra an toàn: bản ghi phải thuộc đúng đợt đang thao tác
        if (!e.getRegistrationPeriod().getPeriodId().equals(periodId)) {
            throw new AppException("Bản ghi không thuộc về đợt đăng ký này", HttpStatus.BAD_REQUEST);
        }

        eligibilityRepository.delete(e);
    }

    // Helper: Xử lý Cell dữ liệu
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }
        return cell.getStringCellValue().trim();
    }
}