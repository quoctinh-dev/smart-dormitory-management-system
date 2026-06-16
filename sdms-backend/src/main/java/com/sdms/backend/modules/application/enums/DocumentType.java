package com.sdms.backend.modules.application.enums;

/**
 * ARCHITECTURAL NOTE:
 * Định nghĩa các loại tài liệu cần thiết cho hồ sơ KTX theo biểu mẫu STU.
 */
public enum DocumentType {
    CCCD("Căn cước công dân"),
    PHOTO_3X4("Ảnh thẻ 3x4"),
    COMMITMENT_FORM("Đơn cam kết nội quy"),
    PRIORITY_PROOF("Giấy tờ chứng minh đối tượng ưu tiên");

    private final String displayName;

    DocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}