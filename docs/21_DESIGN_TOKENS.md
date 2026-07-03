# Design Tokens

## Purpose

Define the first token layer for Kaidon.

## Color

- base: `#0E1116`
- panel: `#161A21`
- border: `#262B35`
- text: `#ECEEF2`
- muted: `#8B93A3`
- accent: `#F5A623`
- secondary: `#6E7BFF`

## Radius

- xs: `6px`
- sm: `8px`
- md: `12px`
- lg: `16px`
- xl: `20px`

## Spacing

- 4
- 8
- 12
- 16
- 20
- 24
- 32

## Motion

- fast: `120ms`
- standard: `180ms`
- panel: `240ms`

## Typography

- display: geometric sans
- body: geometric sans
- mono: JetBrains Mono class

## Verified Facts

- These values align with existing repo-local design rules.

## Assumptions

- The current amber-accent dark-first direction remains authoritative.

## Tradeoffs

- Tight token discipline reduces novelty but improves consistency.

## Alternatives

- broader token palette
- light-first system

## Speculative Ideas

- Add semantic signal tokens later for approval, warning, cost, and latency.

## Official References

- Radix component philosophy: `https://www.radix-ui.com/`
- shadcn/ui: `https://ui.shadcn.com/`
