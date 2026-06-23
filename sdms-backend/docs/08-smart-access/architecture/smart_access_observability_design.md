# SDMS Smart Access Observability Design

## 1. Logging Strategy
* **Structured Logging**: All logs are in JSON format for ingestion by ELK/Loki stack.
* **Traceability**: Every access attempt carries an `eventId` and `traceId` injected at the Edge and propagated through MDC (Mapped Diagnostic Context) across Face, Smart Access, and IoT modules.

## 2. Audit Logging
* `access_history` acts as the primary business audit log.
* Modifications to `curfew_policies` and `time_window_policies` are tracked using Hibernate Envers or custom audit tables, storing the `operator_id` and timestamp.

## 3. Metrics
* `access.evaluation.latency`: Histogram of time taken to evaluate rules.
* `access.decision.granted`: Counter of granted accesses.
* `access.decision.denied`: Counter of denied accesses, tagged by reason.
* `access.event.published`: Counter of events published.

## 4. Health Check
* Spring Boot Actuator exposes `/actuator/health`.
* Custom health indicators verify the connection to the Message Broker and the read/write capability to the PostgreSQL `access_history` partition.

## 5. Alerting
* **Alert 1**: If `access.decision.denied` spikes > 50 in 5 minutes (Possible brute-force or system error).
* **Alert 2**: If Message Broker lag on `IdentityVerifiedEvent` exceeds 1000 messages.
* **Alert 3**: Database write latency > 500ms.

## 6. Dashboard Metrics
* Real-time Grafana dashboard visualizing:
  - Throughput of access attempts per minute.
  - Pie chart of denial reasons.
  - Top 10 gates with the most traffic.
