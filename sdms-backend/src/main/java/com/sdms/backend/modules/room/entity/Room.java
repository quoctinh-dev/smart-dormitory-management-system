package com.sdms.backend.modules.room.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.room.enums.RoomStatus;
import jakarta.persistence.*;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;
import java.util.List;

/**
 * DOMAIN ROLE: Đại diện cho phòng ở trong KTX.
 * BUSINESS PURPOSE: Quản lý sức chứa và trạng thái phòng.
 * NOTE: monthlyFee đã được đưa sang Payment Module để quản lý tập trung.
 */
@Getter
@Setter
@Entity
@Table(
        name = "rooms",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_floor_room_code",
                        columnNames = {"floor_id", "room_code"}
                )
        }
)
public class Room extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID roomId;

    @Column(name = "room_code", nullable = false, length = 30)
    private String roomCode;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer occupiedBeds = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    private Floor floor;

    /**
     * SECURITY: Mã PIN mở cửa phòng (4-6 chữ số).
     * - Được sinh tự động khi phòng được tạo.
     * - Admin có thể reset hàng loạt bất cứ lúc nào.
     * - Khi SV đổi phòng, họ tự động dùng PIN của phòng mới (không cần migration).
     */
    @Column(name = "room_pin_code", length = 10)
    private String roomPinCode;

    @Version
    @Column(name = "version")
    private Integer version;
}