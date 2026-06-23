# AUTH-MODULE-OVERVIEW

## Purpose
The Auth and User modules together act as the unified identity and access management (IAM) perimeter for the SDMS ecosystem. They enforce security policies, issue standard JWT tokens, and safeguard protected resources against unauthorized access.

## Responsibilities
- Validate credentials for both Staff (Admin Web) and Students (Public Web / App).
- Issue and manage lifecycle of stateless access tokens (JWT) and stateful refresh tokens.
- Handle student account activation via email and citizen ID (CCCD).
- Provide unified password recovery mechanisms.
- Provide "Who Am I" (`/me`) endpoints to frontend applications to establish context.

## Boundaries
- **Inbound:** Intercepts every HTTP request via Spring Security Filters to validate JWT.
- **Outbound:** Does not actively call other modules, but listens to student creation events to provision accounts (or delegates account creation to migration/admin scripts).

## Dependencies
- `security`: The core Spring Security configuration and JWT filter logic.
- `spring-boot-starter-mail`: For forgot-password / activation emails.
- `spring-boot-starter-data-redis` (Optional, depending on Refresh Token implementation): Typically used to blacklist tokens on logout.

## Owned Aggregates
- `UserAccount`: The root aggregate holding email, password hash, role, and active status.
- `RefreshToken`: Tracks active sessions and device contexts.

## Owned Events
- `UserRegisteredEvent` (Internal)
- `PasswordChangedEvent`
- `TokenRevokedEvent`

## Owned APIs
- `/api/v1/auth/*` (Login, Logout, Activate, Password Ops)
- `/api/v1/users/*` (Profile lookups)
