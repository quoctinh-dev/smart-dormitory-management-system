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

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final InAppNotificationService inAppNotificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications() {
        return ResponseEntity.ok(inAppNotificationService.getUserNotifications());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(inAppNotificationService.getUnreadCount());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        inAppNotificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        inAppNotificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/issues")
    public ResponseEntity<Void> reportIssue(@RequestBody IssueReportRequest request) {
        // Xử lý tạo Issue Report dạng một Notification đặc biệt gửi cho Admin
        return ResponseEntity.ok().build();
    }
}
