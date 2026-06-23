# SDMS AI & IOT BLUEPRINT
**Version:** 1.0 · **Date:** 2026-06-22

This blueprint defines the architecture for physical hardware integration (IoT) and AI Face Recognition in the SDMS project.

---

## 1. AI KNOWLEDGE BASE (FACE RECOGNITION)

### 1.1 Current State vs Target State
- **Current State:** The PostgreSQL database is configured with `pgvector` (512 dimensions). The `face_profiles` and `face_embeddings` tables exist. Web Admin can approve face photos.
- **Target State:** An external Python AI Service is required to compute the 512-dim vector from an image, and to compare live camera frames against stored vectors.

### 1.2 Face Recognition Pipeline
1. **Enrollment:** 
   - Student uploads a photo via Web/App to Cloudinary.
   - Admin approves the photo in the Web Portal.
   - Backend dispatches a request to the Python AI Service.
   - Python AI Service runs a model (e.g., FaceNet/InsightFace) and returns a 512-float array.
   - Backend saves the array into `face_embeddings.vector`.
2. **Verification:**
   - Live frame captured by ESP32 IP Camera.
   - Frame routed to Python AI Service to extract the vector.
   - Backend runs a pgvector `HNSW` Cosine Similarity query against the database.
   - If distance < Threshold, verification is successful.

### 1.3 Vector Search Query Design
```sql
SELECT profile_id, vector <=> :liveVector AS distance
FROM face_embeddings
ORDER BY distance ASC
LIMIT 1;
```

---

## 2. IOT KNOWLEDGE BASE (SMART ACCESS GATES)

### 2.1 Hardware Architecture (Target)
- **Controller:** ESP32
- **Sensors:** OV2640 Camera Module (Face), RC522 (RFID)
- **Actuator:** 12V Relay connected to Magnetic Door Lock
- **Comms:** Wi-Fi module communicating via MQTT protocol

### 2.2 MQTT Network Design
An MQTT Broker (e.g., Mosquitto) sits between the ESP32 network and the Spring Boot backend.

**Topic Definitions:**
- `sdms/gate/{gateId}/verify` (ESP32 → Backend)
- `sdms/gate/{gateId}/decision` (Backend → ESP32)
- `sdms/gate/{gateId}/override` (Admin → ESP32)
- `sdms/gate/{gateId}/heartbeat` (ESP32 → Backend)

### 2.3 Payload Contracts

**ESP32 Requesting Verification:**
```json
{
  "gateId": "gate-A-main",
  "method": "FACE_AI",
  "studentId": "uuid", 
  "rfidUid": "A1:B2:C3:D4",
  "timestamp": "2026-06-22T08:00:00Z",
  "messageId": "unique-uuid-for-deduplication"
}
```

**Backend Decision Response:**
```json
{
  "decision": "GRANTED",
  "reason": "OK",
  "method": "FACE_AI",
  "timestamp": "2026-06-22T08:00:01Z"
}
```

### 2.4 Simulation Strategy (Demo Path)
Because physical hardware is currently unprocured:
1. Setup a local `Mosquitto` broker.
2. Write a Python script (`iot_simulator.py`) using `paho-mqtt` to publish JSON payloads to `sdms/gate/sim/verify`.
3. The Spring Boot backend MQTT listener processes the message and issues a `GRANTED`/`DENIED` log to `access_history`.
4. The Python script subscribes to `sdms/gate/sim/decision` to simulate the door opening (print to console).
