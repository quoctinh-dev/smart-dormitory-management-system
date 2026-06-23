> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# IoT Operational Design (v1.0)

## 1. ESP32 Lifecycle
1. **Boot:** Initialize Hardware $\rightarrow$ Connect WiFi $\rightarrow$ Connect MQTT $\rightarrow$ Publish Online Status.
2. **Idle:** Run main loop, ping Watchdog, listen for MQTT commands.
3. **Execution:** Receive UNLOCK $\rightarrow$ Trigger Relay $\rightarrow$ Block execution for duration $\rightarrow$ Release Relay.

## 2. Relay Behavior
* **Trigger Mode:** Active-HIGH or Active-LOW depending on the magnetic lock specifications.
* **Duration:** The ESP32 firmware hardcodes the unlock duration (e.g., `DELAY 3000ms`). The backend MUST NOT send separate "ON" and "OFF" commands, as network latency could leave the door permanently unlocked.
* **Concurrency:** The relay execution MUST be non-blocking (e.g., using `millis()` instead of `delay()`) to ensure heartbeats are not missed.

## 3. Reconnect Strategy
* **WiFi Loss:** ESP32 attempts exponential backoff reconnection.
* **MQTT Loss:** ESP32 attempts rapid reconnection to the broker. During this phase, the gate operates in **Fail-Closed** mode (QR/Face commands fail).

## 4. Watchdog Strategy
* **Hardware WDT:** A hardware watchdog timer (e.g., 5 seconds) MUST be enabled. If the ESP32 firmware hangs or deadlocks, the hardware automatically reboots the micro-controller, preventing permanent lockouts.

