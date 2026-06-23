package com.sdms.backend.modules.application.enums;

/**
 * Danh mục đối tượng ưu tiên trích xuất từ biểu mẫu STU thực tế.
 */
public enum PriorityCategory {
    PRIORITY_01("Con liệt sĩ, con thương binh, bệnh binh...", 100),
    PRIORITY_02("Con đẻ người hoạt động kháng chiến nhiễm chất độc hóa học", 95),
    PRIORITY_03("Sinh viên dân tộc thiểu số", 70),
    PRIORITY_04("Hộ khẩu thường trú vùng khó khăn/Hộ nghèo, cận nghèo", 80),
    PRIORITY_05("Sinh viên khuyết tật / Mồ côi cả cha lẫn mẹ", 90),
    PRIORITY_06("Đảng viên / Bộ đội, công an xuất ngũ", 50),
    PRIORITY_07("Tham gia hoạt động công tác xã hội", 40),
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