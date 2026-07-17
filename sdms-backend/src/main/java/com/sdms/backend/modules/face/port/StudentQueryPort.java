package com.sdms.backend.modules.face.port;

import java.util.UUID;

/**
 * Cổng ra cho các truy vấn Student Context.
 * Đảm bảo Không có ORM Xuyên Context (AF-02).
 */
public interface StudentQueryPort {
    boolean existsById(UUID studentId);
    String getStudentEmail(UUID studentId);
    String getStudentFullName(UUID studentId);
}
