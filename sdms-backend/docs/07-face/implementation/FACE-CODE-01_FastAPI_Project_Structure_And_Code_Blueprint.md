> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-CODE-01: FastAPI Project Structure & Code Blueprint

## 1. Executive Summary
This document provides the definitive code blueprint and project scaffolding for the Python 3.12 FastAPI SDMS Face AI Service. It aligns with all prior governance freezes (`FACE-AI-01` through `FACE-UI-04`), ensuring the service operates purely as a secure, stateless mathematical extractor using ONNX Runtime.

---

## 2. Project Structure
The repository will be structured to maximize separation of concerns.

```text
face-ai-service/
├── app/
│   ├── api/            # FastAPI Routers (v1 controllers)
│   │   ├── dependencies.py # API Key validation
│   │   ├── routes.py       # Endpoint definitions
│   ├── config/         # Environment variables (pydantic BaseSettings)
│   ├── middleware/     # TraceId extraction and structlog injection
│   ├── models/         # Internal domain objects (e.g., AlignedFace, InferenceResult)
│   ├── schemas/        # Pydantic Request/Response DTOs
│   ├── services/       # Core business logic
│   │   ├── detection.py  # Bounding box & landmarks (InsightFace)
│   │   ├── alignment.py  # Affine transformations
│   │   ├── extraction.py # ArcFace ONNX inference -> float[512]
│   └── main.py         # Application entrypoint & Lifespan events
├── tests/              # Pytest suite (unit, integration, load)
├── docker/             # Docker deployment assets
│   ├── Dockerfile
│   └── docker-compose.yml
└── requirements.txt    # CPU-bound dependencies
```

---

## 3. Request Flow Pipeline
The core extraction logic strictly follows a unidirectional mathematical flow.

1. **Image Reception:** `POST /api/v1/face/extract`. Payload parsed via Pydantic.
2. **Validation:** Ensure image is valid Base64 (Internal URLs must be downloaded securely if used, adhering to SSRF rules). Max 5MB.
3. **Face Detection (InsightFace):** Scans the image. If faces $\neq 1$, throw `HTTP 400`. Extracts Bounding Box and 5 Landmarks.
4. **Face Alignment:** Normalizes the crop based on landmarks.
5. **Embedding Extraction:** Aligned tensor passes through the ONNX ArcFace model.
6. **Response:** Returns `float[512]`.

*(Governance Enforcement: Similarity Search and Identity Verification are explicitly omitted from this pipeline.)*

---

## 4. DTO Design (Schemas)
All DTOs are built using Pydantic `BaseModel` for automatic FastAPI documentation and validation.

*   **EmbeddingRequest:**
    *   `imageBase64` (str, optional): Base64 encoded JPEG/PNG.
    *   `imageUrl` (str, optional): Must be an internal pre-signed URL.
*   **EmbeddingResponse:**
    *   `success` (bool): `True`
    *   `message` (str): `"Extraction successful"`
    *   `data`:
        *   `embedding` (List[float]): Length 512.
        *   `boundingBox` (List[int]): `[x, y, w, h]`.
        *   `confidence` (float): Diagnostic only.
        *   `processingTimeMs` (int)
        *   `modelVersion` (str): E.g., `"insightface-arcface-v1"`. **Governance Freeze (AI-16):** The Python AI Service is the absolute owner of the `modelVersion` value. It MUST dynamically inject its current model version into every response. The Java backend MUST save this exact string alongside the `float[512]` vector in `student_face_embeddings` to guarantee future side-by-side migration compatibility.
*   **ErrorResponse:**
    *   `success` (bool): `False`
    *   `errorCode` (str): E.g., `ERR_MULTIPLE_FACES`
    *   `message` (str)
*   **HealthResponse:**
    *   `status` (str): `"UP"` or `"READY"`

---

## 5. Configuration Design
Utilizing `pydantic-settings` to enforce 12-Factor App rules.

*   `ENVIRONMENT`: `dev` | `prod`
*   `API_KEY`: Secret string required in `X-API-Key` headers.
*   `MODEL_DIR`: Absolute path to `.onnx` weight files.
*   `MAX_IMAGE_SIZE_MB`: Enforced at 5MB.
*   `INFERENCE_TIMEOUT_MS`: e.g., `1000`.

**🚨 GOVERNANCE WARNING (THRESHOLD):**
The prompt requested designing a "Threshold" config. Per `FACE-AI-02` and `FACE-APP-01`, **Threshold logic is strictly forbidden in the AI Service**. The AI Service does not evaluate thresholds (e.g., $\ge 0.60$). Thresholds belong entirely to the Java Face Module. No threshold config will exist in this Python app.

---

## 6. Logging Design
*   **TraceId & RequestId:** A custom FastAPI middleware intercepts `X-Request-Id` or `X-B3-TraceId` from the incoming Java request.
*   **Structured Logs:** `structlog` is used. Every log line is formatted as JSON and injected with `{"trace_id": "..."}` via ContextVars.
*   **Metrics:** `prometheus-fastapi-instrumentator` exposes RED metrics on `/metrics`.

---

## 7. Health Check Design
Crucial for Docker Compose stability and Zero-Downtime scaling.

*   `GET /health`: **Liveness Probe.** Returns `{"status": "UP"}` immediately if the Uvicorn event loop is active.
*   `GET /ready`: **Readiness Probe.** Returns `{"status": "READY"}` only if the `InferenceSession` for the ONNX models has fully loaded into RAM during the FastAPI `lifespan` hook. *Per `FACE-APP-03`, this endpoint checks a memory flag, it does NOT compute a dummy matrix to avoid CPU spikes.*

---

## 8. Docker Design
*   **Dockerfile:** Multi-stage build. Uses `python:3.12-slim`. Installs `onnxruntime` (CPU variant) and `libglib2.0-0` (for OpenCV). Runs under a non-root `appuser`.
*   **docker-compose.yml:** Serves as the **Primary Deployment** environment. Mounts model weights as a read-only volume. Sets hard limits on `deploy.resources.limits.cpus`.

---

## 9. Testing Strategy
*   **Unit Test (`pytest`):** Mock the ONNX inference layer to rapidly test Pydantic validation (e.g., mutually exclusive Base64/URL inputs, size limits) and API Exception handlers.
*   **Integration Test (`TestClient`):** Bootstraps the full FastAPI app with the real `.onnx` models, passing a static test image and verifying the output is exactly 512 dimensions.
*   **Performance Test (`Locust`):** Simulates 50-100 concurrent POST requests against the container to ensure CPU threads stabilize and timeouts (Fail Fast) trigger gracefully under load.

---

## 10. Implementation Readiness

**Readiness Assessment:**
*   **Python Architecture:** Fully mapped. The directory structure and Pydantic schemas align perfectly with the Integration Contracts (`FACE-UI-04`).
*   **Governance Check:** Successfully identified and neutralized the architectural risk regarding "Thresholds" being placed in Python.

**Final Decision: PASS** ✅

The FastAPI Code Blueprint is complete and officially cleared for immediate programming execution.

