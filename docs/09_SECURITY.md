# Security

## Purpose

Define the baseline security posture for Kaidon.

## Threat Areas

- prompt injection
- memory poisoning
- tool abuse
- tenant isolation failure
- secret leakage
- artifact exfiltration
- plugin supply-chain risk

## Baseline Controls

- workspace-scoped secrets
- policy-checked tool invocation
- audit trail for sensitive actions
- output validation on tool results
- plugin permission declarations
- memory provenance and revocation

## Access Model

- RBAC for role-based defaults
- ABAC for sensitive environment and workspace rules

## Why Both

RBAC is easier to reason about. ABAC is needed for runtime-sensitive controls.

## Tradeoffs

- Strong policy slows early UX.
- Weak policy creates later migration pain and incident risk.

## Alternatives

- RBAC only: insufficient for fine-grained agent actions
- trust-based plugin model: unacceptable

## Verified Facts

- The directive explicitly requires tenant isolation, policy, audit logs, and
  sandboxing.
- MCP and plugin ecosystems increase the need for permission-aware execution.

## Assumptions

- Tool execution risk will exceed model hallucination risk in many deployments.

## Speculative Ideas

- Kaidon could expose a first-class policy simulator to preview why a tool call
  would be allowed or denied.

## Official References

- Kubernetes security docs: `https://kubernetes.io/docs/concepts/security/`
- OpenTelemetry security considerations: `https://opentelemetry.io/docs/`
- Dapr security overview: `https://docs.dapr.io/operations/security/`
