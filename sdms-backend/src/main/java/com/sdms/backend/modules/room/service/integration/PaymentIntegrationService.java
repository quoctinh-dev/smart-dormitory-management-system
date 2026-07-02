package com.sdms.backend.modules.room.service.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service Stub/Integration để liên kết với Module Payment/Application.
 * Mục đích: Đảm bảo Loose Coupling (Giảm phụ thuộc). 
 * Trong thực tế, class này có thể dùng @FeignClient hoặc gọi sang các interface của core service.
 */
@Service
@Slf4j
public class PaymentIntegrationService {
    
    /**
     * Giả lập hàm lấy danh sách các mã giường (bedCode) đang bị nợ tiền (quá hạn thanh toán).
     * @return Map<Mã giường, Số tiền nợ>
     */
    public Map<String, Double> getOverduePaymentsByBed() {
        log.info("[Integration] Đang gọi sang Module Payment để lấy danh sách nợ cước...");
        // Dữ liệu giả lập
        return Map.of(
            "A101-B01", 1500000.0,
            "B205-B02", 2000000.0,
            "C102-B04", 1750000.0
        );
    }
}
