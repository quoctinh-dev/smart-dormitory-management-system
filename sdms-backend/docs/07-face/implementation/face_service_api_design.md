> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS Face API & Application Service Design (v1.0)

This document standardizes the API Contracts, Service Layer interfaces, and Event flows for the Face Recognition module in the Smart Dormitory Management System (SDMS).

---

## 1. API Contracts (REST Endpoints)

All API responses follow the standard `ApiResponse<T>` wrapper.

### 1.1 Student Endpoints

#### Upload Face (Registration)
* **Method:** `POST`
* **URL:** `/api/v1/student/face/register`
* **Access:** `hasRole('STUDENT')`
* **Request Body (`FaceRegistrationRequest`):**
  ```json
  {
    "faceImageUrl": "https://cloudinary.com/sdms/faces/stud_123.jpg"
  }
  ```
* **Response (`ApiResponse<FaceProfileResponse>`):**
  ```json
  {
    "success": true,
    "message": "Face portrait uploaded successfully",
    "data": {
      "profileId": "d3b07384-d113-4ec2-a5d7-e07e12739345",
      "studentCode": "STU-APP-009812",
      "status": "PENDING_APPROVAL",
      "faceImageUrl": "https://cloudinary.com/sdms/faces/stud_123.jpg"
    }
  }
  ```

#### Re-Register Face
Used when a student's photo was previously rejected or needs update.
* **Method:** `POST`
* **URL:** `/api/v1/student/face/re-register`
* **Access:** `hasRole('STUDENT')`
* **Request Body (`FaceRegistrationRequest`):** Same as upload.
* **Response (`ApiResponse<FaceProfileResponse>`):** Same as upload.

#### Query My Face Profile
* **Method:** `GET`
* **URL:** `/api/v1/student/face/me`
* **Access:** `hasRole('STUDENT')`
* **Response (`ApiResponse<FaceProfileResponse>`):** Returns the current student's face profile state.

---

### 1.2 Admin/Staff Endpoints

#### Approve Face
* **Method:** `POST`
* **URL:** `/api/v1/admin/face/profiles/{profileId}/approve`
* **Access:** `hasAnyRole('ADMIN', 'STAFF')`
* **Response (`ApiResponse<Void>`):**
  ```json
  {
    "success": true,
    "message": "Face profile approved. AI embedding generated and synchronized."
  }
  ```

#### Reject Face
* **Method:** `POST`
* **URL:** `/api/v1/admin/face/profiles/{profileId}/reject`
* **Access:** `hasAnyRole('ADMIN', 'STAFF')`
* **Request Body (`RejectFaceRequest`):**
  ```json
  {
    "reason": "Photo is too dark. Capture portrait with proper lighting."
  }
  ```
* **Response (`ApiResponse<Void>`)**

#### Revoke Face Profile
Admin manually revokes face profile due to student leaving dormitory, identity compromise, or re-registration workflow.
* **Method:** `POST`
* **URL:** `/api/v1/admin/face/profiles/{faceId}/revoke`
* **Access:** `hasAnyRole('ADMIN', 'STAFF')`
* **Expected Result:** Face Profile $\rightarrow$ REVOKED, Face Embedding $\rightarrow$ KEEP, History $\rightarrow$ KEEP, Publish $\rightarrow$ FaceProfileRevokedEvent.
* **Response (`ApiResponse<Void>`)**

#### Query Face Profiles (Pageable)
* **Method:** `GET`
* **URL:** `/api/v1/admin/face/profiles?status={status}&page={page}&size={size}`
* **Access:** `hasAnyRole('ADMIN', 'STAFF')`

---

### 1.3 IoT/Gate Endpoints

#### Gate Recognition Verification
Invoked by the Gate Client camera when a face is detected.
* **Method:** `POST`
* **URL:** `/api/v1/iot/gates/{deviceId}/verify`
* **Access:** `hasRole('GATE_CLIENT')` (Secured via API Key/Token per gate)
* **Request Body (`GateVerificationRequest`):**
  ```json
  {
    "capturedImageUrl": "https://cloudinary.com/sdms/gate-captures/gate_1_xyz.jpg"
  }
  ```
* **Response (`ApiResponse<GateVerificationResponse>`):**
  ```json
  {
    "success": true,
    "message": "Verification completed",
    "data": {
      "identityVerified": true,
      "studentName": "Nguyen Van A",
      "studentCode": "STU-APP-009812",
      "confidenceScore": 0.94
    }
  }
  ```

---

## 2. Service Layer Interfaces

### 2.1 FaceRegistrationService
Handles student-facing face registration and replacement requests.
```java
public interface FaceRegistrationService {
    FaceProfileResponse registerFace(UUID studentId, FaceRegistrationRequest request);
    FaceProfileResponse reRegisterFace(UUID studentId, FaceRegistrationRequest request);
    FaceProfileResponse getFaceProfile(UUID studentId);
}
```

### 2.2 FaceApprovalService
Handles admin-facing workflows, executing pessimistic locks and triggering embedding generation.
```java
public interface FaceApprovalService {
    void approveProfile(UUID profileId);
    void rejectProfile(UUID profileId, RejectFaceRequest request);
}
```

### 2.3 FaceRevocationService
Handles admin-facing workflows to manually revoke active profiles.
```java
public interface FaceRevocationService {
    void revokeProfile(UUID faceId, String reason);
}
```

### 2.4 FaceRecognitionGateway
Communicates with the AI engine to compute and match embeddings.
```java
public interface FaceRecognitionGateway {
    // Calls AI microservice or library to extract a 512-dimension vector from a photo URL
    float[] extractEmbedding(String imageUrl);
    
    // Compares a captured face embedding against database templates using cosine similarity
    MatchResult findBestMatch(float[] capturedEmbedding);
}
```

---

## 3. Event-Driven Module Integration

Decoupled modules communicate asynchronously via domain events to maintain transactional integrity:

```
[Student Uploads Face]
       │
       ▼ (FaceRegistrationService)
Publishes: FacePhotoUploadedEvent (studentId, imageUrl)
       │
       ▼ (Consumed by FaceApprovalService)
Creates FaceProfile (PENDING_APPROVAL)
       │
       ▼ [Admin Clicks Approve]
Extracts Embedding & Sets Status = APPROVED
       │
       ▼
Publishes: FaceProfileApprovedEvent (studentId, imageUrl)
       │
       ▼ (Consumed by StudentEventListener)
Updates Student: isFaceRegistered = true, faceImageUrl = imageUrl
```

---

## 4. Final Architecture Decision

**FACE-03 FROZEN.** The Service Layer contracts, API endpoints, DTO models, and event integration flow are officially finalized.

