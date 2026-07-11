# UPDATED SECTION 6 - COMMUNICATION REQUIREMENTS

# Group B - Administrator Communications

## CR-B01

Admin → Backend

Decision:

ALLOW

Reason:

Administrators must access system management functions through the Backend application.

---

## CR-B02

Admin → PostgreSQL

Decision:

ADMINISTRATIVE ACCESS ONLY

Reason:

Database access is restricted to administrative operations such as:

* Backup and Restore
* Database Maintenance
* Troubleshooting
* Audit Investigation
* Performance Monitoring

Daily business operations should access the database indirectly through the Backend application.

Recommended Flow:

Admin
↓
Backend
↓
Database

Direct database access should be limited and controlled.

---

## CR-B03

Admin → MQTT Broker

Decision:

ALLOW

Reason:

Required for monitoring, troubleshooting and managing IoT communications.

---

## CR-B04

Admin → ESP32

Decision:

ALLOW

Reason:

Required for device management and maintenance.

---

## CR-B05

Admin → RFID Devices

Decision:

ALLOW

Reason:

Required for diagnostics and operational support.

====================================================

# UPDATED SECTION 8 - VLAN COMMUNICATION MATRIX

| Source VLAN | Destination VLAN | Decision                   |
| ----------- | ---------------- | -------------------------- |
| VLAN10      | VLAN20           | Administrative Access Only |
| VLAN10      | VLAN30           | Allow                      |
| VLAN20      | VLAN10           | Partial Allow              |
| VLAN20      | VLAN30           | Deny                       |
| VLAN30      | VLAN10           | Partial Allow              |
| VLAN30      | VLAN20           | Deny                       |

---

Explanation:

VLAN10 → VLAN20 is not unrestricted communication.

Only legitimate administrative activities are allowed, including:

* Remote Troubleshooting
* Device Support
* Security Investigation
* System Administration

All other traffic should be controlled according to business requirements.

====================================================

# NEW SECTION 10.1 - FUTURE COMPONENT INTEGRATION

## Future Components

The current architecture includes:

* Backend
* PostgreSQL
* MQTT Broker
* RFID Reader
* ESP32 Controller

Future project phases will introduce additional authentication technologies.

Planned Components:

### Face Recognition Module

Purpose:

* Student Identity Verification
* Contactless Authentication

Deployment Zone:

VLAN 30 - IoT Zone

---

### Fingerprint Recognition Module

Purpose:

* Biometric Authentication
* Multi-Factor Access Control

Deployment Zone:

VLAN 30 - IoT Zone

---

### Security Consideration

Future biometric devices will follow the same security principles applied to existing IoT devices:

* No direct Student access
* Communication through authorized services only
* Isolation from Student VLAN
* Enforcement through ACL policies

This design ensures scalability while maintaining security consistency across all access control technologies.
