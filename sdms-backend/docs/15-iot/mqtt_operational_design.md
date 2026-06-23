> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# MQTT Operational Design (v1.0)

## 1. Topic Strategy
* **Command Topic:** `kts/gate/{gateId}/command` (Backend $\rightarrow$ ESP32). Used strictly for physical control (e.g., UNLOCK).
* **Telemetry Topic:** `kts/gate/{gateId}/status` (ESP32 $\rightarrow$ Backend). Used for heartbeat and hardware health reporting.

## 2. QoS Strategy
* **Commands (UNLOCK):** MUST use **QoS 1 (At least once)**. The Spring Boot backend must receive a PUBACK from the broker to confirm the message was queued.
* **Telemetry (Heartbeat):** MUST use **QoS 0 (At most once)**. Dropped heartbeats are acceptable and prevent network congestion.

## 3. Retain Strategy
* **Commands:** `Retain = FALSE` (STRICTLY REQUIRED). Retaining an `UNLOCK` command is a critical physical security vulnerability. If an ESP32 loses power and reboots, consuming a retained `UNLOCK` command would cause the door to open arbitrarily.
* **Configuration:** `Retain = TRUE` (Optional). Used only for static configuration payloads pushed to the device.

## 4. Offline Device Handling
* **Broker Configuration:** If an ESP32 is offline, the MQTT Broker will hold QoS 1 commands in session memory for a maximum TTL (e.g., 10 seconds).
* **LWT (Last Will and Testament):** The ESP32 MUST configure a LWT payload (`{"status": "OFFLINE"}`) on the Telemetry topic. The broker automatically publishes this if the device unexpectedly disconnects, allowing Spring Boot to alert administrators.

