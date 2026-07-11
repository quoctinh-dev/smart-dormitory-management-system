package com.sdms.backend.modules.notification.controller;

import com.sdms.backend.modules.notification.dto.NotificationResponse;
import com.sdms.backend.modules.notification.service.InAppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
public class NotificationController {

    private final InAppNotificationService inAppNotificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications() {
        return ResponseEntity.ok(ApiResponse.success(inAppNotificationService.getUserNotifications()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(inAppNotificationService.getUnreadCount()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        inAppNotificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã đọc"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        inAppNotificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu tất cả đã đọc"));
    }

    @PostMapping("/issues")
    public ResponseEntity<ApiResponse<Void>> reportIssue(@Valid @RequestBody IssueReportRequest request) {
        inAppNotificationService.reportIssue(request);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi báo cáo vấn đề thành công"));
    }
}
