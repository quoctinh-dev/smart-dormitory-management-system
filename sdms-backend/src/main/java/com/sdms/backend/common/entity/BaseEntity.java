package com.sdms.backend.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * ARCHITECTURAL NOTE:
 * - Lớp cơ sở (Base Class) cho tất cả các Entity trong hệ thống.
 * - Sử dụng Lifecycle Callbacks của JPA (@PrePersist, @PreUpdate) để kiểm soát thời gian.
 *
 * BUSINESS PURPOSE:
 * - Đảm bảo tính nhất quán của dữ liệu Audit mà không cần cấu hình phức tạp bên ngoài.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}