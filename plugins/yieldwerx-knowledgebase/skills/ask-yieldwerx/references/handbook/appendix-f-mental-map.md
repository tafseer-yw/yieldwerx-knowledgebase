---
id: handbook-third-sec-appF
title: "Appendix F — The Mental Map of the Entire Domain"
source_id: handbook-third-html
source_section: sec-appF
edition: 3
status: current
confidentiality: internal
generated: true
---
Appendices

# Appendix F — The Mental Map of the Entire Domain

This one page is the whole handbook compressed into a single picture. Skim it now even if the terms are unfamiliar; return to it after each Part and watch it fill in. When you can reconstruct this map from memory and explain every box out loud (the Feynman test), you have gone from zero to hero.

The yieldWerx domain on a single page

The yieldWerx domain on a single page

**How to read the map.** It flows top to bottom in four stages, resting on a foundation:

*Stage 1 — Made & tested (the manufacturing spine).* A chip is built in the FAB and tested three times: WAT/PCM checks the *process* (Test Area 1), Wafer Sort grades *every die* (Area 2), and after assembly turns dies into units, Final Test checks *every unit* (Area 3). Material nests as FAB → Lot → Wafer → Die → Unit. This is the physical reality everything else describes.

*Stage 2 — Writes data (the data spine).* Each test stage emits STDF/ATDF files (green) built from nested records; those files carry bins and parametric measurements with die coordinates; the upload pipeline parses them into the SQL Server database (LOT, WAFER, BIN_SUMMARY, TEST_PARAM_MAP, TEST_SUMMARY, and dynamic tables). The Golden Rule — bin counts sum to part count — is the invariant that anchors all data validation.

*Stage 3 — Turns into decisions (the analytics engines).* Each module answers exactly one question: CLM (“whose spec applies?”), PAT/MVPAT (“any maverick dies?”), SWM (“do failures form shapes?”), GDBN/SBYL (“did we hit the promised counts and percentages?”), SPC (“is the process trending bad?”), and AMG/LG (“which dies do we pick, and where did they come from?”). The red line is the one ordering law that ships bad silicon if broken: PAT and SWM must re-bin *before* AMG picks dies.

*Stage 4 — What people see (the outputs).* All of that surfaces as 300+ reports, a handful of key business metrics (yield %, cost per good die, Cpk, Pareto, cross-stage loss), root-cause analytics (commonality, ANOVA, DOE, PCA, correlation, T-tests), and the web/desktop/Power BI surfaces.

*The foundation and the future.* Under everything sit the statistics (Chapter 5), the architecture (Chapter 7), and the economics (Chapters 1–2). And the whole platform is evolving toward the unified, versioned, audited Rule Engine (Chapter 15) amid industry shifts to AI/ML yield, chiplets, advanced packaging, and traceability-as-regulation.

**Using the map to learn.** Every time you meet a new concept anywhere in this handbook, locate its box on this map before trying to memorize it. A fact with a home on the map is a fact you will keep; a fact without one will slip away. This single page is the difference between “a thousand disconnected details” and “one system I understand.”
