package com.sdms.backend.modules.application.enums;

/**
 * Định nghĩa loại tài liệu được hệ thống tự động sinh dưới dạng PDF (SDMS Extension).
 */
public enum GeneratedDocumentType {
    REGISTRATION_FORM("Phiếu đăng ký lưu trú"),
    COMMITMENT_FORM("Bản cam kết lưu trú");

    private final String displayName;

    GeneratedDocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
