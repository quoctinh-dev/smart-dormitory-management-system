package com.sdms.backend.modules.application.enums;

/**
 * Trạng thái xác thực của tài liệu minh chứng trong quá trình kiểm duyệt hồ sơ.
 */
public enum VerificationStatus {
    PENDING("Chờ kiểm duyệt"),
    VALID("Hợp lệ"),
    INVALID("Không hợp lệ");

    private final String displayName;

    VerificationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
