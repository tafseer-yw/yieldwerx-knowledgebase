---
id: handbook-third-sec-ch11
title: "Chapter 11 — SWM, GDBN & SBYL: The Spatial and Yield Watchdogs"
source_id: handbook-third-html
source_section: sec-ch11
edition: 3
status: current
confidentiality: internal
generated: true
---
Part IV · The Analytics Modules

# Chapter 11 — SWM, GDBN & SBYL: The Spatial and Yield Watchdogs

## 11.1 SWM — reading the wafer’s surface

**SWM (Smart Wafer Mapping)** detects **spatial** failure patterns — failures explained by *position*, invisible to parametric statistics. PAT works in measurement-space; SWM works in physical space. The classic patterns (cookie-tray logic from Chapter 1):

- **Edge ring** — failures around the periphery (process non-uniformity at the edge).
- **Cluster** — a blob of adjacent fails (localized contamination).
- **Scratch** — a line of fails (handling damage; the track literally looks like a scratch).
- **Adjacent-die** — a *passing* die surrounded by fails; guilt by neighborhood (the defect region likely extends into it sub-detectably).
- **Missing die** — untested positions (probe skips) needing an explicit pass/fail policy.
- **Delta parameter** — neighboring dies differing more than X% on a parameter — physically implausible for adjacent silicon.

SWM policies define which bins count as “fail,” apply **wafer-rotation correction** (different fabs orient notches differently — patterns must be compared in a common frame), evaluate rules, and **re-bin flagged dies (soft bin)**, writing `SWMWaferStatus`/`SWMDashboard`. Like PAT, SWM must run **before AMG**, or spatially-suspect dies get packaged.

The three signature spatial failure patterns

The three signature spatial failure patterns

**How to read this figure:** each circle is a wafer map — the die grid you saw in Chapter 0 — with failing dies in red. An edge ring hugs the circumference (process non-uniformity), a cluster is a contiguous blob (localized contamination), and a scratch is a straight track of fails (physical handling damage). None of these are visible in parametric statistics; only position reveals them — which is exactly SWM’s job.

QA scenario seeds: plant an edge ring (expect edge dies re-binned); a diagonal fail line (expect scratch detection, possibly flagging adjacent passing dies); upload a 90°-rotated wafer (rotation correction must still find the pattern).

## 11.2 GDBN — enforcing the good-die contract

**GDBN (Good Die per Bin Number)** enforces **contractual die-count guarantees per bin**. Business scenario: a customer pays for 10,000 Grade-A (Bin 2) dies per lot. Overall yield can look great while Bin 2 alone falls short — a contract breach that overall-yield monitoring would never notice. GDBN rules define **Min_Good_Die / Max_Good_Die per monitored bin** with actions (alert/hold/pass); results land in `GDBN_Dashboard`.

Note the *Max* too: overproduction of a grade can also be economically meaningful (or indicate misclassification). **GDBNZ** is the cross-site variant — comparing counts across work centers (WS at Fab A vs FT at ATS B), which only works when Lot Genealogy links exist (dependencies again!).

Crucially, GDBN evaluates counts **after** PAT/SWM re-binning — it judges the final sellable truth, not the raw test result.

## 11.3 SBYL — percentage patrol per bin

**SBYL (Sort Bin Yield Limit)** monitors each bin’s **percentage** against configured min/max bands, alerting and optionally **holding** material on violation (`SBYL_Rules_HoldData`). Distinction to memorize: **GDBN watches counts; SBYL watches percentages.** They complement each other.

Example: Bin 3 (a speed-fail category) normally runs 2–8% of dies. A wafer at 15% Bin 3 passes no-contract checks and may even have acceptable Bin 1 yield — but that spike *means something changed* in the process. SBYL is the tripwire. Also note the *minimum* band: Bin 3 at 0.5% (below min 2%) is *also* an anomaly — too-good results can indicate mis-binning or test-program issues. Suspiciously good is still suspicious.

## 11.4 Field Notes 🧭

- Three watchdogs, three questions: **SWM — “do failures form shapes?” GDBN — “did we deliver the promised counts?” SBYL — “are bin percentages inside their normal bands?”**
- A “hold” is a real factory action — material physically stops moving pending review. False-positive holds cost money and trust; missed holds ship bad material. Alerting logic deserves aggressive testing in both directions.
- SWM’s adjacency logic is why the naming confusion with “Good Die Bad Neighbourhood” exists (Appendix D). Functionally, the adjacency rule inside SWM does the “bad neighborhood” work in this platform’s documentation.
- Internal code historically calls SWM “CWM” — expect it in logs/endpoints, and expect naming-consistency test tasks.
- Null-data grace: an SBYL rule pointed at a bin with zero dies must not crash or false-fire — a standard robustness case.

## 11.5 Jargon Decoded

- **Spatial pattern:** failure arrangement explained by wafer position.
- **Edge ring / cluster / scratch:** the three signature spatial defect shapes.
- **Adjacency rule:** flagging passing dies surrounded by failures.
- **Wafer rotation correction:** normalizing orientation before pattern matching.
- **Hold:** freezing material pending engineering disposition.
- **Grade bin:** a passing bin representing a sellable performance class.
- **Work center:** a manufacturing/test site in yieldWerx terms.

## 11.6 Acronyms

- **SWM** — Smart Wafer Mapping (internally “CWM”; see Appendix D)
- **GDBN** — Good Die per Bin Number
- **GDBNZ** — cross-work-center GDBN
- **SBYL** — Sort Bin Yield Limit

## Global Trends & the Bigger Picture 📈

Spatial and yield-guarantee analysis is being transformed by **image-based and ML pattern recognition** — treating the wafer map as an image and classifying defect signatures (edge rings, clusters, scratches) automatically, at scale. This matters more in the chiplet era, where a spatial defect that slips through can be built into an expensive multi-die package. *For management:* these watchdogs are what convert raw yield into *contractual* guarantees (GDBN) and early process alarms (SBYL), directly protecting customer commitments and revenue. *For engineers:* the three questions — do failures form shapes (SWM), did we deliver the promised counts (GDBN), are bin percentages in band (SBYL) — stay the same; the detection behind them gets smarter.

## Bug-Hunting & Hardening Tips 🐞

Spatial logic breaks on geometry. Test **wafer-rotation correction** by feeding a known pattern rotated 90° and confirming detection still fires. Verify the **coordinate origin and edge indexing** — the same off-by-one at the wafer edge from Chapter 0 resurfaces here. Probe **hold logic in both directions**: false-positive holds cost money and trust, missed holds ship bad material. Watch the **count-vs-percentage distinction** (GDBN counts, SBYL percentages) — swapping them silently breaks alarms. Remember that **too-good is also an alarm**: a fail bin far below its minimum band can mean mis-binning or a broken test, so test the below-minimum path, not just the above-maximum one.

## Did You Know? 💡

- **SWM is called “CWM” inside the code.** A historical naming drift means the module branded SWM externally still answers to “CWM” in parts of the codebase and logs — a standing trap for anyone grepping for it (and a documented QA note).
- **Defect shapes have folklore names.** Edge rings, clusters, scratches, “bullseyes,” and “comets” — spatial signatures carry nicknames because each points to a different physical culprit (edge-process, particle, handling, spin-coating). A wafer map reads like a crime scene to a trained eye.

## 11.7 Never Forget ⭐

1. **PAT = measurement-space; SWM = physical-space.** A die can be flagged by both.
2. SWM re-bins via **soft bin** and must run **before AMG**.
3. **GDBN = counts (min *and* max); SBYL = percentages (min *and* max).**
4. GDBN/SBYL judge **post-PAT/SWM** bins — the final truth.
5. GDBNZ needs LG links — cross-module dependency chains are the norm here.
6. Both *too-bad* and *too-good* trigger alarms. Anomaly ≠ only bad news.

## 11.8 Summary

SWM detects positional failure patterns (edge rings, clusters, scratches, suspicious neighbors, missing dies, neighbor deltas), corrects for wafer orientation, and re-bins spatially suspect dies before assembly mapping. GDBN enforces per-bin good-die count commitments (min/max) with a cross-site variant (GDBNZ) built on genealogy links; SBYL polices per-bin percentage bands and can hold material. All three act on post-PAT/SWM bins, and each answers a distinct question: shapes, counts, percentages.

## 11.9 Quiz — Chapter 11

**Q1.** For each observation, name the module that should catch it: (a) fails forming a diagonal line; (b) Bin 2 count 8,500 vs 10,000 promised; (c) Bin 3 at 15% vs 2–8% band; (d) a passing die with five failing neighbors.

**Answer.** (a) SWM (scratch rule); (b) GDBN (count floor); (c) SBYL (percentage band); (d) SWM (adjacent-die rule).

**Q2.** Overall Bin 1 yield is 82% — healthy — yet a GDBN alert fires. Construct a concrete scenario making both true.

**Answer.** The contract is per-bin, not overall: e.g., Bin 2 “Grade A” promised ≥ 10,000/lot. Lot yields 82% overall but only 8,500 land in Bin 2 (rest of the passes fell to lower grades) → GDBN fires on the Bin 2 floor while overall yield looks fine.

**Q3.** Why does SWM need wafer rotation correction? What test proves it works?

**Answer.** Different fabs mount wafers with different notch orientations; the same physical scratch appears rotated in coordinates. Correction normalizes orientation before pattern matching. Test: upload a known pattern rotated 90° from policy expectation; detection must still fire.

**Q4.** SBYL fires on Bin 3 = 0.5% against a 2–8% band. Why is *below minimum* alert-worthy?

**Answer.** An impossibly *low* fail-bin rate suggests mis-binning, a broken test, or wrong limits — the failure category may be leaking into other bins or not being detected. Too-good is a data-quality alarm.

**Q5.** GDBNZ compares WS and FT counts. Which module must have succeeded first, and what happens if it didn’t?

**Answer.** LG — GDBNZ compares across sites only through genealogy links. Without the link, there is no WS↔︎FT correspondence to compare; GDBNZ can’t evaluate (or evaluates garbage).

**Q6.** If SWM never ran but AMG did, what is the business consequence, in one sentence?

**Answer.** Spatially suspect dies (edge rings, cluster neighbors, scratch tracks) remain Bin 1 and get packaged and shipped — elevated field-failure risk delivered to the customer.
