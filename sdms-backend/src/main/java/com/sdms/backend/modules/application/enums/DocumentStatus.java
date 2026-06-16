package com.sdms.backend.modules.application.enums;

/**
 * ARCHITECTURAL NOTE:
 * Trạng thái xác thực của từng loại tài liệu trong quá trình kiểm duyệt hồ sơ.
 */
public enum DocumentStatus {
    PENDING("Chờ kiểm duyệt"),
    APPROVED("Đã duyệt"),
    REJECTED("Bị từ chối");

    private final String displayName;

    DocumentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}