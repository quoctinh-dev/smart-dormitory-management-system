# SDMS Smart Access Failure Scenarios

## 1. Introduction
This document defines how the Smart Access system responds to critical infrastructural failures.

## 2. Failure Scenarios

### 2.1 MQTT Broker Down
* **Detection**: IoT Module detects connection loss via PingReq timeout.
* **Impact**: Commands cannot reach the gates. `AccessGrantedEvent` from Smart Access will queue up but cannot be executed physically.
* **Recovery**: Broker clustering handles failover. IoT module auto-reconnects. 
* **Fail Behavior**: **Fail Closed**. Gates remain locked.

### 2.2 Spring Boot Down (Smart Access Service)
* **Detection**: Kubernetes/Healthcheck detects pod failure.
* **Impact**: Policy evaluation stops. `IdentityVerifiedEvent` accumulates in the Message Broker.
* **Recovery**: K8s restarts the pod. Consumers resume reading from the last committed offset.
* **Fail Behavior**: **Fail Closed**.

### 2.3 PostgreSQL Down
* **Detection**: DB connection pool timeout.
* **Impact**: `access_history` cannot be written. Transactions roll back. `AccessGrantedEvent` is NOT published (due to AFTER_COMMIT).
* **Recovery**: DB cluster failover. 
* **Fail Behavior**: **Fail Closed**.

### 2.4 Face Service Down
* **Detection**: Edge AI timeout or AI container health check fails.
* **Impact**: Face vectors cannot be matched.
* **Recovery**: Fallback to RFID reading.
* **Fail Behavior**: **Fail Closed** (for Face), operational via RFID.

### 2.5 ESP32 Offline
* **Detection**: IoT Module detects missing MQTT heartbeats.
* **Impact**: Specific gate is unreachable.
* **Recovery**: Hardware watchdog resets the ESP32.
* **Fail Behavior**: **Fail Closed**.

### 2.6 Network Partition
* **Detection**: Connectivity lost between Edge and Cloud.
* **Impact**: No events can be transmitted.
* **Recovery**: Auto-reconnect when network restores.
* **Fail Behavior**: **Fail Closed**.

### 2.7 Power Loss
* **Detection**: UPS triggers alert.
* **Impact**: Entire physical site goes dark.
* **Recovery**: Backup generators kick in.
* **Fail Behavior**: Magnetic locks drop. **Fail Open** (for Life Safety).
