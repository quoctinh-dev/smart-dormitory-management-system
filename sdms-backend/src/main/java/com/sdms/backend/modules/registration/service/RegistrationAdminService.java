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
        if (req.getStartDate().isAfter(req.getEndDate())) {
            throw new AppException("Ngày bắt đầu phải trước ngày kết thúc", HttpStatus.BAD_REQUEST);
        }

        RegistrationPeriod period = new RegistrationPeriod();
        period.setPeriodName(req.getPeriodName());
        period.setRegistrationType(req.getRegistrationType());
        period.setStartDate(req.getStartDate());
        period.setEndDate(req.getEndDate());
        period.setIsActive(false); // Mặc định tạo ra là tạm dừng

        return mapToResponse(repository.save(period));
    }

    // Kích hoạt đợt (Tự động tắt các đợt khác)
    public void activatePeriod(UUID id) {
        // 1. Tắt tất cả đợt active trước đó bằng 1 câu lệnh SQL duy nhất
        // Điều này đảm bảo không vi phạm ràng buộc Unique Constraint của Database
        repository.deactivateAll();

        // 2. Tìm và bật đợt mới
        RegistrationPeriod p = repository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đợt đăng ký", HttpStatus.NOT_FOUND));

        p.setIsActive(true);
        repository.save(p);
    }

    // Tắt đợt đang hoạt động (Nghiệp vụ phụ nếu cần)
    public void deactivatePeriod(UUID id) {
        RegistrationPeriod p = repository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đợt đăng ký", HttpStatus.NOT_FOUND));

        p.setIsActive(false);
        repository.save(p);
    }

    // Cập nhật thông tin đợt
    public RegistrationPeriodResponse updatePeriod(UUID id, UpdateRegistrationPeriodRequest req) {
        RegistrationPeriod p = repository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đợt đăng ký", HttpStatus.NOT_FOUND));

        p.setPeriodName(req.getPeriodName());
        p.setStartDate(req.getStartDate());
        p.setEndDate(req.getEndDate());
        return mapToResponse(repository.save(p));
    }

    // Lấy danh sách tất cả các đợt
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
                p.getIsActive()
        );
    }
}