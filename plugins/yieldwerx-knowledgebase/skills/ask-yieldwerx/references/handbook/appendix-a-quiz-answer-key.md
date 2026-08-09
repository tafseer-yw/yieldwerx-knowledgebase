---
id: handbook-third-sec-appA
title: "Appendix A — Quiz Answer Key (Worked Answers)"
source_id: handbook-third-html
source_section: sec-appA
edition: 3
status: current
confidentiality: internal
generated: true
---
Appendices

# Appendix A — Quiz Answer Key (Worked Answers)

## Chapter 0

**A1.** Its conductivity is *switchable* by a control voltage. A conductor is always on, an insulator always off — neither can represent changing 1s and 0s. A switchable material can compute.

**A2.** Quartz sand (raw SiO₂, purified to nine-nines silicon) → ingot (single flawless crystal cylinder grown from the melt) → wafer (thin polished disc sliced from the ingot; the FAB prints circuits on it) → die (one chip in the printed grid, addressed by X/Y) → unit (a die cut out and packaged with pins and markings).

**A3.** Doping is implanting trace impurity atoms into silicon to create N-type (extra electrons) and P-type (electron-deficient) regions. Pure silicon is a mediocre conductor with no useful structure; N/P junctions arranged with a gate form transistors — no doping, no switch, no chip.

**A4.** Dies are printed in a grid, so each has a row/column position; the wafer’s edge notch fixes the orientation, making X/Y coordinates unambiguous across machines and facilities. Depends on it: wafer maps (plot each die at its position), SWM (spatial pattern detection), AMG (tell the assembly machine which positions to pick) — any two suffice.

**A5.** Printing the whole wafer at once means 20,000 dies cost about the same to make as one, so the per-chip price collapses. But it also means every nanometre-scale step must succeed everywhere on the wafer across dozens of layers — statistically impossible to do perfectly, so some dies always fail, and managing that fraction (yield) becomes a permanent discipline.

## Chapter 1

**A1.** Yield = 10,250 ÷ 12,500 × 100 = **82%**.

**A2.** Cost/die = $8,000 ÷ good dies. At 95%: 380 good → **$21.05**. At 70%: 280 good → **$28.57** — a 36% cost increase from yield alone. Software that recovers even a few yield points pays for itself; that’s the category’s existence proof.

**A3.** Tray = wafer; cookie = die; corner cluster = localized contamination / spatial defect (SWM’s domain); rising burn rate = process drift over time (SPC’s domain).

**A4.** Yield dropped. Cost per good die = wafer cost ÷ good dies, so fewer good dies raises it with no price change.

**A5.** Position (spatial patterns → SWM), statistics (outliers → PAT), and trend (drift over time → SPC).

## Chapter 2

**A1.** IDM = does everything in-house; fabless = designs but doesn’t manufacture; foundry = manufactures wafers for others; OSAT = packages and final-tests for others.

**A2.** Its manufacturing data is born in *other companies’* facilities, in scattered formats. Without a YMS it has no unified view of its own product’s health — the aggregation problem is worst for fabless.

**A3.** Detect (yield trend shows Fab A drifting) → diagnose (wafer maps show edge-ring failures) → trace (genealogy identifies affected lots/shipments) → contain (hold/quarantine suspect material).

**A4.** yieldWerx converts undigested test data into avoided losses: earlier excursion detection saves weeks of bad wafers; PAT screening prevents expensive field failures; traceability wins/keeps quality-critical contracts; automation frees engineers. It typically pays for itself the first time it catches an excursion early.

**A5.** Pipeline (UploadService parsing STDF into SQL Server); analytics engines (PAT, SWM, SPC, etc. auto-running per upload); apps (web app, desktop app, Power BI).

## Chapter 3

**A1.** WAT/PCM = Test Area 1 → Wafer Sort = Test Area 2 → Final Test = Test Area 3.

**A2.** WAT measures the *process* via purpose-built test structures in the scribe lines (streets between dies). A failing wafer is scrapped before assembly spends packaging money on it — failure caught before value is added.

**A3.** Probe card → Wafer Sort; handler → Final Test; scribe line → WAT/fabrication; singulation → assembly; speed grade → binning at WS/FT.

**A4.** Packaged units at Final Test. Lot Genealogy (LG) links it back to origin wafer-sort lots.

**A5.** “Which wafers and which sibling assembly lots share history with the failing units?” — i.e., scoping the problem back to origin and across to affected siblings. Without LG the split severs that lineage.

**A6.** Wafer Sort is a cost filter: packaging a dead die wastes assembly money and capacity. Final Test is the quality gate for what packaging itself may have broken.

## Chapter 4

**A1.** The **Soft Bin** — stored in `BIN_SUMMARY.Soft_Bin_No`. Hard bins are never modified post-test.

**A2.** 12,300 + 1,200 + 1,450 = 14,950 ≠ 15,000. **Golden Rule violated** — 50 dies unaccounted; a loader bug (or missing bin rows). Escalate; data can’t be trusted until reconciled.

**A3.** 12,300 ÷ 15,000 × 100 = **82%**.

**A4.** FTRs have no numeric value — nothing to plot; including them would corrupt distribution statistics. They contribute pass/fail to bin counts only.

**A5.** Feature. PAT re-binned 42 statistical outliers from Bin 1 into PAT fail bin 130; conservation (42 out = 42 in) is exactly right.

**A6.** Spec limits → `TEST_PARAM_MAP` (Low_Limit/High_Limit); mean and σ per wafer → `TEST_SUMMARY`.

## Chapter 5

**A1.** 1.20 ± 3×0.05 → **1.05 to 1.35 V**; ≈ **99.7%** of a healthy population lies inside.

**A2.** Passes spec (1.45 ≤ 1.50). It’s (1.45−1.20)/0.05 = **5σ** out. PAT ±4σ limits are 1.00–1.40 V → **PAT fails it** and re-bins it despite the spec pass. Textbook maverick.

**A3.** Upper: (3.0−2.8)/(3×0.05) = 1.33; lower: (2.8−2.0)/0.15 = 5.33. **Cpk = 1.33** — meets the usual production bar, but only just, and entirely limited by the upper side. Best single fix: **center the mean** (shift toward 2.5), which would raise Cpk without touching σ.

**A4.** Control limits describe the process’s own habitual behavior; spec limits describe customer requirements. A 50-minute commute (normal: 30±5) means *something changed* — investigate now, while you’re still arriving on time. SPC alarms on change, not on failure.

**A5.** Western Electric **Rule 2** (nine consecutive same-side points). The process mean has shifted — e.g., a tool recalibration, material change, or chamber drift.

**A6.** Bimodal. Causes: two testers/probe cards calibrated differently; two process tools or chambers behaving differently; mixed material from two FABs/flows.

## Chapter 6

**A1.** **WRR** (Wafer Results Record) carries GOOD_CNT; it closes each wafer’s block, just before the next WIR or the MRR.

**A2.** Die 2’s PTR for Iddq_25C reads **0.0125 mA against a high limit of 0.010 mA** — over limit. The PTR records the failing measurement; the **PRR** closes the die with SOFT_BIN = 3, recording the failure category.

**A3.** (i) Truncated/corrupt file (check MRR presence and PIR/PRR balance); (ii) parser dropped records (check loader logs). Next step: obtain the ATDF equivalent and count records directly.

**A4.** ATDF — plain pipe-delimited text, openable in any editor; STDF requires parsing tools. Same logical content.

**A5.** A loader/parsing bug (or filtered record handling) in the upload pipeline — TEST_PARAM_MAPBC failed to create rows for two TEST_NUMs. Every distinct TEST_NUM must map.

**A6.** No numeric value exists to bin into a histogram; including them would distort statistics. They should still exist as test entries and contribute to pass/fail and bin counting.

## Chapter 7

**A1.** Client (Power BI), Analytics engine (BrokerService), Application (`PATController`), Data (WAFER table).

**A2.** (i) PAT engine service down/crashed before dequeue (its log will show no receipt); (ii) no active PAT policy matches the device/program (engine ran, nothing to do); (iii) engine received but errored mid-processing (log shows exception; queue may hold or drop the JobCard). Three components: transport/service, configuration, engine logic.

**A3.** A work ticket ({JobId, Event=RecordType, wafer identifiers}) dispatched to engines. Upload-triggered runs carry `Event=Load` (all engines); manual re-runs carry `Event=PAT` (targeted).

**A4.** Resolve the key first, then aggregate: `SELECT w.Wafer_ID, w.Part_Count, SUM(bs.Part_Count) FROM WAFER w JOIN BIN_SUMMARY bs ON bs.Wafer_Sequence = w.Wafer_Sequence WHERE w.Lot_Sequence = (SELECT Lot_Sequence FROM LOT WHERE Lot_ID='L123') GROUP BY w.Wafer_ID, w.Part_Count HAVING w.Part_Count <> SUM(bs.Part_Count);` — zero rows = healthy.

**A5.** The Broker dispatches asynchronously and each engine drains its own queue — upload completion says nothing about engine completion. Reports read whatever is committed *now*.

**A6.** DataDeletionAndMaintenance (retention deletion). QA concern: it must never delete earlier than policy — and its deletions must not orphan related records.

## Chapter 8

**A1.** (i) Report filter excludes something (a wafer, a bin type, retest pass) — reproduce with filters wide open; (ii) report ran on/joined the wrong bin view or stale data — recompute from BIN_SUMMARY and compare. Filters first: they’re the usual culprit.

**A2.** Parametric **trend chart** of the parameter’s Mean (or Cpk) per lot over the range; expect UCL/LCL control-limit lines overlaid.

**A3.** CLM — active custom limits override ATE limits in reports. `WAFER.CustomLimitVersionId` being non-NULL proves CLM applied; join to CustomLimitDetail for the shown values.

**A4.** Impossible in reality — dies are never gained downstream. Indicates double-counting (e.g., retest units counted twice) or a genealogy/join error. Data bug, investigate joins and retest handling.

**A5.** A repeating defect at fixed coordinates across wafers → probe-card damage (same needle position) or photomask/reticle defect (same printed position). Single maps look like scattered noise; stacking aligns and amplifies the repetition.

**A6.** It reads the heaviest tables (dynamic, die-level). Minimal scope proves correctness; maximal scope proves performance/stability (timeouts, memory) — both are release risks.

**A7.** Reach for **Commonality Analysis**. (a) *Association Rules* mine genealogy/history to rank which discrete variable is common to the bad dies — a specific tester, probe card, reticle, handler, or time window — using support × confidence, producing a short suspect list. (b) *ANOVA* applies when the loss is parametric: it decomposes the parameter’s variance across sources (wafer, machine, layer) to show *where* the variation enters. CA narrows the haystack; engineers confirm with a focused DOE.

**A8.** (a) VP — the **Yield Trend / Yield Summary** against target (with cost per good die): direction and business impact at a glance. (b) Product engineer — **parametric histograms/trends and Cpk** plus the wafer map: confirms the device is centered, capable, and free of spatial signatures. (c) QA engineer — the **Bin Summary checked against the Golden Rule** and **Upload History**: proves the data loaded completely and correctly before any analysis is trusted.

## Chapter 9

**A1.** Most likely: **Program_Name mismatch** — checksum matching is exact, so any difference means no application. Second: no version was active (`InUse=1`) at upload time (or wrong mode configuration).

**A2.** Version 3 auto-deactivates (InUse→0), version 4 activates (InUse→1). Confirm: the “count active versions per Production master HAVING >1” query returns zero rows.

**A3.** Gap **G-23**: shared mutable state in limit comparison during load. Only concurrent uploads exercise the race; serial testing can never catch it.

**A4.** Known limitation **G-17** — documented, open. QA must still test it, document current behavior explicitly, and audit for expired-active versions until enforcement ships.

**A5.** Authorization (RBAC) testing failed — API-level permission enforcement missing (UI hiding is not enforcement). Expected: **HTTP 403 Forbidden**.

**A6.** Different customers demand different limits on the same device; CLM applies each buyer’s contractual limits at data-load time without re-engineering the ATE program — per-customer quality grading, auditable via versions.

## Chapter 10

**A1.** Spec: 0.690 < 0.700 → **pass**. PAT limits: 0.450 ± 4×0.050 = **0.250–0.650 V**. Die is (0.690−0.450)/0.050 = **4.8σ** out → **PAT fail**, re-binned to the PAT bin.

**A2.** Edge dies naturally show wider variation (process non-uniformity at wafer periphery). One global N either over-rejects healthy edge dies (yield loss) or, if loosened, under-screens center dies (escapes). Zones give each region a fitting threshold.

**A3.** (a) BIN_SUMMARY: Bin 1 count down, PAT fail bin up, totals conserved; (b) PAT_Dashboard: fail count, policy name, post-PAT yield per wafer; (c) re-run report shows the new distribution — ΔBin 1 = PAT fail count.

**A4.** E.g., wafer-wide Vt and Iddq correlate negatively (higher Vt → lower leakage). A die with high Vt *and* high Iddq is individually in-range on both but violates the joint pattern; only a combined formula screened against its own population sees it.

**A5.** Either the wafer genuinely has a sick region/population (check the wafer map and TEST_SUMMARY σ), or the policy is miscalibrated — N too tight, or wrong parameters targeted (check policy config and compare sibling wafers’ PAT rates).

**A6.** No re-binning occurs and PAT_Dashboard has no record for the wafer. Test: upload for a policy-less device; assert BIN_SUMMARY unchanged and dashboard absence.

## Chapter 11

**A1.** (a) SWM (scratch rule); (b) GDBN (count floor); (c) SBYL (percentage band); (d) SWM (adjacent-die rule).

**A2.** The contract is per-bin, not overall: e.g., Bin 2 “Grade A” promised ≥ 10,000/lot. Lot yields 82% overall but only 8,500 land in Bin 2 (rest of the passes fell to lower grades) → GDBN fires on the Bin 2 floor while overall yield looks fine.

**A3.** Different fabs mount wafers with different notch orientations; the same physical scratch appears rotated in coordinates. Correction normalizes orientation before pattern matching. Test: upload a known pattern rotated 90° from policy expectation; detection must still fire.

**A4.** An impossibly *low* fail-bin rate suggests mis-binning, a broken test, or wrong limits — the failure category may be leaking into other bins or not being detected. Too-good is a data-quality alarm.

**A5.** LG — GDBNZ compares across sites only through genealogy links. Without the link, there is no WS↔︎FT correspondence to compare; GDBNZ can’t evaluate (or evaluates garbage).

**A6.** Spatially suspect dies (edge rings, cluster neighbors, scratch tracks) remain Bin 1 and get packaged and shipped — elevated field-failure risk delivered to the customer.

## Chapter 12

**A1.** PAT protects the *customer* from anomalous finished dies, acting after test on each wafer. SPC protects *future production* from process drift, acting continuously over time.

**A2.** Rule 2 approaches — that’s 9 consecutive means above… note they’re also *steadily increasing*: six-plus successive rises trips **Rule 3 (trend)** first. Physically: progressive drift — e.g., a tool parameter creeping, chamber aging.

**A3.** SPC statistics flow through the R bridge (RDotNet); TEST_SUMMARY comes from the SQL loader path. Two independent implementations of the same math must agree within floating-point tolerance — divergence means one path is wrong.

**A4.** Legacy WCF service and the newer Web API path. Both are live; QA must verify functional equivalence of results across both until the legacy path is retired.

**A5.** “SPC monitors whether the *process* is behaving like its normal self, using limits computed from its own history — much tighter than spec. The alarm means ‘something changed; investigate now,’ precisely so parts never get near spec limits.”

**A6.** **EWMA** — it accumulates weighted evidence across consecutive points, so a small persistent shift compounds into a signal long before any single point nears 3σ.

## Chapter 13

**A1.** AMG generated its map from pre-SWM bins (14,700 good); SWM then re-binned 50 spatially suspect dies out of Bin 1 (now 14,650). The map still instructs assembly to pick those 50 suspect dies — the exact outcome SWM exists to prevent. Fix: enforce PAT/SWM-before-AMG ordering, regenerate the map, and verify AMG’s included count equals current Bin 1 exactly.

**A2.** It silently severs traceability: cross-stage yield-loss analysis (can’t compare WS→FT), GDBNZ (no linkage to compare counts), and — worst — RMA/recall scoping (a field failure can’t be traced to origin wafers).

**A3.** (i) `V_BI_*` view definitions (joins/filters may differ from app logic); (ii) no application layer — app-side fixes/filters don’t apply to Power BI; (iii) timing — the view reads current tables, the dashboard tile may cache or vice versa. Compare view output to direct table queries first.

**A4.** Delivery trinity: generated at the configured time, delivered to configured recipients, in the configured format — plus that the schedule policy row (`AutomateReportPolicy`) actually drives it.

**A5.** Empty map or clean, logged error — never a crash or a malformed file an assembly machine might misread. Degenerate inputs at a machine interface are exactly where crashes become production incidents.

**A6.** PAT (removes statistical mavericks from Bin 1) and SWM (removes spatially suspect dies). AMG’s map is only as good as the final bins it reads.

## Chapter 14

**A1.** “After uploading a file whose MIR Program_Name matches an active CLM version, every created WAFER row has `CustomLimitVersionId` = that version’s ID, and parametric report limits equal CustomLimitDetail values (not TEST_PARAM_MAP originals). For non-matching programs, `CustomLimitVersionId` IS NULL.”

**A2.** (d) source file WRR values → (b) BIN_SUMMARY/WAFER integrity → (c) report filters → (a) rendering. Forward from the file.

**A3.** Examples: Golden Rule (Ch 4); no >1 active Production CLM version + no expired-active versions (Ch 9); orphan FT lot hunt (Ch 13). (Also acceptable: AMG count = Bin 1 (Ch 13); yield recomputation (Ch 4).)

**A4.** Closes **G-17**. Regression risk: production flows that currently *rely* on expired versions continuing to apply would suddenly load without CLM limits — the PRD must define transition behavior (grace period, alerts, migration audit).

**A5.** CLM master (Production mode, customer limits) → PAT policy (±Nσ on key parameters — automotive) → SWM policy with **scratch rule** (+ cluster/adjacency) → GDBN floor on Bin 1 (contractual count) → SBYL bands per fail bin → SPC templates on key parameters → LG policy for FT linkage → AMG policy (correct format, Bin 1 + agreed grade bins).

## Chapter 15

**A1.** The run completes as **OK (Skipped)** with the reason saved (request/audit rows record the skip). It matters because “nothing happened” becomes queryable and testable — QA can assert that every skip has a recorded reason, and “why didn’t the module fire?” investigations end in data, not guesswork.

**A2.** **IDataProvider** — where unit data comes from and how results save (Database, ATDF file, CSV test fixture). **IRule/IPolicyProvider** — which policy and ordered rules apply, per policy type. **IRuleEvaluator** — how one rule type turns data into detected clusters (size, pattern, matrix, ML).

**A3.** Nothing is overwritten: a **new versioned row** is created (`RuleKey` kept, `Version` incremented, `IsLatest` moved). Old results still point at the exact rule version that ran, so historical executions remain fully explainable — the write-once audit trail plus versioned rules reconstruct the past.

**A4.** The GDBN providers must **match legacy GDBN output die-for-die**. Safe testing leans on `POST /rule-engine/executions/preview` (full simulation, saves nothing) and `POST /rule-engine/executions/match-policies` (dry-run of eligibility with per-criterion verdicts).

**A5.** The ML rule **skips** (with recorded reason) and the run still completes — failures isolate to their step. **IMlScorer** hides the deployment: in-process (ML.NET/ONNX) and remote (Python service over HTTP/gRPC) implement the same interface, so switching is configuration, not an engine change.

**A6.** The same conceptual flow survives — work arrives, is queued, processed asynchronously, and surfaces on dashboards (Chapter 7’s JobCard/queue thinking). What disappears is the duplication: per-module engine services, per-module queues and dashboard tables, and module-specific plumbing all collapse into one audited pipeline with pluggable providers.

## Chapter 16

**A1.** Facility → Work Center → Device Name → Test Program → Lot → Wafer → Parameter.

**A2.** Check **Work Center** first — it identifies the test stage. Isolate Wafer Sort with the **S** code (Facility_Type ‘W’) and Final Test with the **F** code (Facility_Type ‘F’); a stuck or wrong Work Center filter is the usual reason stages appear mixed.

**A3.** WCR rotates, flips, or changes the X/Y axes and wafer/die dimensions *during upload* so maps from different sources align. The conceptually similar step is **SWM’s wafer-rotation correction** (Chapter 11), done later at analysis time. A wrong WCR setting mislocates every die on the wafer map — geography corruption — so maps must be re-validated against a known-good reference wafer after any WCR change.

**A4.** A **Failed Die** was tested successfully but did not meet limits (a legitimate result). An **Error Data** record could not be tested or loaded cleanly (a data-quality problem). It matters because errors masquerading as passes/fails silently distort yield and hide load bugs — a non-empty Error Data tab is a signal to investigate before trusting the report.

**A5.** **Die ID Mapping** supplies X/Y coordinates for Final Test data (units have no wafer coordinates natively). Edge cases: the XY-supplying parameters are missing; malformed/out-of-range values; duplicated coordinates across units; and FT data with no mapping configured at all.

**A6.** **Favorites** — save/load/clear a selection-and-report configuration for one-click reuse. **Cart** — collect specific die coordinates from a wafer map for side-by-side image comparison. **Setup Auto Run / Report Policy** — bundle reports to generate automatically on a schedule (Excel/HTML/PDF to Local/Network/FTP), with enable/disable and run-status logs.
