package com.sdms.backend.modules.notification.controller;

import com.sdms.backend.modules.notification.dto.NotificationResponse;
import com.sdms.backend.modules.notification.service.InAppNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.sdms.backend.modules.notification.dto.IssueReportRequest;

import com.sdms.backend.common.response.ApiResponse;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Thông báo (Notification)", description = "Quản lý thông báo cá nhân")
public class NotificationController {

    private final InAppNotificationService inAppNotificationService;

    @Operation(summary = "Lấy danh sách thông báo của tôi")
    @GetMapping
    public ApiResponse<List<NotificationResponse>> getUserNotifications() {
        return ApiResponse.success("Lấy danh sách thông báo thành công", inAppNotificationService.getUserNotifications());
    }

    @Operation(summary = "Lấy số lượng thông báo chưa đọc")
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        return ApiResponse.success("Thành công", inAppNotificationService.getUnreadCount());
    }

    @Operation(summary = "Đánh dấu thông báo đã đọc")
    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        inAppNotificationService.markAsRead(id);
        return ApiResponse.success("Đã đánh dấu đã đọc");
    }

    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc")
    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {
        inAppNotificationService.markAllAsRead();
        return ApiResponse.success("Đã đánh dấu tất cả đã đọc");
    }

    @Operation(summary = "Gửi báo cáo sự cố")
    @PostMapping("/issues")
    public ApiResponse<Void> reportIssue(@Valid @RequestBody IssueReportRequest request) {
        inAppNotificationService.reportIssue(request);
        return ApiResponse.success("Đã gửi báo cáo vấn đề thành công");
    }

}
