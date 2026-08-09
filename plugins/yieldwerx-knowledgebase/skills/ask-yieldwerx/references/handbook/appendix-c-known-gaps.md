---
id: handbook-third-sec-appC
title: "Appendix C — Known Gaps Register (Test Obligations)"
source_id: handbook-third-html
source_section: sec-appC
edition: 3
status: current
confidentiality: internal
generated: true
---
Appendices

# Appendix C — Known Gaps Register (Test Obligations)

- **G-17 (CLM):** ExpiryDate stored, not enforced — expired versions keep applying. Audit query required; document as known bug in test runs.
- **G-23 (CLM):** thread-safety — `LimitComparison.CompareList` shared mutable state; run ≥20 concurrent CLM uploads, check for cross-contamination.
- **G-03 (CLM):** CSV import validation failures can be silent — verify every invalid field surfaces an error.
- **G-02 (CLM):** missing InUse guard — two Production versions can be activated via direct DB writes; document behavior.
- **SPC:** legacy WCF path alive alongside Web API — test both for equivalence.
- **General:** no unit tests on main web controllers — prioritize integration coverage on highest-risk controllers.
- **SWM:** internal “CWM” naming — check consistency across endpoints, logs, UI.
- **General:** mixed ORM (EF Code-First + CLM EDMX) — verify CLM model sync after any schema change.
- **G-24 (docs):** terminology conflicts — see Appendix D.
