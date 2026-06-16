package com.sdms.backend.modules.application.enums;

/**
 * DOMAIN ENUM: Phân loại đối tượng ưu tiên của sinh viên.
 *
 * ARCHITECTURAL NOTE:
 * - Chỉ tập trung vào định danh đối tượng và giá trị điểm ưu tiên (Domain Logic).
 * - Mọi logic về quản lý tài liệu (tài liệu nào cần nộp, bắt buộc hay không)
 *   đã được chuyển sang quản lý tập trung tại module VerificationDocument.
 */
public enum PriorityCategory {
    MARTYR_CHILD("Con liệt sĩ", 100),
    WOUNDED_SOLDIER_CHILD("Con thương binh", 95),
    DISABLED_STUDENT("Sinh viên khuyết tật", 90),
    ORPHAN("Sinh viên mồ côi", 85),
    POOR_HOUSEHOLD("Hộ nghèo", 80),
    ETHNIC_MINORITY("Dân tộc thiểu số", 75),
    REMOTE_AREA("Sinh viên vùng sâu vùng xa", 70),
    PARTY_MEMBER("Đảng viên", 65),
    NONE("Không ưu tiên", 0);

    private final String displayName;
    private final int score;

    PriorityCategory(String displayName, int score) {
        this.displayName = displayName;
        this.score = score;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getScore() {
        return score;
    }
}