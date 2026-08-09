---
id: handbook-third-sec-ch12
title: "Chapter 12 — SPC: Watching the Process, Not the Part"
source_id: handbook-third-html
source_section: sec-ch12
edition: 3
status: current
confidentiality: internal
generated: true
---
Part IV · The Analytics Modules

# Chapter 12 — SPC: Watching the Process, Not the Part

## 12.1 The predictive module

Everything so far judges *material already made*. **SPC (Statistical Process Control)** watches the *process over time* to catch drift **before** it produces bad wafers. Recall the pipeline latency from Chapter 3: weeks of wafers are always in flight — by the time yield visibly drops, a month of production may already be doomed. SPC’s job is to alarm while the drift is young. PAT is retrospective (screen finished dies); **SPC is predictive** (protect future ones).

## 12.2 How it works — Chapter 5, operationalized

Engineers define **SPC templates**: which parameter to monitor (`Test_Number`), which **control chart** type (X-bar for means, Range, Sigma, or **EWMA** — which weights recent points to catch small sustained shifts a plain X-bar misses), and control limits (**UCL/LCL = Mean ± 3σ** by default, plus spec USL/LSL context). Each uploaded wafer adds a plot point (`SpcTemplateResult`); the **Western Electric/Nelson rules** (Chapter 5.7 — you already know all five) evaluate the chart; violations write `RealtimeChartSpcFailure` and email via SpcAlertMailer.

WAT/PCM parameters (Chapter 3) are prime SPC targets — process trends surface there first.

## 12.3 Two modes, two plumbing paths

- **Batch SPC:** evaluated per wafer upload.
- **Real-time SPC:** results pushed live to browser dashboards over **SignalR**, sub-5-second latency target.

Under the hood, statistics are computed via an **R-language bridge (RDotNet)** — meaning a whole QA category exists of *“does R’s math agree with SQL’s math?”* (compare R-computed Mean/StdDev to `TEST_SUMMARY`). And a **legacy WCF SPC service** still runs alongside the newer Web API path — *both* must be tested for equivalent results (documented technical debt).

## 12.4 Field Notes 🧭

- SPC is the module where your Chapter 5 knowledge is used most literally — control limits, sigma, and Western Electric rules appear verbatim in configs and alerts.
- Real-time + concurrency = race-condition territory (SignalR under simultaneous uploads is called out in the training plan as a specific risk).
- Hold configuration (`HoldSPCMultipleTestProgram`) can suppress SPC for chosen programs — “why didn’t SPC fire?” sometimes has a configuration answer, not a bug answer.
- An SPC alarm is an *investigation trigger*, not a verdict — the process may still be making in-spec parts (control ≠ spec, Chapter 5.6). Educating users on this distinction is a genuine UX/product concern for your PRDs.
- Rule 2 (nine same-side points) is the workhorse in practice — sustained shifts are the most common real drift signature.

## 12.5 Jargon Decoded

- **Control chart:** time-series of a statistic with control limits drawn on.
- **X-bar chart:** control chart of means (per wafer/lot).
- **EWMA chart:** exponentially-weighted chart; sensitive to small persistent shifts.
- **Violation:** a Western Electric/Nelson rule firing.
- **Template (SPC):** a saved monitoring definition (parameter + chart + limits).
- **Excursion:** the process abnormality SPC exists to catch early.

## 12.6 Acronyms

- **SPC** — Statistical Process Control
- **UCL/LCL, USL/LSL** — control vs spec limits (Chapter 5)
- **EWMA** — Exponentially Weighted Moving Average
- **WCF** — the legacy service tech in SPC’s second code path
- **R** — the statistics language behind SPC computations

## Global Trends & the Bigger Picture 📈

Process control is going real-time and predictive. **Streaming SPC, EWMA and multivariate charts, and AI-driven drift detection** are replacing periodic batch review, so excursions are caught while corrective action can still save the wafers in flight. This is the same predictive-maintenance wave sweeping smart manufacturing generally. *For management:* SPC is the platform’s early-warning system — the module most likely to *prevent* a loss rather than merely explain one, which is the highest form of ROI. *For engineers:* the distinction between control limits (the process’s own voice) and spec limits (the customer’s) is the conceptual key, and it only grows more important as monitoring becomes continuous.

## Bug-Hunting, Parity & Hardening Tips 🐞

SPC’s split implementation is a rich bug source. Verify **numeric parity between the R engine and SQL** (R-computed Mean/StdDev must match TEST_SUMMARY within tolerance) and **functional equivalence between the legacy WCF path and the Web API path** — both are live and must agree. Stress **real-time push under concurrency**: SignalR latency and race conditions appear only under simultaneous uploads, so load-test for the sub-5-second target. Check the **Western Electric rules for off-by-one** (is it truly 9 consecutive points, not 8?) and confirm the **control-limit recompute window** is correct. Remember an SPC alarm is an *investigation trigger, not a verdict* — test that in-spec-but-out-of-control cases alarm as designed.

## Did You Know? 💡

- **The control chart was sketched on a single memo in 1924.** Walter Shewhart of Bell Labs drew the first control chart on a one-page memo — arguably the birth of statistical process control. Everything SPC does still descends from that sketch.
- **SPC crossed the Pacific twice.** W. Edwards Deming carried Shewhart’s methods to Japan after WWII, fueling the Japanese quality revolution — which then boomeranged back to the West as “Six Sigma.” The math monitoring your wafers has already circled the globe once.

## 12.7 Never Forget ⭐

1. **SPC is predictive; PAT is retrospective.** Process vs parts.
2. **UCL/LCL = Mean ± 3σ of the process** — violating control is an alarm even when parts are in spec.
3. The five Western Electric rules from Chapter 5 are the exact alarm logic.
4. Two code paths (legacy WCF + Web API) and an R bridge = three cross-verification obligations for QA.
5. Real-time SPC has a **<5 s SignalR latency** target under concurrency — test it under load.

## 12.8 Summary

SPC monitors parameters wafer-over-wafer on control charts (X-bar, Range, Sigma, EWMA) with Mean ± 3σ control limits, firing Western Electric/Nelson rule violations as alerts and live SignalR dashboard updates. Its statistics run through an R bridge, alongside a legacy WCF path that must stay equivalent to the modern one. It is the platform’s early-warning system: catching process drift while corrective action can still save the wafers in flight.

## 12.9 Quiz — Chapter 12

**Q1.** Contrast PAT and SPC in one sentence each: what does each protect, and when does each act?

**Answer.** PAT protects the *customer* from anomalous finished dies, acting after test on each wafer. SPC protects *future production* from process drift, acting continuously over time.

**Q2.** A parameter’s wafer means: 0.45, 0.46, 0.46, 0.47, 0.47, 0.48, 0.48, 0.49, 0.49 (all within control limits). Which rule should fire and what does it mean physically?

**Answer.** Rule 2 approaches — that’s 9 consecutive means above… note they’re also *steadily increasing*: six-plus successive rises trips **Rule 3 (trend)** first. Physically: progressive drift — e.g., a tool parameter creeping, chamber aging.

**Q3.** Why would you compare R-computed statistics against TEST_SUMMARY values, and what tolerance philosophy applies?

**Answer.** SPC statistics flow through the R bridge (RDotNet); TEST_SUMMARY comes from the SQL loader path. Two independent implementations of the same math must agree within floating-point tolerance — divergence means one path is wrong.

**Q4.** Name the two SPC service code paths and the QA obligation they create.

**Answer.** Legacy WCF service and the newer Web API path. Both are live; QA must verify functional equivalence of results across both until the legacy path is retired.

**Q5.** A user complains “SPC alarmed but all parts pass spec — the software is broken.” Draft your two-sentence explanation.

**Answer.** “SPC monitors whether the *process* is behaving like its normal self, using limits computed from its own history — much tighter than spec. The alarm means ‘something changed; investigate now,’ precisely so parts never get near spec limits.”

**Q6.** Which chart type catches a slow 0.3σ persistent shift soonest, and why?

**Answer.** **EWMA** — it accumulates weighted evidence across consecutive points, so a small persistent shift compounds into a signal long before any single point nears 3σ.
