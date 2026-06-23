> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS Face Privacy Policy Design (v1.0)

## 1. Face Image Ownership
* **Data Subject:** The student retains fundamental rights over their raw biometric image.
* **Custodianship:** SDMS acts as the data custodian. The original portrait images are strictly used for manual administrative verification and are protected from public exposure.

## 2. Face Embedding Ownership
* **System Ownership:** The extracted mathematical representations (512d vectors) are proprietary to the SDMS Face Module and the specific AI model version used.
* **Non-Reversible Policy:** Embeddings are stored in a format that cannot be mathematically reversed to reconstruct the student's original face image, mitigating privacy impact in the event of a vector leak.

## 3. Verification History Ownership
* **Audit Ownership:** The `GateAccessLog` and Verification History are owned by the IoT and Face modules for operational auditing and security incident investigation.
* **Access Limitation:** Access to historical verification logs is strictly limited to authorized administrators and system auditors.

## 4. Data Retention Rules
In strict compliance with **FD-21** and **FD-22**, the following retention rules govern biometric data:

* **No Hard Deletion (FD-22):** When a student leaves the dormitory system or a profile is revoked, the biometric data (`FaceEmbedding`) and verification history (`FaceVerificationHistory`) MUST BE KEPT intact. Hard deletion of vectors or history is prohibited to preserve security audit trails and system integrity.
* **No UPSERT / Overwrite (FD-21):** During a Re-Registration workflow, the previous face profile and embedding MUST NOT be overwritten or UPSERTed. The old profile is marked as `REVOKED` and retained, while a completely new profile is created.
* **Future Roadmap Deferral:** The precise Time-To-Live (TTL) for archiving and permanently purging revoked biometrics is deferred to the Future Roadmap and subsequent legal compliance reviews.

