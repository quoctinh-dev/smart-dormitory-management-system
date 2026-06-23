> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS Face Operational Recovery Design (v1.0)

## 1. AI Timeout
* **Scenario:** The Python AI Service takes > 3000ms to respond or drops the connection.
* **Recovery:** Spring Boot Circuit Breaker triggers. API immediately returns an error. Gate screen displays "System Offline - Use QR Code". Mode: **Fail-Closed**.

## 2. MQTT Failure
* **Scenario:** Spring Boot fails to publish the `UNLOCK` command to the Broker.
* **Recovery:** Spring Boot executes a synchronous retry (max 3 attempts). If still failing, logs a critical `MQTT_PUBLISH_FAILED` alert. No async retry queue is used because gate access is highly time-sensitive; a delayed unlock 5 minutes later is physically dangerous.

## 3. Database Failure
* **Scenario:** PostgreSQL connection pool exhausted during `pgvector` query.
* **Recovery:** Standard Spring `@Transactional` rollback. The Verification API returns `503 Service Unavailable`. Gate defaults to **Fail-Closed**.

## 4. Network Partition
* **Scenario:** The physical dormitory network is severed from the Cloud Backend.
* **Recovery:** The ESP32 detects MQTT disconnect. The camera/gate system enters Offline Mode. The system does NOT cache biometric vectors locally. Access strictly requires physical master keys or local bypass switches controlled by dormitory guards.

