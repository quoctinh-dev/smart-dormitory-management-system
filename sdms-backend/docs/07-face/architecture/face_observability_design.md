> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS Face Observability Design (v1.0)

## 1. Logging
* **Format:** JSON logging (Logback) for aggregation in ELK/Datadog.
* **Traceability:** A unique `traceId` is generated at the Gate Verification API and passed in the headers to the Python AI Service to stitch cross-service logs together.

## 2. Audit Logging
* **Database:** `GateAccessLog` captures every attempt (Success, Reject, Error) with `deviceId`, `studentId`, `confidenceScore`, and `accessedAt`.
* **Administrative Audit:** `approvedBy` and `approvedAt` are immutably written during Face Registration.

## 3. Metrics
* **Prometheus Endpoints:** Spring Boot Actuator exposes `/actuator/prometheus`.
* **Key Metrics:** 
  - `face.verification.latency` (Histogram: time taken from API call to MQTT publish).
  - `ai.engine.latency` (Histogram: time spent in Python service).
  - `face.match.confidence` (Summary: tracking average matching scores to detect AI degradation).

## 4. Health Checks
* **SDMS Liveness/Readiness:** Standard Spring Boot `/actuator/health`.
* **AI Engine Health:** Python service exposes `/health`. SDMS Backend polls this to update Circuit Breaker state.
* **IoT Health:** Tracked via MQTT Telemetry topic. If LWT triggers or heartbeats stop for > 30s, the gate is marked `OFFLINE` in the SDMS dashboard.

