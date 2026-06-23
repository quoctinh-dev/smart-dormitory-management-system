package com.sdms.backend.modules.application.enums;

/**
 * Phân loại tài liệu minh chứng cần nộp trong hồ sơ đăng ký lưu trú KTX STU.
 */
public enum VerificationDocumentType {
    CCCD_FRONT("Căn cước công dân - Mặt trước"),
    CCCD_BACK("Căn cước công dân - Mặt sau"),
    PORTRAIT_PHOTO("Ảnh thẻ 3x4"),
    COMMITMENT_FORM("Đơn cam kết nội quy ký tên"),
    
    // Giấy tờ minh chứng ưu tiên ứng với 7 đối tượng STU
    PRIORITY_01_PROOF("Minh chứng Con liệt sĩ/thương binh/bệnh binh"),
    PRIORITY_02_PROOF("Minh chứng Con đẻ người nhiễm chất độc hóa học"),
    PRIORITY_03_PROOF("Minh chứng Sinh viên dân tộc thiểu số"),
    PRIORITY_04_PROOF("Minh chứng Hộ nghèo/cận nghèo/vùng khó khăn"),
    PRIORITY_05_PROOF("Minh chứng Sinh viên khuyết tật/mồ côi"),
    PRIORITY_06_PROOF("Minh chứng Đảng viên/Xuất ngũ"),
    PRIORITY_07_PROOF("Minh chứng Cán bộ đoàn/hoạt động xã hội");

    private final String displayName;

    VerificationDocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
