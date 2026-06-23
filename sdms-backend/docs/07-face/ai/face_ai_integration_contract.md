> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS AI Integration & Face Engine Contract (v1.0)

This document standardizes the integration architecture, REST payloads, MQTT messages, and error handling contracts between the SDMS Spring Boot Backend, the stateless Face AI Engine, and the IoT Gate controllers.

---

## 1. Executive Summary

SDMS decouples business management from heavy neural network calculations by deploying a stateless Python-based **Face AI Engine**. The Spring Boot backend manages vector storage (`pgvector`) and access policies, while the AI service is strictly responsible for face detection, image alignment, and 512-dimension vector extraction.

---

## 2. Integration Architecture

* **Option B (Separate AI Service)** is selected.
* **Architecture Flow:**
  ```
  Camera Gate ──(HTTP/REST)──> SDMS Backend (IoT Module)
                                     │
                                     ▼ (Forward Image)
                               Face AI Service (FastAPI)
                                     │
                                     ▼ (Returns 512d Vector)
                                SDMS Backend (Face Module)
                                     │
                                     ▼ (pgvector Search & Tenancy Check)
                                MQTT Broker ──> ESP32 Gate Relay
  ```

---

## 3. AI Service Boundary

The **Face AI Service** is completely stateless:
* It does **not** connect to the database.
* It does **not** persist student data.
* It only accepts crop frames or image URLs, extracts the 512-dimension floating-point array (embedding), and returns it.

---

## 4. Face Registration Contract

When a student photo is approved by the Admin, SDMS requests embedding extraction.
* **REST Request (`POST /api/v1/ai/extract`):**
  ```json
  {
    "imageUrl": "https://cloudinary.com/sdms/faces/stud_123.jpg"
  }
  ```
* **REST Response (Success):**
  ```json
  {
    "success": true,
    "processingTimeMs": 142,
    "embedding": [0.0124, -0.0452, 0.0981, "... 512 float values"]
  }
  ```

---

## 5. Face Recognition Contract

During access validation, the gate camera sends the live captured frame to SDMS.
* **REST Request (`POST /api/v1/ai/verify-frame`):**
  ```json
  {
    "capturedImageUrl": "https://cloudinary.com/sdms/gate-captures/gate_1_xyz.jpg"
  }
  ```
* **REST Response (Success):**
  ```json
  {
    "success": true,
    "faceDetected": true,
    "boundingBox": [120, 80, 240, 240], -- [x, y, width, height]
    "embedding": [0.0145, -0.0423, 0.0975, "... 512 float values"]
  }
  ```

---

## 6. Match Result Contract

Once SDMS obtains the embedding vector from the AI Service, it performs similarity matches locally via `pgvector` and structures the result:
* `matchedProfileId` (UUID, identified student face profile)
* `similarityScore` (DOUBLE, Cosine Similarity calculated value)
* `isPassedThreshold` (BOOLEAN, matched status against target threshold)
* `processingTimeMs` (LONG, duration of the DB query and calculation)

---

## 7. Failure Handling Strategy

| Failure Scenario | Remediation & Handling | Log Status |
| :--- | :--- | :--- |
| **Face Not Found** | AI Service returns `faceDetected = false`. SDMS rejects gate access immediately. | `DENIED_NO_FACE_DETECTED` |
| **Ambiguous Match** | Similarity scores for Top 1 and Top 2 matches have a gap $< 0.05$. SDMS rejects access to prevent false openings. | `DENIED_AMBIGUOUS_MATCH` |
| **AI Service Offline / Timeout** | Spring Boot Circuit Breaker triggers. Gate remains locked. Log warning. | `ERROR_AI_SERVICE_UNAVAILABLE` |
| **Invalid Image Quality** | Low contrast or blur. AI returns error code. Gate prompts student to try again. | `ERROR_INVALID_IMAGE_QUALITY` |

---

## 8. MQTT Integration Contract

Upon successful validation, the IoT Module controls the hardware gate.
* **Topic:** `kts/gate/{gateId}/command`
* **JSON Command Payload:**
  ```json
  {
    "action": "UNLOCK",
    "durationMs": 3000,
    "transactionId": "8b3260c0-d3ea-44a6-8051-7f892a014902"
  }
  ```
* **Status Feedback (Topic: `kts/gate/{gateId}/status`):**
  ```json
  {
    "transactionId": "8b3260c0-d3ea-44a6-8051-7f892a014902",
    "status": "COMPLETED",
    "deviceTemperature": 42.5
  }
  ```

---

## 9. Gate Access Decision Flow

The business logic of gate opening is strictly kept in the **SDMS Spring Boot (Smart Access Module)**:
1. `pgvector` search locates matching `studentId` $\rightarrow$ verifies `isFaceRegistered = true`.
2. Smart Access Module queries `Student.status`, `UserAccount.status`, Curfew, and Time Window. Access is **only** granted if all policies pass.
3. Access is orchestrated via `AccessGrantedEvent` sent to the IoT Module.
4. IoT Module publishes `UNLOCK` to MQTT.

---

## 10. Scalability Analysis

* **Stateless Scaling:** The python Face AI Service can be scaled horizontally behind a Load Balancer (e.g. Nginx) with zero replication complexity.
* **Index Performance:** PostgreSQL `pgvector` HNSW indexes provide $O(\log N)$ search latency, making queries for 5,000+ residents run in under 5 milliseconds.

---

## 11. Final Architecture Decision

**FACE-04 FROZEN.** The integration contracts, REST interfaces, MQTT structures, and error fallback scenarios are officially finalized.

