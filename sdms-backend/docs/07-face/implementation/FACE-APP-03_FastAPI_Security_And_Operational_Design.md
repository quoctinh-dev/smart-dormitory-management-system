> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-APP-03: FastAPI Security & Operational Design Audit

## 1. Threat Model
The Face AI Service processes potentially untrusted image inputs from the gate environment and student app. The threat vectors and mitigations are as follows:

*   **API Abuse & Brute Force:** Attackers attempting to overload the embedding endpoint. Mitigated by strict internal networking and API keys.
*   **Image Flooding (Pixel Bombs):** Malicious, ultra-high-resolution images designed to cause Out-of-Memory (OOM) errors. Mitigated by strict 5MB payload limits and image dimension checks before decoding.
*   **SSRF (Server-Side Request Forgery):** Providing a malicious internal URL (e.g., `http://169.254.169.254/`) in `imageUrl`. Mitigated by the FACE-APP-02A governance rule: Only internal Pre-Signed URLs or `imageBase64` are permitted.
*   **Container Escape:** Exploiting an underlying vulnerability in the ONNX Runtime or C++ libraries to gain host access. Mitigated by running the Docker container as a non-root user (`USER appuser`) and mounting the filesystem as read-only where possible.
*   **Resource Exhaustion:** Overwhelming the CPU with parallel matrix multiplications. Mitigated by hard CPU limits and concurrency caps.

---

## 2. Network Security
The AI Service is a private infrastructure component. It must **never** be exposed directly to the internet.

*   **Internal Network Only:** The service must be deployed exclusively within a private Docker overlay network or VPC subnet.
*   **Docker Network Isolation:** The AI Service container shares a bridge network only with the SDMS Spring Boot backend (and optionally an internal Nginx proxy). It has no exposed external ports.
*   **Allowed Callers:** Only the **SDMS Spring Boot Backend** (specifically the Face Module) is authorized to call this service.
*   **Forbidden Callers:** Direct calls from the KTX Gates (IoT devices), Student Mobile App, or Admin Frontend are strictly prohibited.

---

## 3. API Security
*   **Internal Service Authentication:** Even within the private network, service-to-service calls must be authenticated.
*   **API Key Strategy & Rotation Policy:** The SDMS Backend must pass an internal API Key (e.g., via the `X-API-Key` header). **Governance Freeze:** The API Key MUST be injected via Environment Variables (`ENV`) and MUST NOT be hardcoded in the source code. This ensures the key can be seamlessly rotated via Docker Compose secrets without rebuilding the image.
*   **Request Validation:** Strict Pydantic models. Any request missing required fields, or providing invalid combinations (e.g., both URL and Base64) is immediately rejected with HTTP 400.
*   **Payload Validation:** Base64 strings must be valid; URLs must match an explicit whitelist of allowed domains (e.g., specific AWS S3 buckets or Cloudinary domains).

---

## 4. Rate Limiting
To prevent "noisy neighbor" issues and protect the CPU cluster.

*   **Per Service Level:** Spring Boot `FaceRecognitionGateway` must implement Resilience4J Rate Limiters/Bulkheads before even forwarding requests.
*   **Per Instance Level:** The FastAPI service itself must enforce concurrency limits (e.g., `uvicorn --limit-concurrency 50`) to drop excess traffic gracefully with `503 Service Unavailable` rather than crashing.
*   **Protection Strategy:** Rate limit failures trigger a "Fail Closed" state, denying physical access to the gate without taking down the server.

---

## 5. Timeout Policy
Strict timeouts guarantee that a stuck ONNX process doesn't cause a traffic pileup.

*   **Connect Timeout:** `50ms` (since they are in the same local network).
*   **Request/Read Timeout:** `1000ms`. The Spring Boot backend will abort the connection if the AI service takes longer than 1 second to return the `float[512]` array.
*   **Inference Timeout:** Internal Python logic must wrap the `InferenceSession.run()` call to ensure it aborts if processing stalls.

---

## 6. Resource Governance
Because the service uses **CPU-Only Deployment**, resource ceilings are mandatory.

*   **CPU Limits:** Docker must cap the container (e.g., `cpus: "2.0"`). `onnxruntime` threading options (`sess_options.intra_op_num_threads`) must be configured to match this limit to avoid context-switching overhead.
*   **Memory Limits:** Docker memory limit set to `1GB` (or `2GB` depending on model size) per replica. If the container exceeds this, it is OOMKilled and restarted automatically.
*   **Concurrency Limits:** Uvicorn concurrency limits must align with the CPU thread count.
*   **Queue Protection:** Uvicorn backlog settings (`--backlog`) limit the number of queued TCP connections.

---

## 7. Health Check Policy
*   **Startup Check:** Docker wait conditions delay routing until the service port is bound.
*   **Liveness Probe:** `GET /health` mapped to Docker Compose `healthcheck`. Returns `200 OK` instantly to indicate the event loop is alive.
*   **Readiness Probe:** `GET /ready`. Verifies the `.onnx` models are fully loaded in memory. **Governance Freeze:** The `/ready` endpoint MUST ONLY check the model state flag in memory. It MUST NOT perform a real/dummy matrix inference computation on every request. This prevents orchestrator polling (e.g., every 5s) from causing artificial CPU spikes and resource exhaustion. Traffic is only routed if `200 OK`.

---

## 8. Logging Policy
*   **Log Levels:** 
    *   `INFO` for request start, successful extraction, and request duration.
    *   `ERROR` for invalid payloads, ONNX crashes, or image processing failures.
*   **TraceId:** `X-Request-Id` or `X-B3-TraceId` headers must be intercepted by middleware and injected into `structlog` context variables.
*   **Correlation Strategy:** Every single log line emitted by the AI Service must be a JSON object containing the `trace_id`, enabling seamless cross-service tracing in ELK/Splunk alongside the Java backend logs.

---

## 9. Observability Policy
*   **Prometheus Metrics:** The `/metrics` endpoint exposes:
    *   `http_requests_total` (counter, tagged by endpoint and status)
    *   `http_request_duration_seconds` (histogram)
    *   `onnx_inference_duration_seconds` (histogram)
*   **Alert Conditions:** DevOps should configure alerts if:
    *   `5xx` error rate > 1%.
    *   99th percentile (`p99`) latency exceeds `500ms`.
    *   Container restart count > 3 within 15 minutes.
*   **Dashboard Requirements:** Grafana dashboards must be built around these standard RED (Rate, Errors, Duration) metrics.

---

## 10. Disaster Recovery
*   **Model Load Failure:** If the container fails to load the `.onnx` files from disk at startup, the app immediately throws a Fatal Error and exits. The orchestrator will retry.
*   **Container Restart:** Stateful sessions are forbidden. A restarted container is completely safe and instantly picks up new HTTP requests once ready.
*   **Dependency Failure:** Since the AI Service has no database connection and no MQTT dependency, the only external dependency is the caller (Spring Boot). The AI Service is inherently resilient.

---

## 11. Final Output & Implementation Readiness
**Implementation Readiness Evaluation:**
*   **Python Team:** Has clear boundaries for rate limiting, concurrency, exception wrapping, and `structlog` formatting.
*   **DevOps Team:** Has specific parameters for Docker configuration, resource limits, Prometheus scraping, and health checks.

**Final Decision: PASS** ✅

The FastAPI Security and Operational Design adheres to the highest standards of the SDMS Modular Monolith, establishing an ironclad, resilient, and highly observable environment.

