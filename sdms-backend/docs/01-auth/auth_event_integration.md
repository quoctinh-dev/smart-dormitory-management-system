# Auth Event Integration & Decoupling

## 1. Context Boundaries & Decoupling
To preserve strict database module boundaries, the Auth Module does not handle events or call services of other modules directly. 
Instead, any actions in external modules that require user account changes are mediated via event-driven integration:
* **PaymentSuccessEvent**: Published by `PaymentService` when a student pays their accommodation bill. It is consumed by the Payment Module's `PaymentEventListener` to create the student profile and user account synchronously.
* **Account Activation**: Handled directly via the REST API endpoint `POST /api/v1/auth/activate`. It does not publish any events to other modules since the account state change is isolated to the credentials context.

---

## 2. Event-Driven Provisioning Lifecycle
The following event integration coordinates account generation:

```
[PaymentService]
       ↓
Publishes PaymentSuccessEvent (billId, assignmentId, applicationId)
       ↓
[PaymentEventListener] (Payment Module)
       ↓
1. Fetches DormitoryApplication
2. Creates Student Profile (PENDING_CHECKIN)
3. Creates UserAccount (PENDING_ACTIVATION)
4. Links Student to Room Assignment
```

* **Transaction Boundary**: The event listener runs synchronously under the payment transaction. If account creation fails, the payment transaction is rolled back, preventing orphaned unpaid student records.
* **No Direct Writes**: The Auth Module does not listen to `PaymentSuccessEvent` or invoke any repository writes itself. This keeps the Auth Module completely independent and query-only for authentication clients.
