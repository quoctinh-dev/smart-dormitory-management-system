> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-AI-03: AI Runtime & Deployment Architecture Audit

## 1. Executive Summary
This document defines and freezes the operational, runtime, and deployment architecture for the SDMS Face AI Service. It serves to guarantee that the AI component is strictly a stateless compute utility, enforcing CPU-only scalability, robust observability, and ironclad security boundaries that comply fully with SDMS and ACCESS Governance.

**Overall Audit Result: PASS** ✅

---

## 2. AI Runtime Ownership Boundary
The AI Service is constrained to a strictly defined input-output contract. It is a "dumb" mathematical extractor with no business intelligence.

**Verified Ownership:**
* ✅ **Face Detection:** Locating the bounding box of a face within an image frame.
* ✅ **Face Alignment:** Normalizing the face crop based on key facial landmarks (eyes, nose, mouth).
* ✅ **Embedding Extraction:** Passing the aligned crop through the neural network to output a `float[512]` array.

**Strict Prohibitions:**
* ❌ Identity Verification (Similarity Search, `pgvector` querying).
* ❌ Access Decisions (Curfew, Student Status, Time Windows).
* ❌ Hardware Control (MQTT publishing).

---

## 3. Deployment Architecture
The AI Service is packaged as a lightweight, portable container.

* **Framework:** Python 3.10+ with **FastAPI** and Uvicorn for high-performance asynchronous REST endpoints.
* **Containerization:** Docker container based on an Alpine/Slim Linux image.
* **Runtime Engine:** **ONNX Runtime** (Open Neural Network Exchange).
* **Hardware Profile:** **CPU Only Deployment**.
  * *Verification:* No CUDA, TensorRT, or GPU dependencies are bundled. The `onnxruntime` (CPU version) library is strictly enforced over `onnxruntime-gpu`. This aligns with the Dormitory Scale architectural decision from FACE-AI-02 to maximize cost-efficiency.

---

## 4. Container Lifecycle & Model Loading
* **Startup Phase:** The FastAPI application initializes. Upon startup, it loads the InsightFace/ArcFace `.onnx` model weights directly into RAM. This happens exactly *once* during startup to prevent per-request I/O bottlenecks.
* **Readiness:** The container only marks itself as `Ready` after the `.onnx` model is fully loaded into memory (no dummy matrix calculation on each check).
* **Shutdown:** Graceful shutdown handles in-flight HTTP requests before terminating the Uvicorn worker.
* **Restart:** Managed entirely by orchestration restart policies. Primary Deployment: Docker Compose. Future Upgrade: Kubernetes (Optional).

---

## 5. Failure Recovery (Fail Closed)
All failures in the AI Service cascade cleanly to the Smart Access architecture under a **Fail Closed** strategy.

| Failure Scenario | AI Service Behavior | SDMS Backend Behavior (Face/Smart Access Module) |
| :--- | :--- | :--- |
| **FastAPI App Crash** | Container exits (Code 1), Docker restarts. | SDMS triggers Circuit Breaker. Gate denies access. "System Offline". |
| **Model Loading Failure** | Container fails readiness probe, loops restart. | SDMS routes traffic to healthy replicas. If all down, Gate denies access. |
| **Network Failure** | Connection dropped / Timeout. | SDMS catches TimeoutException. Gate denies access. |
| **Corrupt Image Input** | FastAPI returns `400 Bad Request`. | SDMS prompts student to "Please look at camera again". |

---

## 6. Observability
The AI Service exposes robust telemetry for infrastructure monitoring:

* **Health Endpoint:** `GET /health` (Returns `200 OK` if the FastAPI process is running).
* **Readiness Probe:** `GET /ready` (Returns `200 OK` only if the ONNX model is loaded in RAM and capable of inference).
* **Liveness Probe:** Monitored by the orchestrator via the `/health` endpoint.
* **Logging:** JSON-formatted stdout logs containing endpoint, processing duration (ms), and HTTP status.
* **Metrics:** Prometheus endpoint exposing API latencies and error rates.
* **TraceId:** Extracts `X-Request-Id`, `X-B3-TraceId`, or `traceparent` from incoming SDMS HTTP requests and propagates it into the logs to maintain distributed trace continuity.

---

## 7. Scalability
* **Stateless Runtime:** The container holds zero local state between requests. It holds no sessions, no caches of past images, and no memory of previous identifications.
* **Horizontal Scaling:** The service can be instantly replicated (e.g., `docker-compose up --scale face-ai=3`).
* **Load Balancing:** An Nginx Reverse Proxy sits in front of the AI containers, distributing HTTP POST requests via Round Robin or Least Connections.

---

## 8. Security Boundary Verification
The AI Service operates in a fully isolated network sandbox.

* ❌ **NO PostgreSQL Access:** The container does not contain `psycopg2` or any DB drivers. It has no network route to the SDMS PostgreSQL instance.
* ❌ **NO MQTT Access:** The container has no MQTT client libraries and no access to the IoT broker.
* ❌ **NO Student Data:** The payload contains only an image (bytes/URL) and a `traceId`. It never receives `studentId`, `name`, `Curfew`, or `Account Status`.
* ❌ **NO Access History:** It cannot read or write to `access_history`.

---

## 9. Governance Compliance Evidence Matrix

| Governance Rule | AI Service Design Implementation | Status |
| :--- | :--- | :--- |
| **AC-01 / FACE Boundary** | AI Service evaluates nothing. Outputs float arrays only. | ✅ PASS |
| **ACCESS Decision Rule** | No Authorization logic. No Curfew rules coded in Python. | ✅ PASS |
| **Stateless Microservice** | Container has no local DB, no persistent volumes. | ✅ PASS |
| **Fail Closed Strategy** | AI Timeout = Gate locked. Defaults to physical security. | ✅ PASS |
| **No DB Driver** | Python requirements.txt verified. No SQL libraries. | ✅ PASS |

---

## 10. Final Decision
**Decision: PASS** ✅

The AI Runtime and Deployment Architecture is officially audited and approved. The containerization strategy using FastAPI and CPU-optimized ONNX Runtime ensures a secure, scalable, and fully decoupled environment that respects all Modular Monolith boundaries. The system is ready for the Python implementation phase (`FACE-APP-01`).

