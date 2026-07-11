# PROJECT RULES: SDMS AI SERVICE

## 1. CORE ARCHITECTURE & TECHNOLOGY
- **Framework:** FastAPI (Python 3.10+)
- **Role:** Independent Microservice strictly responsible for AI processing (Face extraction).
- **Communication:** Synchronous REST API via JSON and `multipart/form-data`.
- **Stateless:** The AI service must be fully stateless. It does not connect to the database. It only receives inputs, processes them, and returns outputs.

## 2. FACE RECOGNITION SPECIFICATIONS (CRITICAL)
- **Model Standard:** Must output exactly **512-dimension vectors** (Float arrays). Do not use 192-dimension models (e.g. MobileFaceNet). Recommended: ArcFace (ResNet50) or Facenet-512.
- **Preprocessing:** Must include Face Detection and Face Alignment (e.g. using MTCNN, RetinaFace, or MediaPipe) before feeding into the vector extraction model.
- **Strict Validation:** If no face is found, or if the face is too small/blurry, return HTTP 400 Bad Request with a clear message: `"No face detected in the image"`. DO NOT return random/mock data.

## 3. CODE CONVENTIONS
- **Formatting:** Use `black` or `ruff` for code formatting.
- **Typing:** Use strict Python type hints (Type Hinting) for all functions and Pydantic models.
- **Endpoints:** All endpoints must be documented using FastAPI's built-in Swagger/OpenAPI.
- **Logging:** Use structured logging to output meaningful AI processing results (e.g., detection score, processing time).

## 4. API CONTRACT (Current)
- `POST /api/v1/faces/extract`
  - Input: `multipart/form-data` (field: `file`)
  - Output: `{"success": true, "message": "...", "data": {"vector": [0.1, 0.2, ... 512 elements]}}`

## 5. DEFINITION OF DONE (DoD)
- Code follows PEP-8.
- FastAPI endpoints work correctly.
- Vectors returned are strictly 512 dimensions.
- Missing face cases are handled cleanly without crashing the server.
