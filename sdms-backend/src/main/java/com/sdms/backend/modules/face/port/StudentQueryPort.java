package com.sdms.backend.modules.face.port;

import java.util.UUID;

/**
 * Outbound port for Student Context queries.
 * Ensures No Cross Context ORM (AF-02).
 */
public interface StudentQueryPort {
    boolean existsById(UUID studentId);
}
