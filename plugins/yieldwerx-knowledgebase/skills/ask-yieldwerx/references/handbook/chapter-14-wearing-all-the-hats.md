---
id: handbook-third-sec-ch14
title: "Chapter 14 — Wearing All the Hats: From Domain Knowledge to Journeys, PRDs, Code, and Test Plans"
source_id: handbook-third-html
source_section: sec-ch14
edition: 3
status: current
confidentiality: internal
generated: true
---
Part V · Doing the Job

# Chapter 14 — Wearing All the Hats: From Domain Knowledge to Journeys, PRDs, Code, and Test Plans

## 14.1 Your role, mapped to this handbook

You’ll operate across four crafts. Each draws on the same domain knowledge differently:

- **User journeys:** ground them in the personas and workflows you now know — the yield engineer chasing an excursion (detect → diagnose → trace → contain, Chapter 2), the product engineer configuring PAT for a new automotive device, the QA manager watching holds. Good journeys name the *data* at each step, because in this domain every screen is a view over LOT/WAFER/BIN_SUMMARY truths.
- **PRDs:** the strongest PRDs here specify *data contracts* — what must be true in the database when the feature works. You have a vocabulary for this now: invariants (Golden Rule), stamps (`CustomLimitVersionId`), orderings (PAT/SWM before AMG), statuses (Complete/Unlinked/Hold). Write acceptance criteria as verifiable data conditions and your dev and QA selves will thank your PM self.
- **Development:** respect the architecture’s grain — engines are queued and independent; loaders are stateful record-parsers; CLM logic lives in the upload path; sequences (not IDs) drive joins. The documented debt (mixed ORM, WCF-SPC, shared mutable state) tells you where to tread carefully and what to propose fixing.
- **SQA:** your manager’s training plan is explicitly QA-flavored, and its capstone defines the bar: configure a full device onboarding (CLM + PAT + SWM + GDBN + SBYL + SPC + LG + AMG), upload data, and validate every module’s effects via SQL — 30+ test cases, plus at least one real defect report with reproducible steps and SQL evidence.

## 14.2 The universal validation method

Nearly every yieldWerx test reduces to one loop: **know the input (the file) → predict the effect (which tables, which values, which engine outputs) → query and compare → check the logs.** The handbook has armed you with each piece: file anatomy (Ch 6), table map (Ch 4, 7), per-module effects (Ch 9–13), and the statistics to recompute anything (Ch 5).

Standing invariants worth a personal checklist: Σbin counts = Part_Count; yield = Good/Part × 100; PIR count = PRR count = Part_Count; one active Production CLM version; no expired active CLM versions; AMG count = current Bin 1; no orphan FT lots; dies never increase downstream; functional tests out of parametric reports.

## 14.3 A worked mini-capstone (mental dry run)

New device MPQ5500: automotive customer wants Vt limits tighter than the program’s, PAT at ±4σ, known edge-effect risk at Fab A, contractual 14,000 good dies per wafer minimum. Your setup maps one-to-one to modules: CLM master in Production mode (tight Vt) → PAT policy (4σ on Vt, Iddq) → SWM edge-ring rule → GDBN (Bin 1 ≥ 14,000) → SBYL bands → SPC template on Vt mean → LG policy (lot-prefix matching) → AMG (JCAP, Bin 1 only). Then upload WS data and walk the pipeline: CLM stamp? PAT dashboard? SWM status? GDBN verdict? Map file on disk? Upload FT data: LG linked? GDBNZ comparable? Every question is a SQL query you can now write.

## 14.4 Known gaps register (your inherited bug backlog)

Carry these in working memory — they’re documented, open, and testable: **G-17** CLM expiry unenforced; **G-23** CLM thread-safety under concurrent upload; **G-03** silent CLM import failures; **G-02** missing InUse guard; SPC’s dual WCF/WebAPI paths; no unit tests on main web controllers; SWM/“CWM” naming inconsistency; mixed EF ORM styles; and the terminology conflicts in Appendix D (G-24). Each is simultaneously a test obligation, a risk to mention in PRDs touching that area, and a candidate improvement proposal.

## 14.5 Field Notes 🧭

- When triaging any data bug, walk the pipeline *forward from the file*, not backward from the report — upstream causes masquerade as downstream symptoms.
- Severity intuition for this domain: (1) wrong data silently (worst — decisions get made on it), (2) missing data loudly, (3) UI/cosmetic. AMG and customer-facing report defects sit at the top.
- Your unusual multi-hat position is a feature: PRDs written by someone who will also test them tend to contain testable acceptance criteria — a rarity worth cultivating deliberately.
- Confidentiality reflex: yield data, customer names, and limits are commercially sensitive. Scrub examples before anything leaves internal systems.

## Global Trends & the Bigger Picture 📈

The way software gets built and tested is shifting toward **shift-left quality** (testing designed in from the start, not bolted on), **PRD-as-code / executable specifications**, and **AI copilots** assisting both development and QA. For someone whose role spans journeys, PRDs, development, and testing, this convergence is an advantage: the boundaries between the hats are blurring industry-wide. *For management:* multi-skilled staff who can carry a feature from user need to verified delivery are increasingly the norm, not the exception. *For everyone:* the durable skill is the discipline of tying every requirement to something verifiable — the theme of this whole chapter.

## Bug-Hunting & Hardening Tips 🐞

Operationalize the **universal loop**: predict (which tables/values/engine outputs a file should produce) → query → compare → read the logs. Turn the standing **invariants** into an automated daily health-check job: the Golden Rule, yield recomputation, one active Production CLM version, no expired-active CLM versions, AMG count = current Bin 1, no orphan FT lots, dies never gained downstream, functional tests excluded from parametric reports. Always **triage forward from the file**, not backward from the report — upstream causes masquerade as downstream symptoms. Prioritize by a clear **severity model**: silently-wrong data is worse than loudly-missing data, which is worse than cosmetic. And practice **negative testing** — the empty wafer, the corrupt file, the concurrent upload — because that is where real defects hide.

## Did You Know? 💡

- **“Shift-left” is a timeline, drawn literally.** Picture the project schedule left-to-right; “shifting testing left” means moving it earlier — toward design — instead of bolting it on at the end. The phrase is now industry gospel for building quality in rather than inspecting it in.
- **“Dogfooding” — eating your own dog food.** Teams that use their own product to catch its bugs are “dogfooding.” For an allrounder who writes the PRD *and* tests the feature, you are the dogfood chef and the first taster at once — which is exactly why your acceptance criteria tend to be testable.

## 14.6 Never Forget ⭐

1. **Predict → query → compare → logs.** The universal loop.
2. Write PRD acceptance criteria as **database-verifiable conditions**.
3. The **known-gaps register** is your inherited backlog — test it, cite it, propose fixes.
4. Triage forward from the file; the loader explains more bugs than the chart does.
5. The capstone bar: full-device onboarding, 30+ test cases, SQL-evidenced defect report. Aim your first months at being able to do this cold.

## 14.7 Summary

Your four hats share one foundation: knowing what must be true in the data. Journeys narrate the personas’ detect-diagnose-trace-contain workflows; PRDs pin features to verifiable data contracts; development respects the queued-engine, loader-centric, sequence-keyed architecture; SQA runs the predict-query-compare-logs loop against a personal library of invariants, with the documented gaps register as standing work. The training plan’s capstone — onboarding a device end-to-end with full validation — is the practical definition of “you’ve arrived.”

## 14.8 Quiz — Chapter 14

**Q1.** Turn this into a data-verifiable acceptance criterion: “When CLM is configured for a program, uploads should use the custom limits.”

**Answer.** “After uploading a file whose MIR Program_Name matches an active CLM version, every created WAFER row has `CustomLimitVersionId` = that version’s ID, and parametric report limits equal CustomLimitDetail values (not TEST_PARAM_MAP originals). For non-matching programs, `CustomLimitVersionId` IS NULL.”

**Q2.** A report shows wrong yield. Order these checks per the triage principle: (a) chart rendering, (b) BIN_SUMMARY vs WAFER integrity, (c) report filters, (d) source file WRR values.

**Answer.** (d) source file WRR values → (b) BIN_SUMMARY/WAFER integrity → (c) report filters → (a) rendering. Forward from the file.

**Q3.** Name three standing invariants you’d put in a daily automated health-check job, and the chapter each comes from.

**Answer.** Examples: Golden Rule (Ch 4); no >1 active Production CLM version + no expired-active versions (Ch 9); orphan FT lot hunt (Ch 13). (Also acceptable: AMG count = Bin 1 (Ch 13); yield recomputation (Ch 4).)

**Q4.** You’re writing a PRD for “CLM expiry enforcement.” Which gap does it close, and what regression risk must the PRD flag?

**Answer.** Closes **G-17**. Regression risk: production flows that currently *rely* on expired versions continuing to apply would suddenly load without CLM limits — the PRD must define transition behavior (grace period, alerts, migration audit).

**Q5.** Sketch the module configuration list for onboarding a new automotive device with a contractual good-die floor and a known scratch-defect history.

**Answer.** CLM master (Production mode, customer limits) → PAT policy (±Nσ on key parameters — automotive) → SWM policy with **scratch rule** (+ cluster/adjacency) → GDBN floor on Bin 1 (contractual count) → SBYL bands per fail bin → SPC templates on key parameters → LG policy for FT linkage → AMG policy (correct format, Bin 1 + agreed grade bins).
