package com.sdms.backend.modules.registration.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckEligibilityResponse {

    @Schema(description = "Trạng thái hợp lệ (true nếu đủ điều kiện, false nếu không)", example = "true")
    private Boolean eligible;

    @Schema(description = "ID của đợt đăng ký hiện tại")
    private UUID periodId;

    @Schema(description = "Tên của đợt đăng ký hiện tại", example = "Đợt Đăng Ký KTX Học Kỳ 1")
    private String periodName;

    @Schema(description = "Loại đợt đăng ký (OPEN_REGISTRATION, NEW_STUDENT, CURRENT_RESIDENT)", example = "NEW_STUDENT")
    private String registrationType;

    @Schema(description = "Họ và tên của sinh viên (Nếu nằm trong danh sách eligible)", example = "Nguyễn Văn A")
    private String fullName;

    @Schema(description = "CCCD từ danh sách (nếu có)")
    private String cccd;

    @Schema(description = "Mã số sinh viên từ danh sách (nếu có)")
    private String studentCode;

    @Schema(description = "Đối tượng áp dụng (FRESHMAN, CURRENT_STUDENT, ALL) - Dùng để Frontend điều hướng Form", example = "FRESHMAN")
    private String target;

    @Schema(description = "Thông báo chi tiết trả về cho sinh viên", example = "Bạn đủ điều kiện tham gia đợt đăng ký này.")
    private String message;
}