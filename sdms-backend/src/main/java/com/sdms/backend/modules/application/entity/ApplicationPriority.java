package com.sdms.backend.modules.application.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.application.enums.PriorityCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * Child entity lưu các đối tượng ưu tiên của DormitoryApplication.
 */
@Entity
@Table(
    name = "application_priorities",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_app_priority_category",
            columnNames = {"application_id", "priority_category"}
        )
    }
)
@Getter
@Setter
public class ApplicationPriority extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "application_priority_id")
    private UUID applicationPriorityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private DormitoryApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority_category", nullable = false, length = 50)
    private PriorityCategory priorityCategory;

    @Column(name = "priority_score", nullable = false)
    private Integer priorityScore = 0;
}
