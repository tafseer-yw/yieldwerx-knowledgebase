---
id: handbook-third-sec-ch10
title: "Chapter 10 — PAT & MVPAT: Hunting the Maverick Dies"
source_id: handbook-third-html
source_section: sec-ch10
edition: 3
status: current
confidentiality: internal
generated: true
---
Part IV · The Analytics Modules

# Chapter 10 — PAT & MVPAT: Hunting the Maverick Dies

## 10.1 The philosophy (Chapter 5 pays off here)

**PAT (Part Average Testing)** screens out dies that *passed all spec limits* but are statistical outliers versus their own wafer’s population. The canonical example: spec says Vt < 0.700 V; a die measures 0.690 V — pass. But the wafer population is Mean 0.450 V, σ 0.050 V, making this die **4.8σ** out — a near-statistical-impossibility for a healthy die. Experience shows such mavericks fail disproportionately in the field. Automotive standards (**AEC-Q100/Q101**) effectively mandate PAT; that’s much of its market.

PAT computes **dynamic limits per wafer**: `Mean ± N×σ` (N configurable — 3, 4.5, 6…), sourcing Mean/σ from `TEST_SUMMARY`. Dies outside dynamic limits are **re-binned (soft bin) into a configured PAT fail bin**, decrementing Bin 1.

## 10.2 Rule types

- **Mean ± Nσ** — the classic screen above.
- **Radial Zone** — different N for wafer center vs edge (edges naturally vary more; one-size N would over-kill edge dies or under-screen center dies). Zones defined by radial distance tables. Boundary dies are a favorite edge-case test.
- **Spatial** — factors neighboring dies’ behavior into outlier judgment.
- **GDBNPAT** — hybrid coupling PAT with GDBN’s bin-count enforcement (Chapter 12).

Policies bind rules to devices/programs (`PAT_Policies` → `PAT_PolicyWithRules` → `PAT_RulesDetails`), can auto-assign to new devices (`PAT_AutomateBusinessRules`), and write results to `PAT_Dashboard`.

## 10.3 The flow

Upload completes → Broker dispatches JobCard → PAT service queues it → for each rule: load TEST_SUMMARY stats → compute dynamic limits → scan die-level values in dynamic tables → flag outliers → **update BIN_SUMMARY (Bin 1 down, PAT bin up)** → write PAT_Dashboard summary. Manual re-runs post a JobCard with `Event=PAT`.

Validation staples: a planted 5σ die must land in the PAT bin; devices with no policy must pass through untouched; N=6 vs N=3 must catch different counts; FT data (Facility_Type ‘F’) also flows through PAT; ten simultaneous wafers must not cross-contaminate.

## 10.4 MVPAT: outliers hiding in combinations

A die can be individually unremarkable on every parameter yet **jointly** bizarre. Example: Vt = 0.48 V (fine), Iddq = 0.009 mA (fine) — but across the wafer those two correlate, and this die’s *combination* breaks the correlation. **MVPAT (Multi-Variate PAT)** screens computed **formulas across parameters** (e.g., Vt × Iddq) against the population of that formula’s values.

Real-life analogy: a person of height 150 cm is normal; weight 95 kg is normal; the *combination* is unusual. Single-variable screens can’t see it; the combined index can.

MVPAT policies define the formula’s parameters, limits on the computed value, and store per-die computed results (`MVPATRuleWithCalculatedDieValue`) plus per-wafer status (`MVPATWaferStatus`). QA specials: division-by-zero in formulas must fail gracefully; PAT and MVPAT active together must run independently.

## 10.5 Field Notes 🧭

- PAT deliberately sacrifices some perfectly good dies (statistical false positives) to prevent field failures. For automotive, one field failure can trigger recall economics that dwarf thousands of discarded dies — the asymmetry that justifies the whole module.
- The N-sigma choice is a *contract-level* decision for some customers — meaning PAT configuration errors are business incidents, not just data bugs.
- **Order matters:** PAT re-bins before AMG picks dies for assembly (Chapter 13). If sequencing breaks and AMG reads pre-PAT bins, maverick dies get packaged and shipped — the exact disaster PAT exists to prevent. This cross-module ordering is among the most consequential things you can test.
- **DPAT** (Direct-PAT) exists as a real-time ATE-feedback variant with its own tables (`DPAT_LOT`, `DPAT_Dies_Details`) — be aware it’s a separate thing.
- A PAT fail rate above ~5% of a wafer is itself suspicious — either the process is sick or the policy is miscalibrated. There’s a stock query for exactly this.

## 10.6 Jargon Decoded

- **Dynamic limits:** limits computed from each wafer’s own Mean ± Nσ rather than fixed.
- **Maverick die:** passes spec but is statistically anomalous; elevated field-failure risk.
- **Re-binning:** PAT moving an outlier from Bin 1 to a PAT fail bin (soft bin only).
- **Radial zone:** ring-shaped wafer region with its own screening threshold.
- **Multivariate:** involving several variables jointly.
- **Correlation:** parameters that move together across a population.

## 10.7 Acronyms

- **PAT** — Part Average Testing
- **MVPAT** — Multi-Variate PAT
- **DPAT** — Direct (real-time) PAT
- **AEC-Q100/Q101** — automotive qualification standards (ICs / discretes)

## Global Trends & the Bigger Picture 📈

Outlier screening is a frontier for machine learning. **ML-based and adaptive PAT** extend the classic Mean±Nσ idea with models that learn normal behavior across many parameters and lots, and **part-average testing across time and fleets** is spreading beyond automotive into any high-reliability market. The driver remains the **automotive zero-defect mandate** (AEC-Q100/Q101): as chips move into safety-critical systems, screening out statistically anomalous “maverick” dies is non-negotiable. *For management:* PAT is a direct enabler of automotive and high-rel business, which command premium margins. *For engineers:* the maverick-die philosophy — in-spec but abnormal is still suspect — is becoming the default mindset across the industry.

## Bug-Hunting & Hardening Tips 🐞

The highest-consequence test here is **ordering: PAT (and SWM) must run before AMG** — if AMG reads pre-PAT bins, maverick dies get packaged and shipped, defeating the entire module. Assert this explicitly. **Recompute the dynamic limits** yourself from TEST_SUMMARY (Mean ± Nσ) and compare to what PAT applied. Test **boundary dies in radial zones** (a die exactly on a zone edge must use the correct N). Guard **N=0 and degenerate policies**, and in MVPAT trap **divide-by-zero in the formula** so a bad wafer fails gracefully. Verify **re-run idempotency**: running PAT twice must not double-count re-bins. Watch for wafers where PAT fails >5% of dies — usually a sick process or a miscalibrated policy, and there’s a stock query for it.

## Did You Know? 💡

- **A “maverick” die is named after a Texan who wouldn’t brand his cattle.** Samuel A. Maverick (1803–1870) left his cattle unbranded, so any unbranded, un-belonging animal became a “maverick.” A maverick die is exactly that — one that passes the spec but refuses to run with the herd of its wafer. PAT’s whole job is rounding up the mavericks.
- **Automotive now counts defects in parts per *billion*.** Consumer chips tolerate defects in parts-per-million; automotive “zero-defect” programs (AEC-Q100) push toward parts-per-*billion*, because a chip failing in a braking system is a recall, not a return. That asymmetry is the entire economic case for PAT.

## 10.8 Never Forget ⭐

1. **PAT = Mean ± Nσ dynamic limits from the wafer’s own population; outliers re-binned via soft bin.**
2. A die can **pass spec and still fail PAT** — that’s the entire point.
3. Mean and σ come from **TEST_SUMMARY** — so you can always recompute PAT limits and verify.
4. **PAT must run before AMG.** Broken ordering ships mavericks.
5. MVPAT catches **combination outliers** single-parameter PAT cannot.

## 10.9 Summary

PAT screens statistically anomalous dies using per-wafer dynamic limits (Mean ± Nσ from TEST_SUMMARY), re-binning outliers through soft bins — a requirement for automotive-grade products where field failures are catastrophically expensive. Rule variants handle wafer geometry (radial zones) and neighborhoods (spatial). MVPAT extends screening to formulas across correlated parameters, catching dies whose individual values pass but whose combinations are aberrant. Both write dashboards, both must precede assembly-map generation, and both are verifiable by recomputation.

## 10.10 Quiz — Chapter 10

**Q1.** Wafer stats: Mean = 0.450 V, σ = 0.050 V, spec limit < 0.700 V, PAT at ±4σ. A die reads 0.690 V. Spec verdict? PAT limits? PAT verdict? Show numbers.

**Answer.** Spec: 0.690 < 0.700 → **pass**. PAT limits: 0.450 ± 4×0.050 = **0.250–0.650 V**. Die is (0.690−0.450)/0.050 = **4.8σ** out → **PAT fail**, re-binned to the PAT bin.

**Q2.** Why do edge dies get their own N-sigma (radial zones)? What goes wrong with a single global N?

**Answer.** Edge dies naturally show wider variation (process non-uniformity at wafer periphery). One global N either over-rejects healthy edge dies (yield loss) or, if loosened, under-screens center dies (escapes). Zones give each region a fitting threshold.

**Q3.** Post-PAT, where do you see its effects in (a) BIN_SUMMARY, (b) PAT_Dashboard, (c) a re-run Bin Summary report?

**Answer.** (a) BIN_SUMMARY: Bin 1 count down, PAT fail bin up, totals conserved; (b) PAT_Dashboard: fail count, policy name, post-PAT yield per wafer; (c) re-run report shows the new distribution — ΔBin 1 = PAT fail count.

**Q4.** Construct a two-parameter example (values in-range individually) that only MVPAT would flag, and say why.

**Answer.** E.g., wafer-wide Vt and Iddq correlate negatively (higher Vt → lower leakage). A die with high Vt *and* high Iddq is individually in-range on both but violates the joint pattern; only a combined formula screened against its own population sees it.

**Q5.** PAT_Dashboard shows 9% of a wafer PAT-failed. Two competing interpretations — and your next check for each?

**Answer.** Either the wafer genuinely has a sick region/population (check the wafer map and TEST_SUMMARY σ), or the policy is miscalibrated — N too tight, or wrong parameters targeted (check policy config and compare sibling wafers’ PAT rates).

**Q6.** A device has no PAT policy. What must happen on upload, and what test asserts it?

**Answer.** No re-binning occurs and PAT_Dashboard has no record for the wafer. Test: upload for a policy-less device; assert BIN_SUMMARY unchanged and dashboard absence.
