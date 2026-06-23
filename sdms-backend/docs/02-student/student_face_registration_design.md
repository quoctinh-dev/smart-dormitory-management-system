# Student Face Registration Design

## 1. Face Integration Fields
To support AI-based biometric access control (e.g., smart doors/turnstiles), the [Student](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/student/entity/Student.java) entity contains biometric metadata fields:
* **`faceImageUrl`** (`String`): The path or URL of the student's portrait photo used for facial recognition registration.
* **`isFaceRegistered`** (`Boolean`): A state flag indicating whether the facial template has been successfully registered in the Face AI Engine.

---

## 2. Facial Registration Workflow
1. The student uploads a high-quality portrait photo through the application interface.
2. The photo URL is saved in `Student.faceImageUrl`.
3. The upload triggers a background call to the Face AI Engine to extract the facial embedding vector and register it in the facial database.
4. Once registration succeeds, `Student.isFaceRegistered` is updated to `true`.
5. The IoT smart door devices fetch face template updates. When the student steps up to the camera, the door matches their face against the active template database to allow entry.

---

## 3. Data Ownership & Security
* **Strict Ownership**: Biometric attributes (`faceImageUrl`, `isFaceRegistered`) remain under the strict ownership of the Student Module. External modules (such as IoT or Room) are query-only and must never write directly to these fields.
* **Biometric Security**: Raw facial images are stored securely on private storage engines (e.g., Cloudinary) with signed URLs. Embeddings stored in vector databases do not contain rebuildable personal photos, protecting resident privacy.
