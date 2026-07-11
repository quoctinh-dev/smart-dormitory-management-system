package com.sdms.backend.modules.notification.service.impl;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.notification.dto.NotificationResponse;
import com.sdms.backend.modules.notification.entity.Notification;
import com.sdms.backend.modules.notification.repository.NotificationRepository;
import com.sdms.backend.modules.notification.service.InAppNotificationService;
import com.sdms.backend.modules.user.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.sdms.backend.modules.notification.dto.IssueReportRequest;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.notification.enums.NotificationType;

@Service
@RequiredArgsConstructor
public class InAppNotificationServiceImpl implements InAppNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserAccountRepository userAccountRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications() {
        UUID userId = getCurrentUserId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByUserIdAndIsReadFalse(getCurrentUserId());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, getCurrentUserId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        List<Notification> unreadList =
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(getCurrentUserId());

        unreadList.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });

        notificationRepository.saveAll(unreadList);
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserAccount account) {
            return account.getAccountId();
        }

        throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .actionUrl(notification.getActionUrl())
                .type(notification.getType())
                .isRead(notification.isRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void reportIssue(IssueReportRequest request) {
        UUID studentId = getCurrentUserId();
        
        // Find all admins and staff to notify
        List<UserAccount> admins = userAccountRepository.findByRole(Role.ADMIN);
        List<UserAccount> staffs = userAccountRepository.findByRole(Role.STAFF);
        
        String title = "Báo hỏng thiết bị từ sinh viên";
        String message = String.format("Sinh viên %s báo hỏng thiết bị tại phòng %s. Mô tả: %s", 
                studentId, request.getRoomId(), request.getDescription());
                
        // Create notification for each admin/staff
        admins.forEach(admin -> createNotification(admin.getAccountId(), title, message, request.getImageUrl()));
        staffs.forEach(staff -> createNotification(staff.getAccountId(), title, message, request.getImageUrl()));
    }

    private void createNotification(UUID recipientId, String title, String message, String imageUrl) {
        Notification notification = Notification.builder()
                .userId(recipientId)
                .title(title)
                .message(message)
                .actionUrl(imageUrl) // using actionUrl to pass imageUrl for now
                .type(NotificationType.MAINTENANCE)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}
