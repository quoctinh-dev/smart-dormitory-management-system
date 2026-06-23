> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-APP-01: FastAPI Face Engine Implementation Blueprint

## 1. Project Structure
The `face-ai-service` repository will follow a clean, modular structure optimized for FastAPI and AI workloads.

```text
face-ai-service/
├── app/
│   ├── api/          # FastAPI Routers (v1 controllers)
│   ├── core/         # Config, Application Lifespan, Exceptions
│   ├── middleware/   # TraceId, Request Logging, CORS
│   ├── models/       # Internal Domain Models (No DB entities)
│   ├── schemas/      # Pydantic DTOs for Request/Response Validation
│   ├── services/     # AI Pipeline Services (Detection, Alignment, Extraction)
│   └── utils/        # Image processing helpers (OpenCV wrappers)
├── docker/           # Dockerfiles, entrypoint scripts
├── requirements/     # Dependencies (`base.txt`, `prod.txt`, `test.txt`)
├── tests/            # Unit, Integration, Load tests
├── models_weights/   # Local directory for `.onnx` files (excluded from git)
└── main.py           # Application Entrypoint
```

---

## 2. Configuration Strategy
* **Environment Variables:** Application configuration is strictly 12-factor compliant, utilizing environment variables (with `.env` fallbacks for local dev).
* **Config Loading:** Use `pydantic-settings` (`BaseSettings`) for robust type validation of config values at startup.
* **Model Path Configuration:** Expose variables like `DETECTION_MODEL_PATH` and `RECOGNITION_MODEL_PATH` to point to the local `.onnx` files.
* **Runtime Configuration:** Variables for `MAX_IMAGE_SIZE_MB`, `WORKER_COUNT`, `LOG_LEVEL`, and `CORS_ORIGINS`.

---

## 3. Model Loading Strategy
Loading neural network weights is an expensive I/O operation.
* **Startup Initialization:** Models must be loaded into memory exclusively during the FastAPI `lifespan` context manager.
* **ONNX Runtime Loading:** Instantiate `onnxruntime.InferenceSession` with CPU execution providers (`CPUExecutionProvider`).
* **Singleton Model Lifecycle:** The initialized `InferenceSession` objects must be kept as Singletons in memory (attached to the application state or a dedicated Service Locator).
* **Recommendation (Eager Loading):** **Eager Loading** is strictly required. The model weights must be fully loaded into memory before the Uvicorn server binds to the port and accepts HTTP traffic. Lazy loading is forbidden to prevent latency spikes on the first request.

---

## 4. Request Processing Pipeline
The runtime sequence is strictly mathematical.

```text
Image Upload (URL or Base64)
       ↓
Face Detection (Locate bounding box)
       ↓
Face Alignment (Affine transform on eyes, nose, mouth)
       ↓
Embedding Extraction (ONNX Inference)
       ↓
float[512] (Raw Vector)
       ↓
API Response
```

**MANDATORY GOVERNANCE:** 
* ❌ No Similarity Search occurs here.
* ❌ No Threshold Evaluation occurs here.

---

## 5. Service Layer Structure
* **`FaceDetectionService`:** Wraps the detection model. Responsible for finding the highest-confidence face bounding box and 5 facial landmarks.
* **`FaceAlignmentService`:** Responsible for cropping the image to the bounding box and aligning the face using OpenCV affine transformations.
* **`EmbeddingExtractionService`:** Wraps the recognition model (e.g., ArcFace). Takes the aligned image and executes ONNX inference to produce the 512d embedding.
* **`HealthCheckService`:** Validates that the Singleton models are loaded in memory to guarantee readiness (without performing real/dummy inferences to avoid CPU spikes).

---

## 6. FastAPI Layer Structure
* **Controllers:** `POST /api/v1/ai/extract` (Core extraction), `GET /health` (Liveness), `GET /ready` (Readiness).
* **DTOs (Schemas):** 
  * `ExtractionRequest` (Image payload validation).
  * `ExtractionResponse` (Success flag, processing time, bounding box, `float[512]` embedding).
* **Validation:** Pydantic validators ensure images do not exceed size limits and are valid Base64/URLs.
* **Exception Handling:** Global FastAPI exception handlers (`@app.exception_handler`) to catch domain exceptions (e.g., `NoFaceDetectedException`, `MultipleFacesDetectedException`) and map them to clean HTTP 400 JSON responses.

---

## 7. Observability Design
* **Logging:** Use `structlog` for structured JSON logging to stdout.
* **TraceId:** Implement a custom FastAPI middleware that intercepts incoming SDMS HTTP requests. It extracts `X-Request-Id`, `X-B3-TraceId`, or `traceparent` and injects it into a ContextVar, binding it to every log emitted during that request lifecycle.
* **Metrics:** Use `prometheus-fastapi-instrumentator` to expose `/metrics` for monitoring API latency, throughput, and error rates.
* **Health Checks:** Native `/health` and `/ready` endpoints for Docker Compose probes (and Kubernetes readiness probes in future scaling phases).

---

## 8. Docker Structure
* **Dockerfile:** Multi-stage build based on `python:3.10-slim`. Installs `onnxruntime` (CPU variant) and system dependencies (e.g., `libglib2.0-0` for OpenCV).
* **docker-compose.yml:** Defines the standalone service for local development. Mounts the `models_weights/` directory as a volume.
* **Runtime Topology:** 
  * **CPU ONLY**.
  * No `onnxruntime-gpu` dependencies.
  * No CUDA drivers in the Dockerfile.
* **Orchestration Strategy:**
  * **Primary Deployment:** Docker Compose (Strictly enforce this to avoid premature optimization).
  * **Future Upgrade:** Kubernetes (Optional - DO NOT generate K8s manifests at this stage).

---

## 9. Testing Strategy
* **Unit Tests:** `pytest`. Mock the AI Service layer to test the API controllers, Pydantic validation, and Exception Handlers rapidly.
* **Integration Tests:** Use `TestClient` to test the full pipeline (from API request to `float[512]` response) using small, static test images.
* **Load Tests:** Use `Locust` to simulate concurrent requests, verifying that the CPU-only extraction maintains acceptable latency (e.g., < 200ms per request) under high throughput.

---

## 10. Sprint Plan
* **Sprint 1 (Foundation):** Repository initialization, Dockerfile setup, Pydantic Config layer, and base FastAPI/Uvicorn wiring.
* **Sprint 2 (AI Runtime):** ONNX Runtime integration, Singleton eager loading implementation, Detection/Alignment/Extraction Service logic.
* **Sprint 3 (API Exposure):** `POST /extract` endpoint, DTO validation, Custom Exception Mapping.
* **Sprint 4 (Observability & Hardening):** TraceId Middleware, JSON Logging, Prometheus integration, Integration Testing, and Load Testing.

---

## Final Output
**Development Sequencing:** Ready
**Dependency Map:** Verified against `FACE-AI-01`, `FACE-AI-02`, and `FACE-AI-03`.
**Status:** **PASS** ✅

*The Face AI Service Implementation Blueprint is approved and fully compliant with the Smart Access and SDMS Modular Monolith Governance. The Python development team is cleared to commence implementation.*

