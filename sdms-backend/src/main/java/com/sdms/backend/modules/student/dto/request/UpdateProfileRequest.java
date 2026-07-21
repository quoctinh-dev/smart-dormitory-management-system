package com.sdms.backend.modules.student.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    // === TRƯỜNG CÓ THỂ THAY ĐỔI (Updatable Fields) ===

    /** Số điện thoại cá nhân — thay đổi thường xuyên */
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    private String fatherName;
    private String fatherPhone;
    private String motherName;
    private String motherPhone;
    private String contactAddress;
    private String permanentAddress;
    private String avatarUrl;


    // === TRƯỜNG BỊ KHÓA (Locked — không có trong Request DTO, chỉ Admin mới sửa được) ===
    // cccd         → Định danh quốc gia, 1 người 1 số duy nhất, Admin xử lý nếu đổi CMND→CCCD
    // studentCode  → Trường cấp, định danh hệ thống
    // email        → Email trường (@st.saigontech.edu.vn), trường cấp
    // fullName     → Cần thủ tục hành chính
    // faculty, academicYear, cohort → Học vụ cố định
    // dob, gender, pob, ethnic, religion → Thông tin sinh học bất biến
    // issueDate, issuePlace → Snapshot lúc đăng ký gốc
}