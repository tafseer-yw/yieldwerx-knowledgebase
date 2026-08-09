---
id: handbook-third-sec-ch4
title: "Chapter 4 — Binning: How Every Chip Gets a Grade"
source_id: handbook-third-html
source_section: sec-ch4
edition: 3
status: current
confidentiality: internal
generated: true
---
Part II · The Language of Test

# Chapter 4 — Binning: How Every Chip Gets a Grade

## 4.1 The report card system

**Why binning exists.** Testing is not only a pass/fail gate. Manufacturers classify every chip after test so they can answer three business questions at once: *which* devices are good enough to sell (and at what grade), *why* the rest failed (so engineering can fix the process), and *how* to route material for manufacturing and quality decisions. A bin is simply that classification — a chip’s final grade — so before memorizing bin numbers, hold on to the purpose: binning turns raw test results into sortable, actionable categories.

When the ATE finishes testing a die or unit, it assigns a **bin** — a numeric category that is the chip’s final grade. Think of bins as sorting baskets at the end of an exam:

- **Bin 1** — passed everything (by convention, “the good bin”).
- **Bin 2, 3, 4…** — either *premium pass grades* (e.g., extra-fast parts) or *specific failure categories* (e.g., Bin 3 = failed leakage-current test, Bin 5 = failed functional logic test).

Bin meanings are defined per product in the test program. Failure bins are diagnostic gold: a wafer where Bin 3 suddenly doubles tells you *which kind* of failure spiked, not just that yield dropped.

## 4.2 Hard bins vs soft bins — a distinction you will test constantly

Every die actually gets **two** bin assignments:

- **Hard Bin** — assigned by the ATE *hardware*; coarse categories tied to physical tester behavior. Stored in `BIN_SUMMARY.Hard_Bin_No`. **Not modifiable** after test.
- **Soft Bin** — assigned by the test program *software*; finer-grained categories. Stored in `BIN_SUMMARY.Soft_Bin_No`. **Modifiable** — and this matters enormously.

Why it matters: yieldWerx analytics modules (PAT, SWM — Chapters 10–11) *re-bin* dies after the fact — e.g., “this die technically passed, but it’s statistically suspicious, so move it from Bin 1 to Bin 130.” **They modify the Soft Bin only.** The Hard Bin remains the permanent record of what the tester itself decided.

**Three everyday analogies to make it stick.**

*The exam analogy.* The **Hard Bin** is the raw score the scanner (the machine) prints the instant you finish the test — permanent, printed in ink, never changed. The **Soft Bin** is the *final grade on your report card* after the teacher applies curves, bonus points, and review-committee decisions. The scanner score still exists underneath, untouched; the grade on top is what actually decides whether you pass and into which honor band. In yieldWerx, PAT and SWM are that review committee — they adjust the grade (soft bin), never the original scanner score (hard bin).

*The airport-security analogy.* The **Hard Bin** is the metal detector’s raw beep — an immediate, hardware verdict: pass or beep. The **Soft Bin** is where the security officer *reassigns* you after a closer look: “the detector let you through, but your behavior is odd — step aside.” The machine’s original reading is logged and unchangeable; the officer’s reclassification is the one that determines what happens to you next. PAT is exactly that extra-scrutiny officer pulling a statistically suspicious die aside even though the machine passed it.

*The fruit-sorting analogy.* A machine weighs each apple and drops it into a basket by weight — that’s the **Hard Bin** (fast, mechanical, fixed). Then a quality inspector walks the line and moves a few apples that *weigh* fine but have a bruise or odd color into a different basket — that’s **Soft Bin** re-binning. Same apple, machine’s weight-reading unchanged, but its final destination basket was refined by a smarter, later judgment.

**Why two bins exist at all.** The hardware tester is fast but blunt: it knows only “did this measurement pass or fail *its* electrical categories.” That raw, tamper-proof verdict is worth preserving forever as the **Hard Bin** — it is the ground truth of what the machine saw, and auditors and failure-analysis engineers need it to never change. But manufacturers also want to apply *smarter, evolving* rules on top — statistical outlier screening (PAT), spatial patterns (SWM), custom customer limits (CLM) — without destroying that ground truth. So those rules write to a *separate, editable* copy, the **Soft Bin**. You get both: an immutable record *and* a refined final decision.

**A concrete walk-through.** Die at position (11, 20) measures a leakage current of 0.008 mA against a limit of 0.010 mA — it passes. The tester stamps **Hard Bin 1 (good)** and **Soft Bin 1 (good)**; at this instant they agree. Overnight, PAT analyzes the whole wafer and finds the population averages 0.004 mA with tiny spread — this die, at 0.008 mA, is a 4-sigma statistical outlier (a “maverick,” Chapter 10). PAT cannot and does not touch the Hard Bin — it stays **1** forever, faithfully recording “the machine passed it.” Instead PAT rewrites the **Soft Bin to 130 (PAT fail)**. Now the same physical die reads *Hard Bin 1, Soft Bin 130*. A yield report grouped on soft bins correctly counts it as a fail and keeps it out of the shipment; a report grouped on hard bins still shows it as a machine-pass. **Neither is wrong — they answer different questions**, which is exactly why you must always know which bin a report is using.

**The one-line rule to memorize:** *Hard Bin = what the machine decided (permanent, hardware). Soft Bin = the final decision after software/analytics may have refined it (editable). PAT and SWM change only the Soft Bin.*

## 4.3 Parametric vs functional tests

Two fundamentally different kinds of test produce the data:

- **Parametric tests** measure a *number* — a voltage, current, frequency (e.g., “threshold voltage = 0.452 V, limits 0.350–0.550 V”). These feed histograms, trend charts, Cpk, PAT, SPC — all the statistics.
- **Functional tests** produce only *pass/fail* — the chip’s logic either produced correct outputs for a pattern of inputs or it didn’t. No number, no distribution, no statistics.

QA trap to remember: functional results must **never** appear in parametric (statistical) reports — there’s no number to plot. This is a recurring validation point.

## 4.4 Where the numbers live in yieldWerx

After a wafer’s file loads, this is the core data layout (full architecture in Chapter 7):

- `LOT` — one row per lot: `Lot_ID`, `Program_Name`, `Facility_ID`, `Facility_Type`, `Part_Type`.
- `WAFER` — one row per wafer: `Wafer_ID`, `Part_Count` (dies tested), `Good_Count` (passing dies), `Yield`.
- `BIN_SUMMARY` — one row per bin per wafer: `Soft_Bin_No`, `Hard_Bin_No`, `Part_Count` (dies in that bin).
- `TEST_PARAM_MAP` — one row per test parameter: `Test_Number`, `Test_Name`, `Low_Limit`, `High_Limit`, `Units`.
- `TEST_SUMMARY` — per-parameter statistics per wafer: `Min`, `Max`, `Mean`, `StdDev`.
- **Dynamic tables** — per-device tables holding every individual die’s X/Y position and measured values (the biggest data).

**The Golden Rule** (your manager’s document calls it exactly that): for any wafer, **the sum of** `BIN_SUMMARY.Part_Count` **across all bins must equal** `WAFER.Part_Count`**.** Every die is in exactly one bin. Any mismatch = a loader bug. This is the first integrity check you run on any suspicious data.

## 4.5 Worked example

A wafer tests 20,000 dies: 16,800 land in Bin 1, 1,900 in Bin 3 (leakage fail), 800 in Bin 5 (functional fail), 500 in Bin 7 (opens/shorts).

- Golden Rule check: 16,800 + 1,900 + 800 + 500 = 20,000 ✓ matches `Part_Count`.
- Yield = 16,800 ÷ 20,000 × 100 = **84%**.
- Pareto thinking: Bin 3 is the biggest loss (9.5% of all dies) → investigate leakage first. This “attack the biggest bin first” habit is how yield engineers actually work.

## 4.6 Field Notes 🧭

- When PAT/SWM re-bin a die out of Bin 1, reports show yield *dropping* after analytics run. That’s not a bug — that’s the product working. “Bin 1 decreased after PAT” is expected behavior; you’ll write test cases asserting it.
- Speed-grade binning is a real revenue lever: identical dies from one wafer can be sold as different products at different prices purely based on measured speed. Binning is where manufacturing meets marketing.
- Bin colors in yieldWerx reports come from `USER_BIN_DEFINITION` — even display colors are data, and therefore testable.
- A single die’s journey: tested once, but its *bin* can be touched by the test program, then PAT, then SWM. Order of operations matters (Chapter 13’s AMG depends on it).

## 4.7 Jargon Decoded

- **Bin:** category code assigned to each tested die/unit; Bin 1 = good by convention.
- **Hard Bin:** tester-hardware-assigned bin; immutable.
- **Soft Bin:** software-assigned bin; refinable by yieldWerx analytics.
- **Re-binning:** moving a die to a different (soft) bin after analysis.
- **Parametric test:** test producing a numeric measurement with low/high limits.
- **Functional test:** pass/fail-only test of logic behavior.
- **Pareto:** ranking failure categories biggest-first to prioritize investigation.
- **Specification limits:** the allowed min/max for a parametric measurement.

## 4.8 Acronyms

- **WS/FT** — Wafer Sort / Final Test (the two binning stages)
- **ATE** — Automated Test Equipment

## Global Trends & the Bigger Picture 📈

Binning is getting smarter. Beyond fixed pass/fail categories, modern platforms apply **adaptive and ML-assisted binning** — grading dies not just against static limits but against the behavior of their peers across the wafer, the lot, and even the whole production fleet. This is the same statistical philosophy you will meet in PAT (Chapter 10), pushed into the grading step itself. *For management:* finer binning directly enables product differentiation and premium pricing (speed grades), so it is a revenue lever, not just a QA artifact. *For engineers:* expect bin definitions to become richer and more data-driven, which makes disciplined bin bookkeeping (the Golden Rule) more important, not less.

## Bug-Hunting & Hardening Tips 🐞

Automate the **Golden Rule** as a continuous health check: for every wafer, Σ BIN_SUMMARY.Part_Count must equal WAFER.Part_Count — any drift is a loader bug. Hunt the **hard-vs-soft-bin confusion** that plagues reports: always confirm which bin a report is grouping on, because PAT/SWM only move soft bins. Watch **bin-code parsing** — bins can appear as decimal or hex (the sample file’s `0x08`), and a bad parse silently miscategorizes dies. Check **signed/unsigned and bin-number-collision** cases, and verify that **functional (FTR) results never leak into parametric reports**. Golden habit: run a bin summary *before and after* PAT and confirm the Bin 1 drop equals the PAT fail count exactly.

## Did You Know? 💡

- **Bins were once literal bins.** Early testers physically dropped parts into different *bins* (baskets) by result — the word stuck long after the sorting went digital.
- **Speed binning is why one chip has many price tags.** Identical dies from the same wafer are often sold as different products purely by measured speed or power — the fast ones command a premium. Binning is where manufacturing quietly becomes marketing.

## 4.9 Never Forget ⭐

1. **Soft Bin is modifiable (PAT/SWM re-bin it); Hard Bin never changes.** Always know which bin a report is showing.
2. **Golden Rule: Σ BIN_SUMMARY.Part_Count = WAFER.Part_Count.** First check for any data-integrity doubt.
3. Parametric = numbers (statistics apply); functional = pass/fail only (must be excluded from parametric analytics).
4. Yield falling after PAT/SWM run is **correct** behavior.
5. Core tables: LOT → WAFER → BIN_SUMMARY / TEST_PARAM_MAP / TEST_SUMMARY / dynamic tables.

## 4.10 Summary

Every tested die receives a hard bin (hardware, permanent) and a soft bin (software, refinable). Bin 1 conventionally means good; other bins encode pass grades or failure categories, making bin distributions diagnostic. Parametric tests yield numbers that power all statistics; functional tests yield only pass/fail. In the database, LOT/WAFER/BIN_SUMMARY/TEST_PARAM_MAP/TEST_SUMMARY hold the structure, dynamic tables hold per-die detail, and the Golden Rule — bin counts sum to part count — is the fundamental integrity invariant.

## 4.11 Quiz — Chapter 4

**Q1.** PAT flags a die as an outlier. Which bin number changes — hard or soft — and in which table/column is it stored?

**Answer.** The **Soft Bin** — stored in `BIN_SUMMARY.Soft_Bin_No`. Hard bins are never modified post-test.

**Q2.** A wafer shows Part_Count = 15,000. BIN_SUMMARY rows: Bin 1 = 12,300, Bin 2 = 1,200, Bin 6 = 1,450. Run the Golden Rule check and state your conclusion.

**Answer.** 12,300 + 1,200 + 1,450 = 14,950 ≠ 15,000. **Golden Rule violated** — 50 dies unaccounted; a loader bug (or missing bin rows). Escalate; data can’t be trusted until reconciled.

**Q3.** Compute the yield for Q2’s wafer (using Bin 1 as the good bin).

**Answer.** 12,300 ÷ 15,000 × 100 = **82%**.

**Q4.** Why must FTR (functional) results be excluded from a parametric histogram?

**Answer.** FTRs have no numeric value — nothing to plot; including them would corrupt distribution statistics. They contribute pass/fail to bin counts only.

**Q5.** After running PAT, a bin summary report shows Bin 1 dropped by 42 dies and Bin 130 rose by 42. Bug or feature? Explain.

**Answer.** Feature. PAT re-binned 42 statistical outliers from Bin 1 into PAT fail bin 130; conservation (42 out = 42 in) is exactly right.

**Q6.** Which table would you query to find a parameter’s spec limits, and which for its per-wafer mean and standard deviation?

**Answer.** Spec limits → `TEST_PARAM_MAP` (Low_Limit/High_Limit); mean and σ per wafer → `TEST_SUMMARY`.
