---
id: handbook-third-sec-appD
title: "Appendix D — Naming Caution: CLM, SWM, GDBN"
source_id: handbook-third-html
source_section: sec-appD
edition: 3
status: current
confidentiality: internal
generated: true
---
Appendices

# Appendix D — Naming Caution: CLM, SWM, GDBN

The source training documents (v2.0/v3.0) disagree on acronym expansions, and your manager’s consolidated document explicitly asks that an SME confirm before external use:

- **CLM:** “Custom Limit Management” vs “Custom Limit Module” — same feature, naming only.
- **SWM:** “Smart Wafer **Mapping**” (spatial fail-pattern detection — the behavior described throughout Part 7 and this handbook) vs “Smart Wafer **Merge**” (merging multi-stage datasets) — *materially different features*; confirm which the live application implements.
- **GDBN:** “Good Die per Bin Number” (bin-count guarantees — used in this handbook) vs “Good Die Bad Neighbourhood” (spatial adjacency — which overlaps SWM’s adjacent-die rule) — confirm against the live application.

**Practical guidance:** in internal writing, use the acronyms; when full names matter (customer docs, PRDs), verify with product/SME first. This handbook follows the consolidated document’s primary (v2.0) readings.
