# Memory OS

## Purpose

Define the long-term and short-term memory layer for Kaidon.

## Memory Types

- working memory
- session memory
- workspace memory
- organizational memory
- artifact memory
- retrieval cache

## Design Principles

- memory is not a chat transcript dump
- memory must carry provenance
- memory must support decay, retention, and redaction
- memory must be policy-scoped

## Recommended Model

Store memory records with:

- content
- summary
- embedding metadata
- provenance
- confidence
- retention policy
- access scope
- last-validated timestamp

## Why This Matters

Unstructured long-term memory becomes a liability:

- stale facts
- prompt injection residue
- privacy leakage
- poor retrieval quality

## Storage Recommendation

- PostgreSQL tables for primary memory records
- pgvector for semantic retrieval
- graph edges for relationship-aware lookup
- Redis only for ephemeral caches

## Tradeoffs

- Rich metadata increases write overhead.
- It dramatically improves debugging, cleanup, and governance.

## Alternatives

- vector-only memory store: fast prototype, weak provenance
- transcript-only memory: simplest, poor operational quality

## Verified Facts

- pgvector is a PostgreSQL extension commonly used for vector search.
- Mem0 is a dedicated memory-focused product and category signal.

## Assumptions

- Memory quality will matter more than memory quantity.

## Speculative Ideas

- Kaidon could support memory “trust levels” and automatic quarantine of
  low-confidence memory.

## Official References

- PostgreSQL docs: `https://www.postgresql.org/docs/`
- pgvector: `https://github.com/pgvector/pgvector`
- Mem0: `https://docs.mem0.ai/`
