# SDMS Face Integration & Event Architecture Design (v1.0)

This document standardizes the integration boundaries, event choreography, and failure flows for the Face Recognition Domain.

---

## 1. Face Event Inventory

* **FacePhotoUploadedEvent**: Ownership - Student Module
* **FaceProfileApprovedEvent**: Ownership - Face Module
* **FaceProfileRejectedEvent**: Ownership - Face Module
* **FaceProfileRevokedEvent**: Ownership - Face Module
* **FaceVerificationRequestedEvent**: Ownership - IoT Module
* **FaceMatchSuccessEvent**: Ownership - Face Module
* **FaceMatchFailedEvent**: Ownership - Face Module

---

## 2. Publisher / Consumer Matrix

| Event | Publisher | Consumer | Purpose | Business Trigger |
| :--- | :--- | :--- | :--- | :--- |
| `FacePhotoUploadedEvent` | Student | Face | Create/Update `PENDING_APPROVAL` profile | Student submits live capture |
| `FaceProfileApprovedEvent` | Face | Student, Notification | Update `isFaceRegistered=true`, Notify student | Admin validates photo |
| `FaceProfileRejectedEvent` | Face | Notification | Notify student to re-capture | Admin rejects photo |
| `FaceProfileRevokedEvent` | Face | Student, Notification, IoT | Update flag, Notify student, Clear edge cache | Admin manually revokes access |
| `FaceVerificationRequestedEvent` | IoT | Face | Request vector extraction and match | Gate camera captures frame |
| `FaceMatchSuccessEvent` | Face | Smart Access | Forward matched `studentId` for policy evaluation | Vector matches DB perfectly |
| `FaceMatchFailedEvent` | Face | Smart Access | Log failure / alert | No match or AI timeout |

---

## 3. Failure Flow Choreography

### 3.1 Rejected Flow
* **Action**: Admin rejects poor quality photo.
* **Choreography**: Face Module sets `status = REJECTED` $\rightarrow$ publishes `FaceProfileRejectedEvent(reason)` $\rightarrow$ Notification Module sends push notification to Student App.

### 3.2 Revoked Flow (FD-22 Compliant)
* **Action**: Admin revokes an already active profile (or student leaves the system).
* **Choreography**: Face Module sets `status = REVOKED` $\rightarrow$ **KEEPS** `FaceEmbedding` and `FaceVerificationHistory` intact (No Hard Delete) $\rightarrow$ publishes `FaceProfileRevokedEvent` $\rightarrow$ Student Module sets `isFaceRegistered = false` $\rightarrow$ Notification Module sends alert. (Note: Hard deletion is prohibited; data retention policy is deferred to Future Roadmap).

### 3.3 Re-Registration Flow (FD-21 Compliant)
* **Action**: Student uploads new photo after Rejection or Revocation.
* **Choreography**: Student Module publishes `FacePhotoUploadedEvent` $\rightarrow$ Face Module preserves the old profile (status `REVOKED`), old embedding, and history $\rightarrow$ creates a **NEW** `FaceProfile` record with status `REGISTERED/PENDING_APPROVAL` $\rightarrow$ Admin Review workflow re-starts. (Note: UPSERT and Overwriting are strictly prohibited).

### 3.4 AI Timeout / AI Failure Flow
* **Action**: IoT requests verification but AI Service (Python) is offline or times out.
* **Choreography**: Face Module catches `TimeoutException` (Circuit Breaker) $\rightarrow$ publishes `FaceMatchFailedEvent(reason=AI_OFFLINE)` $\rightarrow$ Smart Access Module logs failure $\rightarrow$ IoT Module displays "System Offline - Use QR Code".

---

## 4. Notification Integration Boundary

The Face Module strictly isolates itself from SMS, Email, or Firebase Cloud Messaging (FCM) configurations.
* Integration is purely event-driven.
* When a face is `REJECTED`, the `FaceProfileRejectedEvent(studentId, rejectionReason)` is fired.
* The **Notification Module** subscribes to this event (`@TransactionalEventListener`), looks up the FCM token, and handles the delivery asynchronously.

---

## 5. Smart Access Integration Boundary (Identity vs. Access)

Conforming to **FD-02**, Biometric Matching is NOT Authorization.
1. Gate camera publishes `FaceVerificationRequestedEvent(imageFrame)`.
2. Face Module interacts with AI Engine and queries `pgvector`.
3. If distance $\ge$ threshold, Face Module publishes `FaceMatchSuccessEvent(studentId)`.
4. **Smart Access Module** consumes the success event.
5. Smart Access Module evaluates business authorization: `Student.status == ACTIVE`, `UserAccount.status == ACTIVE`, Curfew, and Time Window.
6. Only if all policies pass, Smart Access Module publishes the `AccessGrantedEvent`, which the IoT Module consumes to publish the `UNLOCK` command to the physical MQTT topic.
