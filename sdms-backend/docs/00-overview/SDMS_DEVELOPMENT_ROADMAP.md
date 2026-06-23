# SDMS DEVELOPMENT ROADMAP
**Version:** 1.0 · **Date:** 2026-06-22

This document provides the strategic development roadmap and master recommendations for the SDMS project team.

---

## 1. MASTER RECOMMENDATIONS (WHAT TO BUILD NEXT)

### Priority 1: AI Mock Service & IoT Simulator (Demo Critical)
The core value proposition of a "Smart" dormitory relies on the gate access flow. Since physical hardware is missing, immediately build software simulators.
- **Deliverable:** Python Flask App to mock the Face Embedding pipeline (return fixed 512-dim vectors).
- **Deliverable:** Python MQTT Publisher to simulate gate ESP32 events.

### Priority 2: Payment Gateway Integration
The payment module currently relies on "manual admin confirmation". To digitize the flow fully, integrate a real gateway.
- **Deliverable:** VNPay or MoMo sandbox integration in the `PaymentModule`.

### Priority 3: Mobile App Skeleton
The API backend is 100% ready for a mobile app. 
- **Deliverable:** A basic Flutter or React Native app for Students (Login, View Profile, Application Status).

---

## 2. ROADMAP

### Next 3 Days (Sprint: Demo Rescue)
- [ ] Deploy local MQTT Broker (Mosquitto).
- [ ] Create Python AI Mock Service.
- [ ] Create Python IoT Gate Simulator script.
- [ ] Implement Admin Web UI for viewing `access_history`.

### Next 2 Weeks (Sprint: Ecosystem Expansion)
- [ ] Build the Student Directory UI in the Admin Portal.
- [ ] Build the Curfew Policy Configuration UI in the Admin Portal.
- [ ] Implement VNPay integration for the `WAITING_PAYMENT` step.
- [ ] Develop the Flutter Mobile App skeleton.

### Next Month (Sprint: Hardware & AI Reality)
- [ ] Procure hardware (ESP32, RC522, IP Camera, Relay).
- [ ] Flash ESP32 firmware with MQTT logic.
- [ ] Replace Python AI Mock with real FaceNet/InsightFace model implementation.
- [ ] Setup production network topology (VLAN segregation for Server vs IoT).

### Next Semester (Sprint: Production Scale)
- [ ] Direct API integration with University SIS (Student Information System) to replace Excel imports.
- [ ] Real-time push notifications to Mobile App via Firebase Cloud Messaging (FCM).
- [ ] Comprehensive penetration testing and load testing of the pgvector database.
- [ ] Analytics dashboard for Administrative reporting (occupancy rates, payment delinquency, access anomalies).
