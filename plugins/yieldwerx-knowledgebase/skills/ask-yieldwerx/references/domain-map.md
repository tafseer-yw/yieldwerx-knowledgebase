# YieldWerx Domain Map — current domain catalog for QA design

This is the **current generic domain starting point** for QA and product analysis.
Tools such as PROBE can read this file instead of repeating domain concepts, which
keeps their own instructions product-agnostic and token-efficient.

**Read this the way the framework is built: the bundled wafer-map / cluster-detection
demo is ONE worked example of ONE module, not the definition of YieldWerx.** Cluster
detection is Chapter 17 of the domain handbook — one of ~10 Rule-Engine / analysis
modules. When you stand up QA for a PAT, SPC, GDBN, CLM, or reporting app, map the
feature to the module(s) below and pull its vocabulary, calculations, and boundary
menu from here.

Authority: _The yieldWerx Domain Handbook, Third Edition_ (chapter pointers in
brackets). It is not exhaustive or automatically authoritative over an approved
feature specification or durable product decision. Extend it as modules are covered.

---

## 1. Module catalog — what YieldWerx does

Each row is a candidate app/feature area. "QA verifies" is the starting point for
Spec Probe's verification-surface map.

| Module                                               | What it does                                                                                                       | QA verifies                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pipeline / Upload** [7]                            | Parses STDF/ATDF/CSV from test equipment into SQL Server (LOT/WAFER/BIN_SUMMARY/TEST_*)                            | Parse correctness, encoding, batch atomicity, error recovery, die-conservation (§5), CLM applied at load time                                              |
| **CLM — Custom Limit Management** [9]                | Overrides ATE spec limits per customer/device/program at load time; re-grades parametrics                          | Exact program-name match (checksum), scope + role enforcement (CLM Admin/Device Admin/User), reports show CLM vs ATE limits, applied before PAT/SPC        |
| **PAT — Parametric Analysis/Tagging** [10]           | Statistical outlier detection: flags dies N σ from mean, re-bins to a soft failure bin (e.g. 130)                  | Die conservation (sum-in = sum-out), correct failure-bin assignment, mean/σ recompute, order (PAT before SWM before AMG), yield drop after PAT is expected |
| **MVPAT — Multi-variate PAT** [10]                   | Correlates multiple parameters to catch dies suspicious on parameter _combinations_                                | Cross-parameter/covariance logic, same conservation + bin rules as PAT                                                                                     |
| **SWM — Smart Wafer Mapping** [11]                   | Spatial pattern detection (edge rings, clusters, scratches) via fail-die adjacency; inks neighbors                 | Flood-fill (4- vs 8-way), inking layer counts + mode, edge-ring detection, order dependency                                                                |
| **GDBN — Good Die per Bin Number** [11]              | Contractual **count** guardrail: Min_Good_Die ≤ count(bin) ≤ Max_Good_Die, evaluated after PAT/SWM                 | Count-bound enforcement, GDBNZ genealogy variant, null-data robustness, alert/hold/pass actions                                                            |
| **SBYL — Sort Bin Yield Limit** [11]                 | Contractual **percentage** guardrail per bin (min% ≤ share ≤ max%)                                                 | % calc correctness, min-band violation ("suspiciously good" is anomalous too), hold logic                                                                  |
| **SPC — Statistical Process Control** [12]           | Trend monitoring: control charts (X-bar, Range, Sigma, EWMA), μ±3σ limits, Nelson/Western-Electric rules           | Control-limit computation off the historical baseline, rule detection, drift-detection, control-vs-spec distinction                                        |
| **AMG — Automatic Map Generation** [13]              | Selects dies to ship from upstream module results; depends on SWM/PAT ordering                                     | Dependency + ordering correctness on upstream results                                                                                                      |
| **LG — Lot Genealogy** [13]                          | Tracks wafer → assembly lot → unit chain for end-to-end traceability; required for GDBNZ                           | Die-to-unit mapping, cross-site traceability, assembly-yield-loss (§5)                                                                                     |
| **Cluster Detection (CD)** [17] — _the bundled demo_ | Rule-Engine module: detects failing-die clusters (flood-fill / N×N matrix), inks surrounding dies to a failure bin | Signature matching, rule application (bin candidates + inking layers/mode), spatial filters (reticle/zone/probe-site), pass-number assignment, determinism |
| **Rule Engine** [7, 15]                              | Unified policy/rule/signature pipeline that runs the modules above data-driven, async                              | Policy versioning, provider contracts, evaluation ordering, data isolation per run, queue lifecycle                                                        |
| **Reports** [8]                                      | Bin Summary, Parametric (Histogram/Trend/Scatter/Heat Map/Fail), Wafer Map, Trend, Power BI                        | Generation correctness, filtering, drill-down context, freshness, CLM-aware limits, functional tests excluded from parametric analytics                    |
| **Dashboards** [13]                                  | Web live monitoring; PAT/SWM/GDBN/SBYL/SPC roll-ups                                                                | Real-time updates, module status accuracy, alert/hold visibility                                                                                           |

---

## 2. Data hierarchy & identifiers [7]

```
LOT (one row per lot) — Lot_ID, Program_Name, Facility_ID, Facility_Type ('W'=Wafer Sort, 'F'=Final Test), Part_Type
 └─ WAFER (one per wafer) — Wafer_ID, Part_Count (dies tested), Good_Count, Yield%
     ├─ BIN_SUMMARY (one per bin per wafer) — Hard_Bin_No (immutable), Soft_Bin_No (mutable), Part_Count
     ├─ TEST_PARAM_MAP (per parameter) — Test_Number, Test_Name, Low_Limit, High_Limit, Units
     ├─ TEST_SUMMARY (per-parameter stats per wafer) — Min, Max, Mean, StdDev
     └─ dynamic per-die tables (largest storage) — X, Y, Test_1..Test_n measured values
```

- **Die X/Y** are anchored by the wafer **notch** (crystal orientation). They drive wafer
  maps, SWM, AMG, and all spatial analytics.
- **Test stages:** TA1 = WAT/PCM (process, not product), TA2 = Wafer Sort (`Facility_Type
'W'`, per-wafer STDF), TA3 = Final Test (`'F'`, packaged units, speed binning).
- **Genealogy (LG):** one FAB lot splits into multiple assembly lots → Final-Test lots;
  enables backward (unit → origin wafer) and forward (wafer → shipments) trace.

---

## 3. Core vocabulary — universal vs module-specific

Flag every concept so a designer knows what carries to the next app. **U** = universal to
all YieldWerx apps · **M** = specific to a module family (wafer-map/spatial or PAT/SPC).

| Term                           | U/M             | One-line meaning                                                                     |
| ------------------------------ | --------------- | ------------------------------------------------------------------------------------ |
| Lot / Wafer / Die / Unit       | U               | Batch → disc → chip at (X,Y) → packaged part                                         |
| Hard bin                       | U               | ATE-assigned, coarse, **immutable** classification                                   |
| Soft bin                       | U               | Test-program/analysis-assigned, fine, **mutable** — PAT/SWM/CD change it             |
| Bin 1 / Bin 130+               | U               | Conventionally good / typical failure-suspicious bins                                |
| Parametric test                | U               | Numeric measurement with Low/High limits; feeds stats/SPC/PAT                        |
| Functional test                | U               | Pass/fail only; **must be excluded** from parametric analytics                       |
| Spec limit (LSL/USL)           | U               | Customer/design requirement; violating = bad part                                    |
| Control limit (LCL/UCL)        | U (SPC)         | μ±3σ of process history; violating = process changed (fires before spec)             |
| Yield                          | U               | % of dies passing all tests                                                          |
| Mean μ / StdDev σ              | U               | Center / typical distance from center                                                |
| Cpk                            | U               | Process-capability index vs spec limits (≥1.33 = production grade)                   |
| Outlier / Maverick             | M (PAT)         | Die N σ from mean; statistically suspicious despite passing limits                   |
| Signature / Rule / Policy      | M (Rule Engine) | Shape (no action) / bins+filter+inking action / scope+sequence+alerts                |
| Inking / Layering / Flood-fill | M (SWM, CD)     | Flip neighbor good dies to a failure bin; ring count + mode; connected-region growth |
| Edge ring / Cluster / Scratch  | M (spatial)     | Perimeter / contiguous-blob / linear failure patterns                                |
| Adjacency (4-way vs 8-way)     | M (spatial)     | Whether diagonals count as "touching"                                                |
| Excursion / Process drift      | U               | Abnormal deviation / gradual parameter shift over time                               |

The rest of the glossary (Appendix B of the handbook) extends this — add rows as needed.

---

## 4. Data formats & sources [6]

| Format   | Meaning                                              | Carries                                                 |
| -------- | ---------------------------------------------------- | ------------------------------------------------------- |
| **STDF** | Standard Test Data Format (binary industry standard) | Lot/wafer/die metadata, test parametrics, bins, X/Y     |
| **ATDF** | ASCII twin of STDF (human-readable)                  | Same as STDF                                            |
| **CSV**  | Device-specific custom export                        | Varies per fab (the demo's wafer CSV is one such shape) |
| **WAT**  | Wafer Acceptance Test files                          | Process parametrics (early-warning)                     |

**STDF records:** MIR (lot metadata → LOT), WIR (wafer → WAFER), PTR (one parametric
measurement — most numerous), FTR (one functional pass/fail — exclude from parametrics),
PRR (die close: hard/soft bin, X/Y → BIN_SUMMARY + maps), TSR (per-wafer per-parameter
stats → TEST_SUMMARY), MPR (multi-site parametric — MVPAT).

---

## 5. Key calculations — the oracle's raw material

An oracle is required whenever a feature shows a **calculated, aggregated, transformed,
classified, or rule-derived** value (see `/forge-oracle`). Verbatim from the handbook:

- **Yield %** = `Good_Count ÷ Part_Count × 100`
- **Standard deviation σ** = sqrt(mean of squared distances from the mean)
- **Cpk** = `min( (USL − Mean) ÷ 3σ , (Mean − LSL) ÷ 3σ )` — ≥1.33 is production grade;
  rewards centered processes.
- **Control limits (SPC)** = `Mean ± 3σ` of the **historical baseline** (not the current wafer).
- **Assembly yield loss** = `(GoodCount@WaferSort − GoodCount@FinalTest) ÷ GoodCount@WaferSort × 100`
- **PAT threshold** = die beyond `Mean ± Nσ` (N typically 3–6) → re-binned to soft failure bin.
- **GDBN** = enforce `Min_Good_Die ≤ count(Soft_Bin) ≤ Max_Good_Die`, evaluated **after** PAT/SWM.
- **SBYL** = enforce `min% ≤ count(Soft_Bin) ÷ Total × 100 ≤ max%` per bin.
- **Nelson / Western-Electric rules (SPC)** — e.g. 1 point beyond ±3σ; 6 consecutive rising/
  falling = trend; 2 of 3 beyond 2σ; 8 consecutive beyond 1σ.

**Conditional die/bin data-integrity rule:**

> For workflows that ingest or transform die/bin populations,
> **Σ BIN_SUMMARY.Part_Count across all bins = WAFER.Part_Count.** Every processed die is
> in exactly one resulting bin unless the approved module contract explicitly defines another
> population. This invariant does not automatically apply to policy administration, queue-only,
> reporting, dashboard, WAT, or other non-die workflows; derive their integrity invariant from
> the applicable contract instead.

---

## 6. Order of operations [7, 15]

Reference ordering for a policy that enables the complete die-analysis chain:

```
Hard Bin  →  CLM (load time)  →  PAT/MVPAT  →  SWM  →  CD / AMG  →  GDBN / SBYL  →  Reports
```

This is a configurable reference pipeline, not a universal workflow. A policy may omit modules,
select variants, or use a different approved sequence. Confirm the enabled modules, policy
version, effective dates, and exact ordering for each feature. Where modules compose, changing
the order can change results. Rule Engine executions may be asynchronous (queue → lease →
completed/failed/timeout); apply queue-state analysis only when the feature uses that lifecycle.

---

## 7. Per-module boundary / negative menu

The reusable "hard cases" catalog. Case Forge must cover, and Case Audit must check, the
boundaries for whichever module(s) a feature touches — not just the wafer ones.

| Module                       | Boundary / negative cases to cover                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Any ingest**               | Missing meta headers, empty die rows, wrong column count, malformed STDF/ATDF, duplicate/out-of-bounds coordinates, encoding, die-conservation mismatch                                                            |
| **Any calculated result**    | Empty/zero denominator, rounding/precision at storage and display boundaries, minimum/maximum populations, single value, null/non-finite inputs                                                                    |
| **Binning**                  | Untested position renders empty, hard-vs-soft divergence after re-bin, unknown bin number                                                                                                                          |
| **PAT / MVPAT**              | Die exactly at N σ (in vs out), σ = 0 (identical values), recompute after re-bin, functional test not screened                                                                                                     |
| **SWM / Cluster Detection**  | Cluster exactly at min size (detected vs not), 4- vs 8-way adjacency edge case, inking layer count at boundary, empty wafer, single-die wafer, scattered fails (each size 1), notch orientation UP/DOWN/LEFT/RIGHT |
| **GDBN**                     | Count exactly at Min/Max_Good_Die, null/absent bin, alert-vs-hold-vs-pass threshold                                                                                                                                |
| **SBYL**                     | % exactly at min and max band edge, "suspiciously good" (below min), zero total                                                                                                                                    |
| **SPC**                      | Point exactly at control limit, exact Nelson-rule run length (e.g. 6th consecutive), baseline with too few points, control-vs-spec confusion                                                                       |
| **CLM**                      | Program-name exact-match vs near-miss, scope/role denied, reports show CLM (not ATE) limits, applied-before-PAT ordering                                                                                           |
| **LG / genealogy**           | Split lot mapping, missing link, cross-site unit, assembly-yield-loss with 0 sort-good                                                                                                                             |
| **Reports / dashboards**     | Empty result set, drill-down context loss, stale/fresh data, functional test leaking into parametric report, filter with no matches                                                                                |
| **Rule Engine (any module)** | Queue states: queued, completed, failed, timeout; stale prior-run data isolation; permission-denied per role                                                                                                       |
| **Policy/configuration**     | Draft/approved/retired transitions, version/effective-date overlap, concurrent edits, unauthorized approval, rollback, audit/signature completeness                                                                |
| **Authorization**            | Each role × action × scope, cross-site/customer/device isolation, revoked access, direct-API bypass, separation of duties                                                                                          |
| **Async/integration**        | Duplicate delivery, retry/replay, idempotency, out-of-order events, partial failure, timeout, recovery, external contract drift                                                                                    |
| **Audit/notification**       | Actor/time/before-after accuracy, immutable history, alert routing, deduplication, acknowledgement, delivery failure                                                                                               |

---

## 8. Wrong-data-risk surfaces

Any of these displayed to a user is a **wrong-data risk** — a chart/oracle/DB mismatch is
severity `blocker`, always (see `.claude/rules/chart-testing.md`): yield %, bin counts/%,
Cpk/σ/mean, PAT/SWM/CD re-bin decisions and inked coordinates, SPC control alarms, GDBN/SBYL
compliance verdicts, CLM-adjusted limits, genealogy links, assembly-yield-loss.

When using this map for test design, create an independent expected-result oracle for
calculated or transformed data. A visual snapshot alone does not prove data correctness.

---

## 9. Generic discovery for unmapped features

When a feature or module is absent above, continue analysis using confirmed sources and record:

- feature family, entities, identifiers, inputs, outputs, and data lineage;
- states, legal transitions, roles, scopes, approvals, signatures, and audit history;
- calculations, classifications, transformations, defaults, configuration, and versioning;
- dependencies, ordering, effective dates, isolation, idempotency, retries, and concurrency;
- external contracts, failure recovery, observability, retention, and freshness;
- an evidence/data strategy and an independent truth strategy, or `N/A` with a reason.

Mark unconfirmed semantics `TODO(domain)` and route a `Q-NN`; absence from this map must not
force wafer, binning, statistical, chart, or asynchronous Rule Engine assumptions.
