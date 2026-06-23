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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationEligibilityService {

    private final RegistrationPeriodRepository periodRepository;
    private final RegistrationEligibilityRepository eligibilityRepository;

    // Đối tượng tối ưu của Apache POI để giữ nguyên định dạng chữ/số (Không mất số 0 ở đầu)
    private final DataFormatter dataFormatter = new DataFormatter();

    /**
     * STEP 5 - Import danh sách từ Excel (Đã tối ưu hóa hiệu năng & định dạng số)
     */
    public EligibilityImportResponse importEligibility(UUID periodId, MultipartFile file) throws IOException {
        // 1. Kiểm tra định dạng file
        if (file.isEmpty()) {
            throw new AppException("File không được để trống", HttpStatus.BAD_REQUEST);
        }
        if (file.getOriginalFilename() != null && !file.getOriginalFilename().endsWith(".xlsx")) {
            throw new AppException("Chỉ chấp nhận file định dạng .xlsx", HttpStatus.BAD_REQUEST);
        }

        // 2. Kiểm tra đợt đăng ký hợp lệ
        RegistrationPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new AppException("Không tìm thấy đợt đăng ký", HttpStatus.NOT_FOUND));

        if (period.getRegistrationType() == RegistrationType.OPEN_REGISTRATION) {
            throw new AppException("Đợt đăng ký tự do không cần import danh sách", HttpStatus.BAD_REQUEST);
        }

        // TỐI ƯU HIỆU NĂNG: Lấy toàn bộ CCCD đã có trong DB của đợt này lên RAM để check trùng nhanh
        // Bạn cần khai báo thêm hàm này trong eligibilityRepository: Set<String> findCccdByRegistrationPeriod_PeriodId(UUID periodId);
        Set<String> existingCccds = eligibilityRepository.findCccdByRegistrationPeriod_PeriodId(periodId);

        List<RegistrationEligibility> newEligibilities = new ArrayList<>();
        int total = 0, imported = 0, skipped = 0;

        // 3. Đọc dữ liệu Excel
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                total++;

                String cccd = getCellValue(row.getCell(0));
                String fullName = getCellValue(row.getCell(1));
                String studentCode = getCellValue(row.getCell(2));
                String email = getCellValue(row.getCell(3));
                String targetStr = getCellValue(row.getCell(4));

                // 4. Validate & Check trùng trực tiếp trên Cache RAM (Khử hoàn toàn lỗi N+1 Queries)
                if (cccd.isEmpty() || existingCccds.contains(cccd)) {
                    skipped++;
                } else {
                    RegistrationEligibility e = new RegistrationEligibility();
                    e.setRegistrationPeriod(period);
                    e.setCccd(cccd);
                    e.setFullName(fullName);

                    if (!studentCode.isEmpty()) {
                        e.setStudentCode(studentCode);
                    }
                    if (!email.isEmpty()) {
                        e.setEmail(email);
                    }

                    // Xử lý Enum Target an toàn
                    if (!targetStr.isEmpty()) {
                        try {
                            e.setTarget(com.sdms.backend.modules.registration.enums.RegistrationTarget.valueOf(targetStr.toUpperCase().trim()));
                        } catch (IllegalArgumentException ex) {
                            e.setTarget(com.sdms.backend.modules.registration.enums.RegistrationTarget.FRESHMAN);
                        }
                    } else {
                        e.setTarget(com.sdms.backend.modules.registration.enums.RegistrationTarget.FRESHMAN);
                    }

                    newEligibilities.add(e);
                    // Add luôn vào Set RAM để nếu trong cùng 1 file Excel có dòng trùng nhau cũng tự động bắt được
                    existingCccds.add(cccd);
                    imported++;
                }
            }
        }

        // 5. Lưu hàng loạt (Batch Save)
        if (!newEligibilities.isEmpty()) {
            eligibilityRepository.saveAll(newEligibilities);
        }

        return new EligibilityImportResponse(total, imported, skipped);
    }

    /**
     * STEP 7 - Lấy danh sách đủ điều kiện (Đã nâng cấp PHÂN TRANG)
     */
    @Transactional(readOnly = true)
    public Page<EligibilityResponse> getEligibilities(UUID periodId, Pageable pageable) {
        // Bạn cần sửa hàm này trong eligibilityRepository nhận thêm Pageable:
        // Page<RegistrationEligibility> findByRegistrationPeriod_PeriodId(UUID periodId, Pageable pageable);
        return eligibilityRepository.findByRegistrationPeriod_PeriodId(periodId, pageable)
                .map(e -> new EligibilityResponse(e.getEligibilityId(), e.getCccd(), e.getFullName()));
    }

    /**
     * STEP 8 - Xóa bản ghi (Giữ nguyên logic kiểm tra chéo an toàn rất tốt của bạn)
     */
    public void deleteEligibility(UUID periodId, UUID eligibilityId) {
        RegistrationEligibility e = eligibilityRepository.findById(eligibilityId)
                .orElseThrow(() -> new AppException("Không tìm thấy bản ghi cần xóa", HttpStatus.NOT_FOUND));

        if (!e.getRegistrationPeriod().getPeriodId().equals(periodId)) {
            throw new AppException("Bản ghi không thuộc về đợt đăng ký này", HttpStatus.BAD_REQUEST);
        }

        eligibilityRepository.delete(e);
    }

    // Helper: Xử lý Cell dữ liệu chuẩn chỉ, dùng DataFormatter chống mất số 0 ở đầu
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return dataFormatter.formatCellValue(cell).trim();
    }
}