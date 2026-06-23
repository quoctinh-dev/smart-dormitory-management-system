# SDMS-STACK-FREEZE-01: Mandatory Technology Stack

> [!IMPORTANT]
> This document supersedes all previous stack assumptions.
> All future code generation must strictly follow this specification.

## 1. Frozen Stack

| Layer | Technology | Version (Runtime) |
| :--- | :--- | :--- |
| **Runtime** | Java | 17 |
| **Framework** | Spring Boot | `3.5.14` |
| **Web** | Spring Web (Tomcat) | `3.5.14` (BOM) |
| **Persistence** | Spring Data JPA | `3.5.11` (BOM) |
| **ORM** | Hibernate Core | `6.6.49.Final` (BOM) |
| **Vector** | Hibernate Vector | `6.6.49.Final` (pinned, aligned to BOM) |
| **Database** | PostgreSQL Driver | BOM-managed |
| **Migration** | Flyway Core + PostgreSQL | `11.7.2` (BOM) |
| **Security** | Spring Security | `6.5.10` (BOM) |
| **JWT** | JJWT API / Impl / Jackson | `0.12.5` |
| **Storage** | Cloudinary HTTP44 | `1.33.0` |
| **Validation** | Spring Validation (Hibernate Validator) | `8.0.3.Final` (BOM) |
| **Utilities** | Lombok | `1.18.46` (BOM) |
| **Scheduler** | ShedLock (Spring + JDBC) | `5.16.0` |
| **Excel** | Apache POI OOXML | `5.2.5` |
| **API Docs** | SpringDoc OpenAPI WebMVC UI | `2.8.5` |
| **Env Config** | spring-dotenv | `4.0.0` |
| **Testing** | spring-boot-starter-test | BOM |
| **Testing** | spring-security-test | BOM |
| **Testing** | Testcontainers (JUnit5 + PostgreSQL) | BOM |

## 2. Allowed Dependencies

### Persistence
- `spring-boot-starter-data-jpa`
- `org.postgresql:postgresql`
- `org.hibernate.orm:hibernate-vector` *(pinned to `6.6.49.Final` matching hibernate-core)*

### Security
- `spring-boot-starter-security`
- `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson` (version `0.12.5`)

### Validation
- `spring-boot-starter-validation`

### Storage
- `com.cloudinary:cloudinary-http44` (version `1.33.0`)

### Migration
- `org.flywaydb:flyway-core`
- `org.flywaydb:flyway-database-postgresql`

### Utilities (already present, permitted)
- `org.projectlombok:lombok`
- `net.javacrumbs.shedlock:shedlock-spring` + `shedlock-provider-jdbc-template`
- `org.apache.poi:poi-ooxml`
- `org.springdoc:springdoc-openapi-starter-webmvc-ui`
- `me.paulschwarz:spring-dotenv`

### Testing
- `spring-boot-starter-test`
- `spring-security-test`
- `org.testcontainers:junit-jupiter`
- `org.testcontainers:postgresql`

## 3. Forbidden Dependencies

> [!CAUTION]
> Introducing any of the following will cause an immediate architectural violation.

| Artifact | Reason |
| :--- | :--- |
| `io.github.pgvector:pgvector-hibernate` | Superseded by `org.hibernate.orm:hibernate-vector` |
| `io.github.pgvector:pgvector-java` | Not required; native JDBC casting is used |
| `com.vladmihalcea:hibernate-types` | Superseded by Hibernate 6 native type system |
| `com.querydsl:querydsl-*` | Not approved; use Spring Data JPA + native queries |
| `org.mapstruct:mapstruct` | Not approved; use manual mappers or Lombok |

## 4. pom.xml Compliance Audit

Audit performed via `mvnw dependency:list -DincludeScope=compile` against the live build.

| Check | Result |
| :--- | :--- |
| `hibernate-core` version | ✅ `6.6.49.Final` |
| `hibernate-vector` version | ✅ `6.6.49.Final` (aligned after `FACE-VECTOR-COMPATIBILITY-REPORT`) |
| `pgvector-hibernate` present | ✅ **ABSENT** |
| `pgvector-java` present | ✅ **ABSENT** |
| `hibernate-types` present | ✅ **ABSENT** |
| `querydsl` present | ✅ **ABSENT** |
| `mapstruct` present | ✅ **ABSENT** |
| Spring Boot version | ✅ `3.5.14` |
| Java target | ✅ `17` |
| Flyway version | ✅ `11.7.2` |

## 5. Code Generation Rules

All future code generation must enforce:

1. **No inline `@Type` annotations** for vector fields — `float[]` with `columnDefinition = "vector(512)"` is sufficient with `hibernate-vector`.
2. **No `@MappedSuperclass` duplication** — use the shared `BaseEntity` already present in the codebase.
3. **No `@Mapper` from MapStruct** — hand-written mapper classes only.
4. **No `QueryDSL` predicates** — Spring Data derived queries or `@Query` with JPQL/native SQL only.
5. **No cross-module `@Repository` injection** — cross-module reads go through dedicated port interfaces (e.g. `StudentQueryPort`).

## Final Decision
**PASS**
The live build dependency tree is 100% compliant with the frozen stack. No forbidden dependencies detected. This stack is now the single source of truth for all SDMS code generation phases.
