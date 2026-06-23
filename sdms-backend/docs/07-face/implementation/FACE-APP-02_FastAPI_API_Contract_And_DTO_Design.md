> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-APP-02: FastAPI API Contract & DTO Design Audit

## 1. API Ownership Audit
This section explicitly defines the strict functional boundaries of the FastAPI application.

* **Input Responsibility:** The API is responsible ONLY for receiving raw image data, either via a public/pre-signed URL or a Base64 encoded string.
* **Output Responsibility:** The API is responsible ONLY for returning the geometric coordinates of the detected face (Bounding Box) and the computed mathematical feature vector (`float[512]`).
* **Runtime Boundary:** The API operates entirely in-memory. It does **NOT** query PostgreSQL, does **NOT** compute vector distances against stored profiles, does **NOT** evaluate Curfew rules, and does **NOT** communicate with MQTT brokers.

---

## 2. API Inventory
The AI Service exposes a minimal, highly cohesive set of endpoints.

| Endpoint | Method | Purpose | Justification |
| :--- | :--- | :--- | :--- |
| `/api/v1/face/extract` | `POST` | Executes Detection, Alignment, and Extraction. | Core domain function of the AI Service. |
| `/health` | `GET` | System Liveness Probe. | Required by Docker Compose/Orchestrators to verify the web server is running. |
| `/ready` | `GET` | System Readiness Probe. | Required to ensure traffic is only routed when the ONNX models are fully loaded into memory. |
| `/metrics` | `GET` | Prometheus Telemetry. | Exposes latencies and error rates for infrastructure monitoring. |

*No other endpoints are permitted. Creating endpoints for `/api/v1/face/match` or `/api/v1/face/verify` is strictly forbidden as it violates the boundary of the Smart Access and Face Modules.*

---

## 3. Request DTO Design
### `ExtractionRequest`

**Fields:**
* `imageUrl` (String, Optional)
* `imageBase64` (String, Optional)

**Validation Rules:**
* **Mutual Exclusivity:** Exactly one of `imageUrl` or `imageBase64` MUST be provided. If both or neither are provided, return `400 Bad Request`.
* **Image Size Limits:** The decoded image or downloaded payload must not exceed `5MB`.
* **Supported Formats:** Validated via mime-type or file signature for `JPEG`, `JPG`, `PNG`.
* **Image Input Governance (SSRF Prevention):** Production mode MUST NOT download arbitrary public URLs. Allowed formats are `imageBase64` and internal Pre-Signed URLs. External URL fetching and public internet image downloading are strictly forbidden to prevent Server-Side Request Forgery (SSRF) vulnerabilities.

---

## 4. Response DTO Design
### `ExtractionResponse`

**Required Fields:**
* `success` (Boolean): Always `true` on 200 OK.
* `embedding` (Array of Floats): Exactly 512 floating-point numbers representing the facial features.

**Optional Fields:**
* `boundingBox` (Array of Integers): `[x, y, width, height]` indicating where the face was found.
* `confidence` (Float): The internal confidence score of the face detection model (e.g., `0.99`). **Governance Freeze:** `confidence` is Diagnostic Metadata only. It MUST NOT be used by the Frontend, Smart Access, or Authorization Logic. Identity decisions remain strictly inside the Face Module, and Access decisions remain strictly inside the Smart Access Module.

**Processing Metadata:**
* `processingTimeMs` (Integer): Total execution time of the ONNX pipeline.
* `modelVersion` (String): The exact version of the model used (e.g., `"insightface-buffalo-l-v1"`).

---

## 5. Error Contract
Standardized error mapping to ensure the Spring Boot backend can accurately parse failures.

| Error | HTTP Status | Error Code | Description |
| :--- | :--- | :--- | :--- |
| **NoFaceDetected** | `400 Bad Request` | `ERR_NO_FACE` | The detection model found 0 faces in the image. |
| **MultipleFacesDetected** | `400 Bad Request` | `ERR_MULTIPLE_FACES` | The model found >1 face. To prevent security bypasses, extraction is aborted. |
| **InvalidImage** | `400 Bad Request` | `ERR_INVALID_IMAGE` | Corrupt Base64 string, unreachable URL, or unsupported image format. |
| **ImageTooLarge** | `413 Payload Too Large` | `ERR_IMAGE_TOO_LARGE` | The image payload exceeds the 5MB strict limit. |
| **ModelUnavailable** | `503 Service Unavailable`| `ERR_MODEL_UNAVAILABLE` | The ONNX Runtime failed to load or crashed during inference. |
| **InternalError** | `500 Internal Server Error`| `ERR_INTERNAL_SERVER` | Unhandled exception within the Python runtime. |

**Error Response Structure:**
```json
{
  "success": false,
  "errorCode": "ERR_NO_FACE",
  "message": "Could not detect a clear face in the provided image.",
  "traceId": "abc123xyz"
}
```

---

## 6. API Versioning Strategy
* **Path-based Versioning:** All core business endpoints are prefixed with `/api/v1/`.
* **Embedding Contract Governance:** The `v1` contract strictly guarantees a `float[512]` output. Any future embedding dimension change (e.g., `512` $\rightarrow$ `1024`) requires a new `/api/v2/` endpoint. Backward compatibility must be preserved.
* **Backward Compatibility:** `/api/v1/` and `/api/v2/` will run concurrently inside the container during migration phases to prevent downtime.

---

## 7. Spring Boot Integration Contract
Rules for the Java Backend (Face Module) when invoking the Python AI Service.

* **Headers:** `Content-Type: application/json` is mandatory.
* **TraceId Propagation:** Spring Boot MUST inject `X-Request-Id`, `X-B3-TraceId`, or `traceparent` headers into the HTTP request.
* **Request Flow:** Gate Camera $\rightarrow$ IoT Module $\rightarrow$ Face Module (Java) $\rightarrow$ **HTTP POST** $\rightarrow$ AI Service (Python) $\rightarrow$ Returns `float[512]` $\rightarrow$ Face Module executes `pgvector` query.
* **Timeout Recommendations:** Spring Boot `RestTemplate`/`WebClient` must enforce a strict `1000ms` Read Timeout.
* **Retry Policy:** 
  * `4xx` Errors: **Zero retries** (Fail Fast).
  * `503` / Network Timeout: **Max 1 retry** (to prevent gate latency from exceeding 3 seconds).

---

## 8. Security Boundary
* ❌ **No JWT Business Authorization:** The AI Service sits behind the API Gateway/Backend within a private Docker overlay network. It does not parse JWTs, check Roles, or validate User Accounts.
* ❌ **No Student Lookup:** The AI Service never receives a `studentId`.
* ❌ **No Access Decision:** The AI Service does not know what a "Gate" or "Curfew" is.
* ❌ **No MQTT:** No hardware control protocols are permitted.

---

## 9. Observability Contract
* **Request Correlation:** The custom FastAPI middleware extracts the TraceId from headers and attaches it to the `structlog` context. 
* **Logging:** Every log line related to an extraction request MUST include `{"trace_id": "..."}`.
* **Metrics Correlation:** The Prometheus `/metrics` endpoint will track request durations and HTTP status codes, enabling Grafana dashboards to monitor AI Service health independently of the Java backend.

---

## 10. Final Output & Implementation Readiness
**Implementation Readiness Evaluation:**
* The **Python Team** has a strict request/response structure, explicit error codes to implement, and clear boundaries prohibiting database/business logic.
* The **Spring Boot Team** has exact integration guidelines (Timeouts, Retries, Headers) to build the `FaceRecognitionGateway` implementation.

**Final Decision: PASS** ✅

The API Contract is robust, fully specifies the interoperability between systems, and tightly guards the Modular Monolith governance rules.

