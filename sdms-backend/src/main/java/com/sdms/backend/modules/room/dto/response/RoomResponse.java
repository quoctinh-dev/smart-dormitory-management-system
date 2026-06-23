package com.sdms.backend.modules.room.dto.response;

import com.sdms.backend.modules.room.enums.RoomStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * DTO trả về thông tin phòng chi tiết.
 * * DESIGN NOTE:
 * - Bao gồm các thông tin phân cấp (Floor, Building) giúp UI Admin hiển thị
 * dữ liệu tổng quan mà không cần thực hiện nhiều truy vấn liên quan.
 */
@Getter
@Setter
@Builder
public class RoomResponse {

    private UUID roomId;

    private String roomCode;

    private Integer capacity;

    private Integer occupiedBeds;

    private Integer availableBeds;

    private RoomStatus status;

    private UUID floorId;

    private Integer floorNumber;

    private UUID buildingId;

    private String buildingCode;

    private String buildingName;
}