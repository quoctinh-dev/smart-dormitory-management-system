# SDMS Database Document Index

**Technical Role**: Lead Database Architect  
**Status**: **ACTIVE**  
**Last Updated**: 2026-06-21  

---

This index serves as the single entry point for all documentation related to the database evolution, architectural decisions, and future roadmap of the SDMS Modular Monolith.

## Core Database Documentation

1. **Evolution & History**
   * [Database Evolution History](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/00-overview/database_evolution_history.md)
   * Tracks migrations V1 through V18, mapping epochs, objectives, and technical debt.

2. **Architectural Decisions**
   * [Database Architecture Decision Records (ADR)](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/09-architecture/database_architecture_decision_record.md)
   * Provides the rationale for intentional denormalization, cross-domain foreign keys, data duplication, and the global UUID strategy.

3. **Future Extension Roadmap**
   * [Database Future Roadmap](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/08-integration/database_future_roadmap.md)
   * Outlines the schema strategy for upcoming integrations including Face AI, IoT Access Control, Utility Billing, and Maintenance.

## Audits & Validation

* [Master ERD Database Consistency Audit](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/master_erd_database_consistency_audit.md)
  * Comprehensive review of all JPA entities against active Flyway schemas.

* [Legacy Database Design (Archived)](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/11-legacy/DATABASE_DESIGN.md)
  * Outdated reference schema provided for historical context only. Do not use for current development.
