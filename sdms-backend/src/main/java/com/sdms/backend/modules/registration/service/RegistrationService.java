package com.sdms.backend.modules.registration.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.registration.dto.request.CheckEligibilityRequest;
import com.sdms.backend.modules.registration.dto.response.CheckEligibilityResponse;
import com.sdms.backend.modules.registration.dto.response.RegistrationPeriodResponse;
import com.sdms.backend.modules.registration.entity.RegistrationEligibility;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.enums.RegistrationType;
import com.sdms.backend.modules.registration.repository.RegistrationEligibilityRepository;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Mục tiêu/Nghiệp vụ: Quản lý các đợt đăng ký KTX và kiểm tra điều kiện (Eligibility) của sinh viên trước khi họ được phép tạo đơn (VD: Tân sinh viên được ưu tiên đợt 1).
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Xây dựng dựa trên nguyên lý Single Responsibility. Sử dụng Hibernate/Spring Data JPA để truy vấn whitelist (danh sách đủ điều kiện), thiết lập `@Transactional(readOnly = true)` để tối ưu cache L1 và connection pool.
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích bẫy trạng thái Overlap thời gian ở hàm getActivePeriod: Do admin có thể thiết lập nhầm thời gian của 2 đợt đăng ký chồng lên nhau (overlap), nếu dùng phương thức JPA trả về 1 kết quả (Single/Optional) hệ thống sẽ throw NonUniqueResultException làm sập toàn bộ luồng tạo đơn. Thay vào đó, trả về List và lấy activePeriods.get(0) để bảo vệ hệ thống trước lỗi con người (Fault Tolerance).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegistrationService {

    private final RegistrationPeriodRepository registrationPeriodRepository;
    private final RegistrationEligibilityRepository registrationEligibilityRepository;

    /**
     * Lấy đợt đăng ký đang active (Đã bọc lót chống lỗi Overlap thời gian).
     */
    private RegistrationPeriod getActivePeriod() {
        LocalDateTime now = LocalDateTime.now();

        // Sửa ở Repository thành trả về List để tránh vỡ trận khi Admin cấu hình đè thời gian lên nhau
        List<RegistrationPeriod> activePeriods = registrationPeriodRepository
                .findByIsActiveTrueAndStartDateBeforeAndEndDateAfter(now, now);

        if (activePeriods.isEmpty()) {
            throw new AppException("Hiện tại không có đợt đăng ký nào đang mở.", HttpStatus.NOT_FOUND);
        }

        // Nếu có nhiều đợt trùng nhau, ưu tiên lấy đợt đầu tiên tìm thấy thay vì crash hệ thống
        return activePeriods.get(0);
    }

    /**
     * Lấy thông tin đợt đăng ký đang active cho client.
     */
    public RegistrationPeriodResponse getActiveRegistrationPeriod() {
        RegistrationPeriod p = getActivePeriod();
        return new RegistrationPeriodResponse(
                p.getPeriodId(),
                p.getPeriodName(),
                p.getRegistrationType(),
                p.getStartDate(),
                p.getEndDate(),
                p.getIsActive(),
                p.getStayStartDate(),
                p.getStayEndDate()
        );
    }

    /**
     * Kiểm tra điều kiện đăng ký của sinh viên.
     */
    public CheckEligibilityResponse checkEligibility(CheckEligibilityRequest request) {
        RegistrationPeriod activePeriod = getActivePeriod();

        // 1. Nếu là đợt tự do, mặc định hợp lệ
        if (activePeriod.getRegistrationType() == RegistrationType.OPEN_REGISTRATION) {
            return CheckEligibilityResponse.builder()
                    .eligible(true)
                    .periodId(activePeriod.getPeriodId())
                    .periodName(activePeriod.getPeriodName())
                    .registrationType(activePeriod.getRegistrationType().name())
                    // Đợt tự do thường áp dụng cho tất cả đối tượng cư dân cũ + mới
                    .target("ALL")
                    .message("Đợt đăng ký tự do, tất cả sinh viên đều đủ điều kiện.")
                    .build();
        }

        // 2. Nếu là đợt có giới hạn, kiểm tra danh sách eligible
        Optional<RegistrationEligibility> eligibilityOpt = registrationEligibilityRepository
                .findByRegistrationPeriod_PeriodIdAndCccd(
                        activePeriod.getPeriodId(),
                        request.getCccd()
                );

        if (eligibilityOpt.isPresent()) {
            RegistrationEligibility eligibility = eligibilityOpt.get();
            return CheckEligibilityResponse.builder()
                    .eligible(true)
                    .periodId(activePeriod.getPeriodId())
                    .periodName(activePeriod.getPeriodName())
                    .registrationType(activePeriod.getRegistrationType().name())
                    .fullName(eligibility.getFullName())
                    // Trả thêm Target (Ví dụ: FRESHMAN) để Frontend hiển thị giao diện điền đơn phù hợp
                    .target(eligibility.getTarget() != null ? eligibility.getTarget().name() : "ALL")
                    .message("Bạn đủ điều kiện tham gia đợt đăng ký này.")
                    .build();
        } else {
            return CheckEligibilityResponse.builder()
                    .eligible(false)
                    .periodId(activePeriod.getPeriodId())
                    .periodName(activePeriod.getPeriodName())
                    .registrationType(activePeriod.getRegistrationType().name())
                    .message("Bạn không có trong danh sách đủ điều kiện của đợt đăng ký này.")
                    .build();
        }
    }
}