# Plugin System

## Purpose

Define how Kaidon should extend safely.

## Plugin Responsibilities

- register tools
- register templates
- register UI components
- register runtime hooks where allowed

## Required Metadata

- name
- version
- permissions
- compatibility range
- author
- trust signals

## Why This Matters

Ecosystem growth requires extensibility. Production trust requires governance.

## Tradeoffs

- Strong plugin review reduces ecosystem chaos.
- It increases friction for third-party contribution.

## Alternatives

- unrestricted plugin loading
- no plugin system, only internal integrations

## Verified Facts

- The directive explicitly calls for a plugin system and marketplace.

## Assumptions

- Tools and templates will be the highest-value early plugin types.

## Speculative Ideas

- Kaidon could later distinguish between local plugins, signed plugins, and
  verified marketplace plugins.

## Official References

- MCP: `https://modelcontextprotocol.io/`
