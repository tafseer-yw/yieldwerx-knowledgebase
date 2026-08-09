---
id: handbook-third-sec-appB
title: "Appendix B — Master Glossary & Acronym Table"
source_id: handbook-third-html
source_section: sec-appB
edition: 3
status: current
confidentiality: internal
generated: true
---
Appendices

# Appendix B — Master Glossary & Acronym Table

## The Material Hierarchy

- **FAB** — Fabrication facility; root of the manufacturing hierarchy (`Facility_ID`).
- **ATS** — Assembly Test Site; packaging + final test facility, treated like a FAB.
- **Lot** — batch of wafers (≤ ~25) processed together; splits at assembly.
- **Wafer** — silicon disc carrying thousands of dies; 200/300 mm.
- **Die** — one chip on a wafer, addressed by X/Y; **Unit** — a packaged die.
- **IC** — integrated circuit; **Device / Part_Type** — the product design.

## Test Stages & Equipment

- **WAT / PCM** — Wafer Acceptance Test / Process Control Monitoring; tests process structures in scribe lines. **Test Area 1**.
- **Wafer Sort (WS)** — per-die electrical test of whole wafers via probe card. **Test Area 2**. `Facility_Type='W'`.
- **Final Test (FT)** — per-unit test of packaged parts via handler/socket. **Test Area 3**. `Facility_Type='F'`.
- **ATE** — Automated Test Equipment; executes test programs; emits STDF.
- **Test program** — the ATE’s recipe of tests, limits, bins (`Program_Name`).
- **Burn-in** — elevated stress screening for infant mortality.

## Data & Formats

- **STDF** — binary standard test-data format (one file ≈ one wafer pass); parsed by LinqToStdf fork.
- **ATDF** — ASCII twin of STDF; pipe-delimited; the debugging format.
- **Records:** **MIR/MRR** (file open/close, lot metadata), **WIR/WRR** (wafer open/close; WRR → Part_Count/Good_Count), **PIR/PRR** (die open/close; PRR → bins + X/Y), **PTR** (numeric result + limits), **FTR** (pass/fail only), **SDR/MPR** (multi-site).

## Binning & Yield

- **Bin** — category per die/unit; **Bin 1** = good by convention.
- **Hard Bin** — tester-assigned, immutable; **Soft Bin** — software-assigned, re-binnable by PAT/SWM.
- **Yield** — Good_Count ÷ Part_Count × 100.
- **Golden Rule** — Σ BIN_SUMMARY.Part_Count = WAFER.Part_Count.

## Statistics

- **Mean (μ) / StdDev (σ)** — center and spread; from TEST_SUMMARY.
- **Normal distribution** — bell curve; ±3σ ≈ 99.7%.
- **Outlier / maverick** — in-spec but statistically anomalous die.
- **Cpk** — min(limit clearance) ÷ 3σ; ≥1.33 production bar.
- **UCL/LCL vs USL/LSL** — control (process voice) vs spec (customer voice).
- **Western Electric/Nelson rules** — improbable-pattern alarms (5 rules used).
- **EWMA** — drift-sensitive weighted control chart.

## Platform Modules

- **CLM** — Custom Limit Management; overrides ATE limits at load; no engine; stamps `WAFER.CustomLimitVersionId`.
- **PAT** — Part Average Testing; Mean ± Nσ dynamic-limit outlier screening; automotive (AEC-Q100) driver. **DPAT** — real-time variant.
- **MVPAT** — multi-variate PAT; screens formulas across correlated parameters.
- **SWM** — Smart Wafer Mapping; spatial pattern detection (edge/cluster/scratch/adjacency/missing/delta). Internally “CWM”.
- **GDBN / GDBNZ** — per-bin good-die count guarantees; Z = cross-site (needs LG).
- **SPC** — Statistical Process Control; control charts + WE rules; batch + real-time (SignalR); R-computed.
- **SBYL** — Sort Bin Yield Limit; per-bin percentage bands; can hold material.
- **AMG** — Assembly Map Generation; pick-and-place maps (JCAP ASCII / MPS binary); must follow PAT/SWM.
- **LG** — Lot Genealogy; WS→assembly→FT lineage; orphan = unlinked FT lot.

## Architecture

- **UploadService / BrokerService** — folder-watch loader / JobCard router.
- **JobCard / RecordType / AJobQueue** — work ticket / event type / per-engine queue.
- **BC (LOTBC, WAFERBC…)** — loader business controllers populating tables.
- **Core tables** — LOT, WAFER, BIN_SUMMARY, TEST_PARAM_MAP, TEST_SUMMARY + per-device **dynamic tables**.
- **Lot_Sequence / Wafer_Sequence** — surrogate join keys; resolve first, always.
- `V_BI_*` — Power BI-facing SQL views (no API layer).
- Stack: ASP.NET MVC 5 / .NET 4.7.2, EF6 (+ EDMX in CLM), Dapper, SignalR, RDotNet, Castle Windsor, AutoMapper, Log4Net, Highcharts, LinqToStdf.

## Industry & Business

- **IDM / fabless / foundry / OSAT** — the industry role split (Ch 2).
- **AEC-Q100/Q101** — automotive qualification standards mandating PAT-class screening.
- **Excursion** — process abnormality; early detection is the product’s core ROI.
- **RMA** — customer returns; genealogy makes their analysis possible.
- **YMS** — Yield Management System, the product category.
