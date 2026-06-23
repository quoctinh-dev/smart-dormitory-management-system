> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS Face Runtime Architecture (v1.0)

## 1. Runtime Flow
The execution flow across physical and network boundaries is completely asynchronous:
1. **Camera (IoT Edge):** Captures physical frame and POSTs to `/api/v1/iot/gates/{deviceId}/verify`.
2. **Spring Boot (SDMS Backend):** Receives HTTP request, routes to `FaceRecognitionGateway`.
3. **Python AI Service:** Processes frame, extracts 512d vector, returns to Spring Boot.
4. **PostgreSQL (pgvector):** Spring Boot executes nearest-neighbor query.
5. **Spring Boot:** Evaluates Authorization (`Student.status == ACTIVE`).
6. **MQTT Broker:** Spring Boot publishes `UNLOCK` to topic.
7. **ESP32 (IoT Edge):** Consumes topic, triggers physical Relay, door unlocks.

## 2. Runtime Ownership
* **SDMS Backend (Java):** Owns business logic, HTTP thread pools, database connection pools, and orchestration state.
* **Face AI Service (Python):** Owns GPU/CPU compute execution for neural networks. Completely stateless.
* **MQTT Broker:** Owns message queueing, delivery retries, and IoT connection state.
* **ESP32:** Owns hardware interrupts, relay timing, and physical offline fail-safes.

## 3. Runtime Boundaries
* **Compute Boundary:** Neural network computation is physically segregated from Java heap space to prevent OutOfMemory crashes.
* **Network Boundary:** The SDMS Backend does NOT establish direct TCP connections to the ESP32. All downstream hardware communication MUST cross the MQTT Broker boundary.

