# SMART-ACCESS-REMEDIATION-01: Package Structure Alignment Report

## 1. Executive Summary
This document outlines the remediation plan to align the Smart Access module with the core SDMS backend architecture. The package base `vn.edu.iuh.sdms.smartaccess` will be entirely refactored to `com.sdms.backend.modules.smartaccess` to ensure unified compilation, standardized import trees, and cohesive monolithic integration. **No business logic, DB schemas, or security rules are altered during this process.**

---

## 2. Package Migration Plan
The physical directory structure `src/main/java/...` must be relocated.

**From:**
`src/main/java/vn/edu/iuh/sdms/smartaccess/`

**To:**
`src/main/java/com/sdms/backend/modules/smartaccess/`

**Target Sub-Package Topology:**
*   `com.sdms.backend.modules.smartaccess.api.controller`
*   `com.sdms.backend.modules.smartaccess.api.request`
*   `com.sdms.backend.modules.smartaccess.api.response`
*   `com.sdms.backend.modules.smartaccess.application.service`
*   `com.sdms.backend.modules.smartaccess.application.strategy`
*   `com.sdms.backend.modules.smartaccess.application.port`
*   `com.sdms.backend.modules.smartaccess.application.mapper`
*   `com.sdms.backend.modules.smartaccess.domain.entity`
*   `com.sdms.backend.modules.smartaccess.domain.enums`
*   `com.sdms.backend.modules.smartaccess.domain.repository`
*   `com.sdms.backend.modules.smartaccess.event.inbound`
*   `com.sdms.backend.modules.smartaccess.event.outbound`
*   `com.sdms.backend.modules.smartaccess.event.listener`
*   `com.sdms.backend.modules.smartaccess.security`
*   `com.sdms.backend.modules.smartaccess.infrastructure`

---

## 3. Import Migration Plan
A global Find & Replace must be executed across all `.java` files within the module.

**Target Execution:**
*   **Search:** `package vn.edu.iuh.sdms.smartaccess`
*   **Replace:** `package com.sdms.backend.modules.smartaccess`
*   **Search:** `import vn.edu.iuh.sdms.smartaccess`
*   **Replace:** `import com.sdms.backend.modules.smartaccess`

**Specific Refactoring Targets:**
1.  All `domain.entity` and `domain.enums` files.
2.  All `domain.repository` files.
3.  All `application.service` and `application.strategy` files.
4.  All `event` payload and listener files.
5.  All `api.controller` files.
6.  All `security` configuration files.
7.  All `src/test/java/` files.

---

## 4. Dependency & Module Integration Validation

### 1. Spring Component Scan
Because the new package `com.sdms.backend.modules.smartaccess` is nested safely under the main `com.sdms.backend` root, the primary Spring Boot application class (`@SpringBootApplication`) will automatically detect and register all `@Service`, `@Component`, `@RestController`, and `@Repository` beans. No explicit `@ComponentScan` overrides are required.

### 2. JPA Entity Scan
Similarly, `@EntityScan` and `@EnableJpaRepositories` at the root application class will natively cascade into the `modules/smartaccess/domain` boundaries, ensuring Hibernate initializes `AccessHistory` and `CurfewPolicy` without configuration drift.

### 3. Port & Anti-Corruption Layer Integration
The `StudentQueryPort` remains isolated in `application.port`. The actual concrete implementation (`StudentQueryAdapter` or similar) can safely reside in `infrastructure` or be fulfilled by the core `student` module via Spring DI, cementing the Modular Monolith architecture.

---

## FINAL DECISION
**Status: PASS** ✅

The package alignment plan is structurally sound. It strictly honors the "No Business Changes" constraint while perfectly conforming to the pre-existing SDMS standard package layout. The codebase is cleared for immediate file relocation and import string replacement.
