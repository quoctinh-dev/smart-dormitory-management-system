# WEB-INVENTORY

## SECTION 1: Current Screen Inventory

Based on the actual React component tree in `sdms-frontend/src/pages`, the following screens are physically implemented:

### Admin Web Screens (`/admin/*`)
1. **LoginPage** (`LoginPage.jsx`): Standard login form with Email/Password.
2. **AdminDashboard** (`AdminDashboard.jsx`): Landing page post-login.
3. **RegistrationPeriodManager** (`RegistrationPeriodManager.jsx`): CRUD operations for Dormitory Registration Periods.
4. **EligibilityManagerDialog** (`EligibilityManagerDialog.jsx`): Modal interface to import or manually add eligible students to a specific period.

### Public Web Screens (`/*`)
1. **HomePage** (`HomePage.jsx`): Landing page for the SDMS portal.
2. **RegistrationPage** (`RegistrationPage.jsx`): Multi-step form allowing students to check their eligibility and submit a dormitory application.
3. **StatusPage** (`StatusPage.jsx`): Page for students to input their ID/CCCD to poll the approval status of their application.

---

## SECTION 2: Implemented Business Flows

Based on the `src/api` directory (`authApi.js`, `periodApi.js`, `applicationApi.js`, `documentApi.js`) and hooks (`useRegistration`, `useRegistrationPeriods`, `useApplicationStatus`), the following flows are fully wired to the backend:

1. **Admin Authentication Flow:** 
   - Uses `AuthContext.jsx` and `RequireAdmin.jsx` to protect `/admin` routes.
   - Saves JWT using `authStorage.js`.
2. **Registration Lifecycle Management:** 
   - Admins can create periods and manage the whitelist of eligible students.
3. **Dormitory Application Submission:** 
   - Students can check active periods.
   - Students can submit their personal data and upload verification documents to S3/Cloudinary.
   - Students can check their application status.
