# FACE-COMPILATION-01A-VERIFY: Domain Layer Verification Report

## Compile Result

```
[INFO] BUILD SUCCESS
[INFO] Total time: ~24s
[INFO] Errors: 0 | Warnings: 3 (pre-existing, unrelated to Face Module)
```

## Source Code Review

### 1. FaceProfile.java

```java
package com.sdms.backend.modules.face.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.face.enums.FaceProfileStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(
        name = "face_profiles",
        indexes = {
                @Index(name = "idx_face_profiles_student_id", columnList = "student_id"),
                @Index(name = "idx_face_profiles_status_created", columnList = "status, created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "profile_id", updatable = false, nullable = false)
    private UUID profileId;

    @Column(name = "student_id", nullable = false, unique = true)
    private UUID studentId;

    @Column(name = "face_image_url", length = 500)
    private String faceImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private FaceProfileStatus status;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}
```

### 2. FaceEmbedding.java

```java
package com.sdms.backend.modules.face.entity;

import com.sdms.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "face_embeddings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceEmbedding extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "embedding_id", updatable = false, nullable = false)
    private UUID embeddingId;

    @Column(name = "profile_id", nullable = false, unique = true)
    private UUID profileId;

    @Column(name = "vector", nullable = false, columnDefinition = "vector(512)")
    private float[] embeddingVector;
}
```

### 3. FaceVerificationAttempt.java

```java
package com.sdms.backend.modules.face.entity;

import com.sdms.backend.modules.face.enums.FaceVerificationResult;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "face_verification_attempts",
        indexes = {
                @Index(name = "idx_face_verif_profile_id", columnList = "profile_id"),
                @Index(name = "idx_face_verif_gate_time", columnList = "gate_device_id, attempted_at")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class FaceVerificationAttempt {
    // Insert-only: does NOT extend BaseEntity (immutable ledger, no updatedAt).

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attempt_id", updatable = false, nullable = false)
    private UUID attemptId;

    @Column(name = "gate_device_id", nullable = false, length = 100)
    private String gateDeviceId;

    @Column(name = "profile_id")
    private UUID profileId;

    @Column(name = "confidence_score", precision = 10, scale = 8)
    private BigDecimal confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private FaceVerificationResult status;

    @CreatedDate
    @Column(name = "attempted_at", nullable = false, updatable = false)
    private LocalDateTime attemptedAt;
}
```

### 4. FaceProfileStatus.java

```java
package com.sdms.backend.modules.face.enums;

public enum FaceProfileStatus {
    PENDING,
    APPROVED,
    REJECTED,
    REVOKED
}
```

## Verification Checklist

### Package Placement
| File | Expected Package | Actual Package | Result |
| :--- | :--- | :--- | :--- |
| `FaceProfile` | `com.sdms.backend.modules.face.entity` | `com.sdms.backend.modules.face.entity` | ✅ |
| `FaceEmbedding` | `com.sdms.backend.modules.face.entity` | `com.sdms.backend.modules.face.entity` | ✅ |
| `FaceVerificationAttempt` | `com.sdms.backend.modules.face.entity` | `com.sdms.backend.modules.face.entity` | ✅ |
| `FaceProfileStatus` | `com.sdms.backend.modules.face.enums` | `com.sdms.backend.modules.face.enums` | ✅ |

### BaseEntity Integration
| Entity | Extends | Rationale | Result |
| :--- | :--- | :--- | :--- |
| `FaceProfile` | `com.sdms.backend.common.entity.BaseEntity` | Mutable lifecycle entity — needs `createdAt` + `updatedAt` via `@PrePersist`/`@PreUpdate` | ✅ Fixed |
| `FaceEmbedding` | `com.sdms.backend.common.entity.BaseEntity` | Mutable (new record per approval cycle) | ✅ Fixed |
| `FaceVerificationAttempt` | None (standalone) | Insert-only immutable ledger — intentionally excludes `updatedAt`. Uses `@CreatedDate` + Spring Auditing only | ✅ Correct |

> [!NOTE]
> `FaceProfile` and `FaceEmbedding` were initially using `@CreatedDate`/`@LastModifiedDate` (Spring Auditing).
> They were corrected during this review to extend `com.sdms.backend.common.entity.BaseEntity`
> which uses JPA `@PrePersist`/`@PreUpdate` — matching the pattern of all other existing entities in the project.

### UUID Usage
| Entity | PK Strategy | PK Type | Result |
| :--- | :--- | :--- | :--- |
| `FaceProfile` | `GenerationType.UUID` | `UUID` | ✅ |
| `FaceEmbedding` | `GenerationType.UUID` | `UUID` | ✅ |
| `FaceVerificationAttempt` | `GenerationType.UUID` | `UUID` | ✅ |

### Unique Constraints
| Constraint | Column | Entity | Result |
| :--- | :--- | :--- | :--- |
| 1 Student → 1 FaceProfile | `student_id UNIQUE` | `FaceProfile` | ✅ |
| 1 FaceProfile → 1 Embedding | `profile_id UNIQUE` | `FaceEmbedding` | ✅ |

### Hibernate Vector Mapping
| Check | Value | Result |
| :--- | :--- | :--- |
| Field type | `float[]` | ✅ (not `double[]`) |
| Column definition | `vector(512)` | ✅ |
| `@Type` annotation required | No | ✅ (hibernate-vector handles natively) |
| Library | `org.hibernate.orm:hibernate-vector:6.6.49.Final` | ✅ |

### Lombok Usage
| Annotation | Applied To | Result |
| :--- | :--- | :--- |
| `@Getter` + `@Setter` | All mutable entities | ✅ |
| `@Getter` only | `FaceVerificationAttempt` (immutable) | ✅ (no `@Setter` — insert-only) |
| `@NoArgsConstructor` + `@AllArgsConstructor` + `@Builder` | All entities | ✅ |

## Final Decision
**PASS**
All four files are structurally correct, compile cleanly, and conform fully to the SDMS Modular Monolith architecture. The BaseEntity inheritance bug was identified and corrected during this review phase.
