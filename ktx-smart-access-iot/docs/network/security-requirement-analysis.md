# DAY 03 - NETWORK SECURITY & ACCESS CONTROL

# PHASE 1 - SECURITY REQUIREMENT ANALYSIS

---

# 1. Introduction

## 1.1 Purpose

This document analyzes the security requirements of the Smart Dormitory Access Control System.

The objective is to identify:

* Critical assets that must be protected.
* Potential threats against the system.
* Attack surfaces exposed to users and devices.
* Security objectives and requirements.
* The foundation for Security Policy Design and ACL implementation in later phases.

This phase follows enterprise security engineering practices and serves as the basis for designing network access control mechanisms.

---

## 1.2 Scope

The analysis covers:

### Network Infrastructure

* Cisco Router 2911
* Cisco Switch 2960
* VLAN Segmentation
* Router-on-a-Stick Architecture

### Server Infrastructure

* Spring Boot Backend
* PostgreSQL Database
* MQTT Broker

### Client Devices

* Admin PC
* Student Laptop
* Student Mobile Application

### IoT Infrastructure

* ESP32 Controller
* RFID Reader
* Fingerprint Sensor
* Face Recognition Module
* Electronic Lock

---

# 2. System Overview

## 2.1 Project Description

The Smart Dormitory Access Control System is designed to automate access control within a university dormitory environment.

The system integrates:

* Web Technologies
* Mobile Technologies
* IoT Devices
* Network Infrastructure
* Database Systems

to provide secure and centralized management of dormitory access.

---

## 2.2 System Architecture

```text
Student App / Web
        |
        |
        v
Spring Boot Backend
        |
        |
        v
PostgreSQL Database
        |
        |
        v
MQTT Broker
        |
        |
        v
ESP32 Controller
        |
        |
        v
RFID / Fingerprint / Face Recognition
        |
        |
        v
Electronic Lock
```

---

## 2.3 Network Architecture

```text
                    INTERNET
                        |
                        |
                   R1_KTX
                        |
                  802.1Q Trunk
                        |
                    SW1_KTX
     ------------------------------------------------
     |                     |                       |
 VLAN10                VLAN20                  VLAN30
 ADMIN                 STUDENT                  IOT
     |                     |                      |
ADMIN_PC           STUDENT_LAPTOP         RFID_NODE_01
KTX_SERVER                             ESP32_DOOR_01
```

---

## 2.4 VLAN Information

| VLAN ID | VLAN Name | Network         |
| ------- | --------- | --------------- |
| 10      | ADMIN     | 192.168.10.0/24 |
| 20      | STUDENT   | 192.168.20.0/24 |
| 30      | IOT       | 192.168.30.0/24 |

---

## 2.5 Router Sub-Interfaces

| Interface | IP Address   |
| --------- | ------------ |
| Gi0/0.10  | 192.168.10.1 |
| Gi0/0.20  | 192.168.20.1 |
| Gi0/0.30  | 192.168.30.1 |

---

# 3. Security Objectives

The security objectives define what the system must achieve from a security perspective.

---

## SO-01

Prevent students from directly accessing the database server.

---

## SO-02

Prevent students from directly accessing IoT devices.

---

## SO-03

Prevent unauthorized MQTT communication.

---

## SO-04

Ensure that only authorized services can access the database.

---

## SO-05

Ensure IoT devices communicate only with authorized system services.

Authorized services include:

* Spring Boot Backend
* MQTT Broker

IoT devices must not communicate directly with:

* Student VLAN
* Student Devices
* PostgreSQL Database

---

## SO-06

Reduce the impact of malware infections inside the student network.

---

## SO-07

Limit network reconnaissance and unauthorized scanning activities.

---

## SO-08

Separate security domains through VLAN segmentation.

---

## SO-09

Implement Least Privilege access control.

---

## SO-10

Apply Zero Trust principles across all network zones.

---

# 4. Asset Identification

Assets are components that must be protected from unauthorized access, modification, or disruption.

---

## A01 - PostgreSQL Database

### Criticality

CRITICAL

### Description

Stores:

* Student information
* Account information
* RFID identifiers
* Face recognition identifiers
* Fingerprint identifiers
* Access logs
* Audit logs

### Risks

* Data leakage
* Data tampering
* Data deletion
* Unauthorized disclosure

---

## A02 - MQTT Broker

### Criticality

CRITICAL

### Description

Responsible for message exchange between backend services and IoT devices.

Example topics:

```text
rfid/scan
access/request
access/result
door/open
door/close
```

### Risks

* Fake door commands
* Unauthorized publish actions
* Unauthorized subscriptions
* Denial of Service attacks

---

## A03 - Spring Boot Backend

### Criticality

HIGH

### Description

Responsible for:

* Authentication
* Authorization
* Business Logic
* Device Management
* Access Control Decisions

### Risks

* Account compromise
* Service disruption
* Unauthorized administration

---

## A04 - ESP32 Controller

### Criticality

HIGH

### Description

Responsible for:

* Receiving MQTT commands
* Controlling relays
* Managing electronic locks

### Risks

* Unauthorized door unlocking
* Device takeover
* Fake access events

---

## A05 - Electronic Lock

### Criticality

HIGH

### Description

Final physical security component.

### Risks

* Unauthorized physical access
* Security breaches in dormitory facilities

---

# 5. Threat Analysis

---

## T01 - Curious Student

### Description

A student intentionally explores the internal network.

Activities:

* Ping Sweeps
* Network Discovery
* Port Scanning

### Impact

Information Disclosure

### Severity

MEDIUM

---

## T02 - Malware Infection

### Description

A student device becomes infected with malware.

Activities:

* Worm propagation
* Credential theft
* Internal scanning

### Impact

Network-wide compromise

### Severity

HIGH

---

## T03 - Unauthorized MQTT Access

### Description

An attacker attempts to access MQTT services.

Activities:

* Publish malicious messages
* Subscribe to restricted topics

### Impact

Unauthorized door control

### Severity

CRITICAL

---

## T04 - Database Attack

### Description

An attacker attempts to access PostgreSQL.

Activities:

* Direct database connections
* Brute force attacks
* SQL exploitation

### Impact

Sensitive data compromise

### Severity

CRITICAL

---

## T05 - IoT Device Compromise

### Description

An attacker gains control of an ESP32 device.

### Impact

* Door manipulation
* Unauthorized access
* System disruption

### Severity

CRITICAL

---

# 6. Attack Surface Analysis

The attack surface represents exposed interfaces that may be targeted by attackers.

---

## AS-01

Spring Boot REST API

Port:

8080

---

## AS-02

HTTPS Service

Port:

443

---

## AS-03

MQTT Broker

Port:

1883

---

## AS-04

MQTT over TLS

Port:

8883

---

## AS-05

PostgreSQL

Port:

5432

---

## AS-06

SSH Management

Port:

22

---

# 7. Security Zones

---

## Zone 1 - ADMIN Zone

### VLAN

VLAN 10

### Components

* ADMIN_PC
* KTX_SERVER
* Spring Boot Backend
* PostgreSQL Database
* MQTT Broker

### Trust Level

HIGH

### Reason

Managed devices under administrator control.

---

## Zone 2 - STUDENT Zone

### VLAN

VLAN 20

### Components

* Student Laptop
* Student Mobile Device

### Trust Level

LOW

### Reason

Student devices are unmanaged endpoints and may be infected by malware or used for unauthorized activities.

---

## Zone 3 - IoT Zone

### VLAN

VLAN 30

### Components

* ESP32
* RFID Reader
* Door Controller

### Trust Level

MEDIUM

### Reason

IoT devices have limited security controls and are more vulnerable than managed servers.

---

# 8. MQTT Broker Placement

## Current Deployment Assumption

For the current project phase:

MQTT Broker is deployed on:

KTX_SERVER

inside:

VLAN 10 - ADMIN

---

## Justification

* Simplifies Packet Tracer implementation.
* Reduces infrastructure complexity.
* Facilitates monitoring and administration.
* Suitable for academic project environments.

---

## Future Enhancement

In a production-scale deployment:

MQTT Broker may be migrated to:

* Dedicated Server
* Dedicated VLAN
* DMZ Architecture

to improve scalability and security.

---

# 9. Security Requirement Matrix

---

## SR-01

Student → Backend API

ALLOW

---

## SR-02

Student → Web Application

ALLOW

---

## SR-03

Student → PostgreSQL

DENY

---

## SR-04

Student → MQTT Broker

DENY

---

## SR-05

Student → ESP32

DENY

---

## SR-06

Student → RFID Devices

DENY

---

## SR-07

Admin → Server

ALLOW

---

## SR-08

Admin → Database

ALLOW

---

## SR-09

Admin → MQTT Broker

ALLOW

---

## SR-10

Admin → IoT Devices

ALLOW

---

## SR-11

IoT → Backend

ALLOW

---

## SR-12

IoT → MQTT Broker

ALLOW

---

## SR-13

IoT → Database

DENY

---

## SR-14

IoT → Student VLAN

DENY

---

## SR-15

Unspecified Traffic

DENY

---

# 10. Initial Access Matrix

| Source  | Destination  | Decision |
| ------- | ------------ | -------- |
| Student | Backend API  | Allow    |
| Student | Database     | Deny     |
| Student | MQTT Broker  | Deny     |
| Student | ESP32        | Deny     |
| Student | RFID Reader  | Deny     |
| Admin   | Backend      | Allow    |
| Admin   | Database     | Allow    |
| Admin   | MQTT Broker  | Allow    |
| Admin   | IoT Devices  | Allow    |
| IoT     | Backend      | Allow    |
| IoT     | MQTT Broker  | Allow    |
| IoT     | Database     | Deny     |
| IoT     | Student VLAN | Deny     |

---

# 11. Security Principles

---

## Principle 1 - Least Privilege

Only the minimum permissions required to perform business functions should be granted.

---

## Principle 2 - Network Segmentation

Network zones must be separated using VLAN technology.

---

## Principle 3 - Default Deny

Any traffic not explicitly allowed shall be denied.

---

## Principle 4 - Defense in Depth

Security must be implemented in multiple layers:

* VLAN Segmentation
* ACL
* Authentication
* Authorization
* Database Security

---

## Principle 5 - Zero Trust Network

No VLAN should trust another VLAN by default.

All communications between VLANs must be explicitly authorized.

Principle:

"Never Trust, Always Verify"

---

# 12. Conclusion

The analysis identifies:

* The Student VLAN as the highest-risk network segment.
* PostgreSQL Database as the most critical information asset.
* MQTT Broker as the most sensitive communication component.
* IoT devices as security-sensitive operational assets.
* ACL as the primary mechanism for enforcing inter-VLAN security policies.

This document serves as the foundation for:

* PHASE 2 – ACCESS MATRIX DESIGN
* PHASE 3 – SECURITY POLICY DESIGN
* PHASE 4 – ACL ARCHITECTURE DESIGN
* PHASE 5 – ACL IMPLEMENTATION

The security requirements defined in this phase will be translated into enforceable access control policies during subsequent phases.
