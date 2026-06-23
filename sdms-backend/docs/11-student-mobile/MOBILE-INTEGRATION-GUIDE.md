# STUDENT MOBILE APP INTEGRATION GUIDE (SDMS)

## ROLE
Mobile Tech Lead, React Native / Flutter Developers

## OBJECTIVE
Provide the official API interaction flows and integration contracts for the Student Mobile Application. This document relies 100% on existing, deployed SDMS Backend APIs.

---

## 1. AUTHENTICATION & SESSION MANAGEMENT

### 1.1 Login Flow
The app must authenticate the student and securely store the JWT Access Token.
* **Endpoint:** `POST /api/v1/auth/login`
* **Request Body:**
  ```json
  {
    "email": "student@domain.com",
    "password": "hashed_password_or_cccd"
  }
  ```
* **Response Handling:**
  Store the `accessToken` in Secure Storage (e.g., Keychain/Keystore).
  Set it as `Authorization: Bearer <token>` in the interceptor for all future requests.

### 1.2 Account Activation (First-time Login)
If a student's account was auto-created by the Admin during Registration Import, they must activate it.
* **Endpoint:** `POST /api/v1/auth/activate`
* **Request Body:**
  ```json
  {
    "email": "...",
    "temporaryPassword": "CCCD",
    "newPassword": "...",
    "confirmPassword": "..."
  }
  ```

---

## 2. STUDENT PROFILE MANAGEMENT

### 2.1 Fetching Profile Data
The Mobile App needs to fetch data from two endpoints to construct the full profile UI:
* **Account Info:** `GET /api/v1/users/me` (Gets Role, Email, and general User ID).
* **Detailed Student Profile:** `GET /api/v1/students/me`
  * **Returns:** Full Name, CCCD, Academic details, Contact info, Emergency contacts, and Dormitory Status (e.g., `ACTIVE`, `ROOM_ID`).

### 2.2 Updating Personal Information
Students can update dynamic fields (Phone, Address, Contact details) but CANNOT change rigid fields (CCCD, Student ID).
* **Endpoint:** `PATCH /api/v1/students/me`
* **Request Body Example:**
  ```json
  {
    "phone": "0987654321",
    "permanentAddress": "123 Street, District",
    "emergencyContact": "Mother: 0123456789"
  }
  ```

---

## 3. DORMITORY LIVING FLOWS

### 3.1 Face Registration (Smart Access)
To pass through the IoT Gateways, students must upload a frontal face portrait.
* **Endpoint:** `POST /api/v1/students/me/face`
* **Headers:** `X-Student-Id: <student_uuid>`
* **Request Body:** 
  ```json
  {
    "faceImageUrl": "https://res.cloudinary.com/..."
  }
  ```
* **UI Rule:** The app should open the device camera, force a front-facing selfie, upload the image to Cloudinary (or SDMS Upload API), and then submit the returned URL to the endpoint above.

### 3.2 Access History Polling
Students can check when they entered or exited the dormitory.
* **Endpoint:** `GET /api/v1/access/student/{studentId}`
* **Returns:** A list of scan events (`GRANTED`, `DENIED_CURFEW`).

### 3.3 Payment & Invoices (Pending Mobile UI)
* **Endpoint:** `POST /api/v1/payment/online`
* **Behavior:** The App should render a WebView pointing to the payment gateway or generate a VietQR code image for banking apps.

---

## 4. ERROR HANDLING & SECURITY

- **401 Unauthorized:** If the API returns 401, the JWT is expired. The Mobile App MUST call `POST /api/v1/auth/refresh-token` and retry the original request.
- **403 Forbidden:** The student is trying to access an Admin API or a resource they do not own. Force a logout or show an "Access Denied" screen.
- **Data Protection:** Never log the JWT Token or CCCD to third-party crash analytics (e.g., Crashlytics).
