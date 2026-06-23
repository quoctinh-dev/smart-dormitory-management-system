# Student Module Business & Architecture Documentation

## 1. Module Purpose
The Student Module in the Smart Dormitory Management System (SDMS) acts as the system of record for student profiles (residents). It maintains resident demographics, contact information, emergency contacts, academic details, dormitory check-in lifecycles, and security credentials such as profile pictures and facial recognition templates.

## 2. Bounded Context
The Student Module operates in the resident profile bounded context. It owns the lifecycle of dormitory residents from check-in preparation to post-graduation inactivation.
* **Aggregates Owned**:
  - `Student`: Represents the resident's core profile, academic data, avatar url, face integration attributes, and check-in lifecycle state.

---

## 3. Module Responsibilities
* **Profile Management**: Maintaining student personal, emergency contact, and academic department details.
* **Lifecycle Synchronization**: Advancing student status (from `PENDING_CHECKIN` to `ACTIVE`) in response to check-in completion.
* **Biometric Support (Face Registration)**: Hosting fields for facial recognition integration (`faceImageUrl`, `isFaceRegistered`) to enable secure biometric IoT access control.

---

## 4. Module Boundaries & Decoupling
To ensure domain separation and avoid context pollution:
* **Zero Cross-Module Writes**: The Student Module never modifies tables belonging to other modules (`DormitoryApplication`, `Room`, `Bed`, `StudentHousingAssignment`, `Bill`, `Payment`).
* **Zero Cross-Module Repository Injections**: The Student Module services do not inject repositories owned by other modules.
* **Event-Driven Integration**: Modularity is maintained by consuming and reacting to decoupled domain events (`CheckInCompletedEvent` $\rightarrow$ transitions `Student` to `ACTIVE`).
* **Database Separation**: Read and write transactions are strictly scoped to the `students` table.
