package com.sdms.backend.modules.room.dto.response;

import com.sdms.backend.modules.room.enums.BedStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * DTO trả về thông tin chi tiết của một giường.
 * * DESIGN NOTE: Trạng thái của giường (BedStatus) là dữ liệu cực kỳ quan trọng
 * để các hệ thống IoT biết có nên cho phép mở khóa cửa hay không.
 */
@Getter
@Setter
@Builder
public class BedResponse {

    private UUID bedId;

    private String bedCode;

    private BedStatus status;

    private String note;

    private UUID roomId;

    private String roomCode;

    private UUID floorId;

    private Integer floorNumber;

    private UUID buildingId;

    private String buildingCode;
}