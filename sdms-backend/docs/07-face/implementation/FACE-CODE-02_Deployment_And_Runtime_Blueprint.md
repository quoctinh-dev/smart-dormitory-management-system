> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-CODE-02: Deployment & Runtime Blueprint

## 1. Executive Summary
This document serves as the DevOps and Infrastructure blueprint for deploying the SDMS Face AI Service. Following `FACE-AI-03` and `FACE-CODE-01`, this blueprint enforces a Docker Compose (Primary), CPU-only architecture that integrates seamlessly into the SDMS Modular Monolith without violating isolated network boundaries.

---

## 2. Deployment Topology
The SDMS ecosystem relies on strict network partitioning.

*   **Public Internet:** 
    *   **Student App:** Connects to the API Gateway.
    *   **Admin Web:** Connects to the API Gateway.
*   **Private Overlay Network (Docker):**
    *   **API Gateway / Spring Boot Backend:** Orchestrates logic. The *only* component allowed to talk to the Face AI Service.
    *   **Face AI Service:** Fully isolated. Cannot access the internet, DB, or MQTT.
    *   **PostgreSQL (`pgvector`):** Stores embeddings. Accessible only by Spring Boot.
    *   **MQTT Broker:** Manages physical gate hardware. Accessible only by Spring Boot and IoT devices.

---

## 3. Docker Architecture
*   **Container Name:** `sdms-face-ai`
*   **Networks:** Attached strictly to `sdms-backend-network` (Internal Docker Bridge). No external ports (e.g., `8000:8000`) are mapped to the host machine unless debugging.
*   **Volumes:**
    *   `./models_weights:/app/models:ro` - Mounts the ONNX model files as Read-Only.
    *   *No persistent volume for data/state (Stateless container).*
*   **Restart Policy:** `restart: unless-stopped` to ensure automatic recovery upon host reboot or crash.

---

## 4. Environment Variables
To comply with 12-Factor App rules, configuration is passed via `docker-compose` `environment:` block.

*   **Required:**
    *   `API_KEY`: Secret string for Spring Boot authentication. (DO NOT HARDCODE).
    *   `MODEL_VERSION`: (e.g., `insightface-arcface-v1`) - Required per `AI-16` Freeze.
*   **Optional:**
    *   `LOG_LEVEL`: Default `INFO`.
    *   `WORKERS`: Default `1` (or tied to CPU core count).
    *   `MAX_IMAGE_SIZE_MB`: Default `5`.
*   **Forbidden:**
    *   `THRESHOLD`: Evaluated by Java, not Python.
    *   `DB_PASSWORD`: AI has no DB access.

---

## 5. Startup Sequence
To prevent orchestration failures, Docker Compose `depends_on` must dictate the boot sequence:

1.  **Database (`postgres-pgvector`) & MQTT Broker:** Base infrastructure boots first.
2.  **Face AI Service (`sdms-face-ai`):** Boots next. Model weights are eager-loaded into RAM during the FastAPI lifespan hook.
3.  **Spring Boot (`sdms-backend`):** Boots up. 
4.  **IoT Gates:** Hardware gates connect to MQTT once Spring Boot is ready to process messages.

**🚨 Governance Refinement (Startup Readiness):**
Docker Compose `depends_on` only guarantees that a container has *started*, it does NOT guarantee the application inside is *ready* to accept traffic. Therefore, **Spring Boot MUST actively check the AI Service's `/ready` endpoint** on startup (or implement retry logic) before enabling the Face Registration API for students.

---

## 6. Health Check Strategy
*   **`/health` (Liveness):** Evaluates if the Uvicorn HTTP server is responding. Docker Compose uses this to know if the container has crashed.
*   **`/ready` (Readiness):** *Governance Freeze:* Evaluates if the `.onnx` model has finished loading into RAM (checks a boolean state flag). **MUST NOT** perform dummy matrix inference to avoid CPU spikes during Docker polling.
*   **Container Recovery:** If `/health` fails 3 consecutive times (timeout `5s`), Docker Compose automatically restarts the container.

---

## 7. Resource Planning (CPU-Only)
Running ONNX Inference on CPU requires strict resource capping to prevent the AI from starving the PostgreSQL or Spring Boot containers on the same host.

*   **CPU:** Limit enforced via `deploy.resources.limits.cpus: "2.0"`. (2 dedicated logical cores is typically sufficient for 50-150ms extraction).
*   **RAM:** Limit enforced via `deploy.resources.limits.memory: "1G"`. The container will be OOMKilled if it exceeds this (mitigating Image Flooding memory leaks).
*   **Storage:** Minimal. The container image (~300MB) + mounted `.onnx` models (~150MB).
*   **Expected Throughput:** ~10-20 requests per second per container replica (varies by CPU architecture).

---

## 8. Observability
*   **Logs:** FastAPI and `structlog` must write JSON to `stdout`. Docker handles log rotation (e.g., `max-size: "10m"`).
*   **TraceId:** Extracts `X-Request-Id` injected by Spring Boot. Every log line must contain `{"trace_id": "..."}`.
*   **Metrics:** Prometheus scrapes the Python `/metrics` endpoint to chart `http_request_duration_seconds` and `onnx_inference_duration_seconds`.

---

## 9. Disaster Recovery
*   **Model Missing:** If `./models_weights` is empty or incorrectly mounted, FastAPI throws a fatal error during the `lifespan` hook. Container exits immediately (Fail Fast). Alert DevOps.
*   **Container Crash (OOM/Code Bug):** Docker Compose restarts the container. Stateful data is zero, so no corruption occurs. Smart Access Module returns "System Offline - Fail Closed" to the Gate until recovery.
*   **Disk Full:** The container generates no local files. Logging is piped to Docker stdout. Disk Full will not crash the AI Service directly.

---

## 10. Implementation Readiness

**DevOps Readiness Evaluation:**
*   **Topology:** Clear separation of public/private traffic.
*   **Docker Config:** Strict resource constraints, restart policies, and read-only mounts defined.
*   **Observability:** Distributed tracing and metrics defined.

**Final Decision: PASS** ✅

The Deployment & Runtime Blueprint is fully specified. The DevOps and Platform teams have a clear mandate for provisioning the `docker-compose.yml` infrastructure.

