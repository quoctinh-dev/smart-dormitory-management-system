package com.sdms.backend.modules.room.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.room.enums.BedStatus;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * DOMAIN ROLE
 *
 * Đại diện cho một giường cụ thể
 * trong hệ thống KTX.
 *
 * BUSINESS PURPOSE
 *
 * Là đơn vị nhỏ nhất để
 * phân bổ chỗ ở cho sinh viên.
 *
 * BUSINESS RULE
 *
 * Một Bed chỉ thuộc duy nhất
 * một Room.
 *
 * Một Bed chỉ chứa tối đa
 * một sinh viên tại cùng thời điểm.
 */

@Entity
@Table(
        name = "beds",

        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_room_bed_code",
                        columnNames = {
                                "room_id",
                                "bed_code"
                        }
                )
        },

        indexes = {
                @Index(
                        name = "idx_bed_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
public class Bed extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID bedId;

    /**
     * A101-B01
     */
    @Column(
            nullable = false,
            length = 30
    )
    private String bedCode;

    /**
     * AVAILABLE
     * RESERVED
     * OCCUPIED
     * MAINTENANCE
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private BedStatus status =
            BedStatus.AVAILABLE;

    /**
     * Ghi chú bảo trì.
     */
    @Column(length = 500)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "room_id",
            nullable = false
    )
    private Room room;
}