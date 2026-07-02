package com.sdms.backend.modules.notification.service;

import com.sdms.backend.modules.notification.enums.NotificationType;
import java.util.Map;

public interface NotificationService {
    /**
     * Gửi email định dạng HTML sử dụng Thymeleaf Template
     *
     * @param toEmail      Địa chỉ email người nhận
     * @param title        Tiêu đề email
     * @param templateName Tên file template trong thư mục templates/notification (không cần đuôi .html)
     * @param variables    Map chứa các cặp (Key - Value) dữ liệu động để đổ vào template
     * @param type         Phân loại nhóm thông báo (APPLICATION, PAYMENT, FACE, ROOM, AUTH)
     */
    void sendHtmlEmail(String toEmail, String title, String templateName, Map<String, Object> variables, NotificationType type);
}