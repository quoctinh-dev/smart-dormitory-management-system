package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillRepository billRepository;
    private final DormitoryApplicationRepository applicationRepository;

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'STUDENT')")
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<ApiResponse<Bill>> getBillByApplicationId(@PathVariable UUID applicationId) {
        List<Bill> bills = billRepository.findByApplicationId(applicationId);
        if (bills.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "Không tìm thấy hóa đơn cho hồ sơ này", null));
        }
        // Giả sử lấy bill mới nhất hoặc hóa đơn phí lưu trú
        Bill accommodationBill = bills.get(0);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin hóa đơn thành công", accommodationBill));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Bill>>> getMyBills(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.sdms.backend.modules.user.entity.UserAccount currentUser
    ) {
        if (currentUser.getStudent() == null) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "Tài khoản chưa được liên kết sinh viên", null));
        }
        // Giả sử Student có applicationId, hoặc ta lấy bill thông qua logic nghiệp vụ.
        // Tạm thời lấy danh sách rỗng hoặc lấy tất cả nếu DB thiết kế Bill link với StudentId
        // Vì Bill liên kết qua applicationId, cần tìm application của student theo CCCD
        List<com.sdms.backend.modules.application.entity.DormitoryApplication> apps = applicationRepository.findByCccd(currentUser.getStudent().getCccd());
        List<Bill> myBills = new java.util.ArrayList<>();
        for (var app : apps) {
            myBills.addAll(billRepository.findByApplicationId(app.getApplicationId()));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử thanh toán thành công", myBills));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @GetMapping
    public ResponseEntity<ApiResponse<com.sdms.backend.common.response.PageResponse<java.util.Map<String, Object>>>> getAllBills(
            org.springframework.data.domain.Pageable pageable
    ) {
        org.springframework.data.domain.Page<Bill> billPage = billRepository.findAll(pageable);
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (Bill bill : billPage.getContent()) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("billId", bill.getBillId());
            // Lấy 8 ký tự đầu của UUID làm mã hiển thị cho đẹp
            map.put("billCode", bill.getBillId().toString().substring(0, 8).toUpperCase());
            map.put("amount", bill.getAmount());
            map.put("billType", bill.getBillType());
            map.put("status", bill.getStatus());
            map.put("dueDate", bill.getDueDate());
            
            // Tìm tên sinh viên từ application_id
            if (bill.getApplicationId() != null) {
                map.put("applicationId", bill.getApplicationId());
                try {
                    applicationRepository.findById(bill.getApplicationId()).ifPresent(app -> {
                        map.put("studentName", app.getFullName());
                    });
                } catch (Exception e) {}
            }
            if (!map.containsKey("studentName")) {
                map.put("studentName", "Khách " + map.get("billCode"));
            }
            result.add(map);
        }
        
        com.sdms.backend.common.response.PageResponse<java.util.Map<String, Object>> pageResponse = 
            com.sdms.backend.common.response.PageResponse.fromPage(billPage, result);

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách hóa đơn thành công", pageResponse));
    }
}
