# FACE-VECTOR-COMPATIBILITY-REPORT

## 1. Detected Stack

| Component | Detected Value | Source |
| :--- | :--- | :--- |
| **Spring Boot Version** | `3.5.14` | `pom.xml` parent |
| **hibernate-core Version** | `6.6.49.Final` | Spring Boot 3.5.14 BOM (auto-managed) |
| **hibernate-vector Version** | `6.6.53.Final` | Manually declared in `pom.xml` |
| **Vector Library Selected** | `org.hibernate.orm:hibernate-vector` | See Section 3 |
| **io.github.pgvector in use** | ❌ Not present | Correctly absent |

## 2. Version Mismatch Warning

> [!WARNING]
> **Minor version skew detected between `hibernate-core` and `hibernate-vector`.**
>
> - `hibernate-core`: `6.6.49.Final` (governed by Spring Boot BOM)
> - `hibernate-vector`: `6.6.53.Final` (pinned manually in `pom.xml`)
>
> While Hibernate uses a compatible micro-versioning scheme, the safest practice is to align both artifacts to the **same patch version**. Since Spring Boot 3.5.14 manages `6.6.49.Final`, the recommended fix is to pin `hibernate-vector` to `6.6.49.Final` as well.

### Recommended Fix

In `pom.xml`, update the `hibernate-vector` declaration:

```diff
 <dependency>
     <groupId>org.hibernate.orm</groupId>
     <artifactId>hibernate-vector</artifactId>
-    <version>6.6.53.Final</version>
+    <version>6.6.49.Final</version>
 </dependency>
```

Alternatively, use the Spring Boot property override to unify the entire Hibernate suite:

```xml
<properties>
    <hibernate.version>6.6.49.Final</hibernate.version>
</properties>
```

## 3. Vector Library Selection Rationale

| Library | Status | Reason |
| :--- | :--- | :--- |
| `org.hibernate.orm:hibernate-vector` | ✅ **SELECTED** | Native Hibernate 6 integration. Ships as a first-party Hibernate ORM extension starting from `6.4.x`. Zero additional type annotations required — `float[]` maps directly to `vector(N)` column type. |
| `io.github.pgvector:pgvector-hibernate` | ❌ **REJECTED** | Third-party library. Designed for projects running Hibernate < 6.4 that cannot use the official extension. Not compatible with Hibernate 6.6 module system. |

## 4. Compatibility Verification

| Check | Result |
| :--- | :--- |
| Hibernate version ≥ 6.4 (minimum for `hibernate-vector`) | ✅ `6.6.49` passes |
| `hibernate-vector` present on compile classpath | ✅ Confirmed via `dependency:tree` |
| `io.github.pgvector` absent | ✅ Confirmed absent |
| `FaceEmbedding.vector` declared as `float[]` | ✅ Correct |
| `columnDefinition = "vector(512)"` set | ✅ Correct |
| `BUILD SUCCESS` after change | ✅ `21.199 s` — clean compile with 0 errors |

## 5. Final Decision
**PASS WITH FIXES**

The vector stack is correctly selected (`org.hibernate.orm:hibernate-vector`) and the build passes cleanly. However, the minor version skew between `hibernate-core` (`6.6.49.Final`) and `hibernate-vector` (`6.6.53.Final`) should be resolved before Flyway migration scripts are executed in production. Apply the `pom.xml` fix described in Section 2 to achieve full version alignment.
