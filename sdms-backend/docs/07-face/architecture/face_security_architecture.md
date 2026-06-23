> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS Face Security Architecture (v1.0)

## 1. Security Scope
This document outlines the security governance for the Face Recognition Domain. It strictly covers threat modeling and risk identification for biometric registration, embedding storage, administrative approval, and IoT gate verification workflows. It does not prescribe specific technical implementations or code.

## 2. Threat Model
The Face Recognition Domain assumes an environment where both internal and external threat actors may attempt to bypass gate authorization, harvest biometric data, or perform unauthorized administrative actions. The system is modeled against physical presentation attacks, network replay attacks, and insider threats.

## 3. Spoofing Risk
* **Registration Spoofing:** Risk of students uploading pre-captured or digitally manipulated images (e.g., deepfakes or gallery photos) to bypass identity validation.
* **Gate Presentation Attack:** Risk of unauthorized individuals presenting physical photos, masks, or digital screens to the IoT gate camera to spoof an active student's face.

## 4. Replay Risk
* **API Replay:** Risk of an attacker intercepting a valid `FaceVerificationRequestedEvent` or REST API verification request and replaying it at a later time to trigger an unauthorized gate unlock.
* **Network Interception:** Risk of intercepting the MQTT `UNLOCK` command between the IoT Module and the physical gate.

## 5. Privilege Abuse Risk
* **Malicious Approval:** Risk of a compromised or rogue Admin/Staff account approving fraudulent face profiles for unauthorized individuals.
* **Denial of Service (Revocation):** Risk of an Admin/Staff account maliciously revoking valid face profiles in bulk, disrupting dormitory access.

## 6. AI Failure Risk
* **Availability:** Risk of the external Face AI Engine becoming unresponsive, timing out, or returning malformed data, leading to a breakdown in physical access control.
* **Algorithmic Bias/Error:** Risk of the AI engine returning false positives (granting access to the wrong person) or false negatives (denying access to a valid resident).

## 7. Security Ownership
* **Face Module:** Owns the security policies for vector storage, similarity thresholds, and AI engine communication integrity.
* **Student Module:** Owns the security policies for authenticating the student app session during live capture.
* **IoT Module:** Owns the hardware security policies, including camera feed integrity and MQTT command validation.
* **Auth Module:** Owns the role-based access control (RBAC) and session validation for all admin actions.

