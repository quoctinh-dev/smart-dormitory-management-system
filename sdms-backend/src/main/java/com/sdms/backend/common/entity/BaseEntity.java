package com.sdms.backend.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * Lớp thực thể cơ sở (Base Entity) cung cấp các thuộc tính chung cho toàn bộ thực thể trong hệ thống.
 * Tự động hóa quá trình ghi nhận lịch sử thay đổi (Audit) bao gồm thời gian tạo và thời gian cập nhật.
 * Đóng vai trò cốt lõi trong việc triển khai cơ chế xóa mềm (Soft Delete) để bảo toàn dữ liệu.
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

    /**
     * Khởi tạo mốc thời gian lúc tạo mới bản ghi.
     * Cơ chế JPA Lifecycle Callback ngầm định thực thi logic này ngay trước lệnh INSERT vào cơ sở dữ liệu.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Cập nhật mốc thời gian sửa đổi gần nhất.
     * Cơ chế JPA Lifecycle Callback ngầm định thực thi logic này ngay trước lệnh UPDATE vào cơ sở dữ liệu.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}