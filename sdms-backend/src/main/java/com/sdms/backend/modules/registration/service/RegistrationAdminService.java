package com.sdms.backend.modules.registration.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.registration.dto.request.CreateRegistrationPeriodRequest;
import com.sdms.backend.modules.registration.dto.request.UpdateRegistrationPeriodRequest;
import com.sdms.backend.modules.registration.dto.response.RegistrationPeriodResponse;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationAdminService {

    private final RegistrationPeriodRepository repository;

    // Tạo đợt đăng ký mới
    public RegistrationPeriodResponse createPeriod(CreateRegistrationPeriodRequest req) {
        LocalDateTime now = LocalDateTime.now();

        if (req.getStartDate().isAfter(req.getEndDate())) {
            throw new AppException("Ngày bắt đầu phải trước ngày kết thúc", HttpStatus.BAD_REQUEST);
        }

        if (req.getEndDate().isBefore(now)) {
            throw new AppException("Thời gian kết thúc của đợt mới không được ở trong quá khứ", HttpStatus.BAD_REQUEST);
        }

        RegistrationPeriod period = new RegistrationPeriod();
        period.setPeriodName(req.getPeriodName());
        period.setRegistrationType(req.getRegistrationType());
        period.setStartDate(req.getStartDate());
        period.setEndDate(req.getEndDate());
        period.setStayStartDate(req.getStayStartDate());
        period.setStayEndDate(req.getStayEndDate());
        period.setIsActive(false); // Mặc định tạo ra là nháp (tạm dừng)

        return mapToResponse(repository.save(period));
    }

    // Kích hoạt đợt (Tự động tắt các đợt khác)
    public void activatePeriod(UUID id) {
        RegistrationPeriod p = repository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đợt đăng ký", HttpStatus.NOT_FOUND));

        if (LocalDateTime.now().isAfter(p.getEndDate())) {
            throw new AppException("Không thể kích hoạt đợt đăng ký đã quá hạn kết thúc", HttpStatus.BAD_REQUEST);
        }

        // Tắt tất cả các đợt khác để tránh xung đột Unique Constraint
        repository.deactivateAll();
        p.setIsActive(true);
        repository.save(p);
    }

    // Tắt đợt đang hoạt động
    public void deactivatePeriod(UUID id) {
        RegistrationPeriod p = repository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đợt đăng ký", HttpStatus.NOT_FOUND));

        p.setIsActive(false);
        repository.save(p);
    }

    // Cập nhật thông tin đợt (Hỗ trợ tái sử dụng hoàn hảo)
    public RegistrationPeriodResponse updatePeriod(UUID id, UpdateRegistrationPeriodRequest req) {
        RegistrationPeriod p = repository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đợt đăng ký", HttpStatus.NOT_FOUND));

        // 1. Kiểm tra logic ngày tháng cơ bản
        if (req.getStartDate().isAfter(req.getEndDate())) {
            throw new AppException("Ngày bắt đầu phải trước ngày kết thúc", HttpStatus.BAD_REQUEST);
        }

        LocalDateTime now = LocalDateTime.now();
        if (req.getEndDate().isBefore(now)) {
            throw new AppException("Thời gian kết thúc cập nhật không được ở trong quá khứ", HttpStatus.BAD_REQUEST);
        }

        // 2. Kiểm tra xem đợt này có ĐANG TRONG THỜI GIAN HOẠT ĐỘNG thực tế hay không
        if (Boolean.TRUE.equals(p.getIsActive()) && now.isAfter(p.getStartDate())) {

            // Chốt chặn 1: Không được đổi loại hình đăng ký khi đợt đang mở
            if (!p.getRegistrationType().equals(req.getRegistrationType())) {
                throw new AppException("Đợt đăng ký đang hoạt động, không thể thay đổi loại đợt đăng ký", HttpStatus.BAD_REQUEST);
            }

            // Chốt chặn 2: Không được sửa ngày bắt đầu vì đợt đã chạy qua mốc đó rồi
            if (!p.getStartDate().equals(req.getStartDate())) {
                throw new AppException("Đợt đăng ký đã hoặc đang diễn ra, không thể thay đổi ngày bắt đầu", HttpStatus.BAD_REQUEST);
            }
        }

        // 3. Nếu đợt chưa chạy hoặc đang tắt hẳn (nháp) -> Cho phép cập nhật toàn bộ để "để dành" dùng lại
        p.setPeriodName(req.getPeriodName());
        p.setRegistrationType(req.getRegistrationType());
        p.setStartDate(req.getStartDate());
        p.setEndDate(req.getEndDate());
        p.setStayStartDate(req.getStayStartDate());
        p.setStayEndDate(req.getStayEndDate());

        return mapToResponse(repository.save(p));
    }

    // Lấy danh sách tất cả các đợt
    @Transactional(readOnly = true)
    public List<RegistrationPeriodResponse> getAllPeriods() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Map Entity sang DTO
    private RegistrationPeriodResponse mapToResponse(RegistrationPeriod p) {
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
}