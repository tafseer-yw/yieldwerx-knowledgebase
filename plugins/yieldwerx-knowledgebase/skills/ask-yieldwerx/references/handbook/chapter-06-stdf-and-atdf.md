---
id: handbook-third-sec-ch6
title: "Chapter 6 — STDF & ATDF: The Files That Feed Everything"
source_id: handbook-third-html
source_section: sec-ch6
edition: 3
status: current
confidentiality: internal
generated: true
---
Part II · The Language of Test

# Chapter 6 — STDF & ATDF: The Files That Feed Everything

## 6.1 Why you must care about file formats

Everything yieldWerx knows arrives inside test-data files produced by ATE machines. If a file is parsed wrongly, every report, statistic, and alert downstream is wrong. That’s why understanding these formats is core QA skill: when data looks wrong in a report, the first fork in the road is *“bad file, or bad load?”* — and you can’t answer without reading the file.

## 6.2 STDF: the industry standard

**STDF (Standard Test Data Format)** — defined by ATE-maker Teradyne, adopted industry-wide — is a **binary**, record-based format. One STDF file = one wafer test pass (or one FT lot session), containing lot info, wafer info, per-die results, test definitions, and summaries. Being binary, it’s compact but unreadable without a parser; yieldWerx parses it with a customized fork of **LinqToStdf**.

## 6.3 ATDF: the same thing, but human-readable

**ATDF (ASCII Test Data Format)** carries the same logical records as STDF but as plain, pipe-delimited (`|`) text — one record per line, openable in any text editor. It’s bigger on disk, but as a QA/debugging tool it is priceless: *when a load looks wrong, inspect the ATDF equivalent visually.* yieldWerx has its own ATDF loader.

## 6.4 The record types — a guided tour

Both formats are sequences of typed records. Think of the file as a set of nested envelopes:

- **MIR (Master Information Record)** — opens the file. Lot-level metadata: lot ID, part type, test program name, facility. Maps to the `LOT` table. *One per file.*
- **SDR (Site Description Record)** — optional; describes multi-site testing (ATE testing several dies simultaneously).
- **WIR (Wafer Information Record)** — opens one wafer’s data block. Maps to `WAFER`. *One per wafer.*

**PIR (Part Information Record)** — opens one die’s block. *One per die.*

**PTR (Parametric Test Record)** — one numeric measurement: test number, name, result, low/high limits, units. *The most numerous record type — one per parameter per die.* Feeds `TEST_PARAM_MAP` and the dynamic tables.
- **FTR (Functional Test Record)** — one pass/fail functional result. No numeric value — must stay out of parametric reports.

**PRR (Part Results Record)** — closes the die’s block: pass/fail flag, **hard bin, soft bin, X/Y coordinates**, part ID. Feeds `BIN_SUMMARY` and wafer maps.
**WRR (Wafer Results Record)** — closes the wafer’s block: **NUM_PARTS (→ Part_Count), GOOD_CNT (→ Good_Count)**, retest counts.

**MRR (Master Results Record)** — closes the file: end timestamp, disposition. *If MRR is missing, the file is truncated/corrupt* — a load-validation check you’ll actually use.

The nested-envelope structure of an STDF/ATDF file

The nested-envelope structure of an STDF/ATDF file

**How to read this figure:** read it outside-in: MIR/MRR bracket the whole file, WIR/WRR bracket one wafer, and each die lives in a PIR→PRR envelope containing its individual test results — green PTRs carry numbers with limits, purple FTRs carry only pass/fail. Die #2’s red PTR shows a measurement over its limit, and its PRR records the consequence: soft bin 3. This diagram *is* the sample file of the next section, drawn instead of typed.

## 6.5 A real ATDF walkthrough

Here is a miniature but faithful two-die wafer file:

```
MIR|LOT_001|MPQ5500|ATE_NODE_A|J750|TEST_PROG_V2.1|WAFER_SORT|FAB_A|FLOW_A|2026-01-15 08:00:00 WIR|WAFER_001|1|1 PIR|1|1 PTR|1001|Vt_nMOS||0.452|V|0.350|0.550| PTR|1002|Iddq_25C||0.0087|mA|0.000|0.010| PTR|1003|Freq_Ring_Osc||521.3|MHz|450.0|600.0| FTR|2001|Scan_Full||0| PRR|1|1|0x00|1|1|10|20|DIE_001 PIR|1|1 PTR|1001|Vt_nMOS||0.538|V|0.350|0.550| PTR|1002|Iddq_25C||0.0125|mA|0.000|0.010| PTR|1003|Freq_Ring_Osc||509.1|MHz|450.0|600.0| FTR|2001|Scan_Full||0| PRR|1|1|0x08|3|1|11|20|DIE_002 WRR|WAFER_001|1|1|2|1|0|0|2026-01-15 08:45:00 MRR|2026-01-15 09:00:00|A|Normal completion
```

Read it like a story: Lot LOT_001 of device MPQ5500, tested with program TEST_PROG_V2.1 at FAB_A (MIR). Wafer WAFER_001 begins (WIR). **Die 1** at coordinates (10, 20): Vt = 0.452 V ✓, Iddq = 0.0087 mA ✓ (limit ≤ 0.010), ring-oscillator 521.3 MHz ✓, functional scan passes → PRR assigns **soft bin 1** (good). **Die 2** at (11, 20): Iddq = **0.0125 mA — exceeds the 0.010 limit** → PRR assigns **soft bin 3** (fail). WRR closes the wafer: 2 parts, 1 good → the loader computes yield 50%. MRR confirms clean completion.

After this file loads, you’d expect in the database: one LOT row (values matching MIR), one WAFER row (Part_Count 2, Good_Count 1, Yield 50), BIN_SUMMARY rows (bin 1 → 1 die; bin 3 → 1 die — Golden Rule: 1+1 = 2 ✓), and four TEST_PARAM_MAP rows (tests 1001, 1002, 1003, 2001).

## 6.6 Record-count sanity checks (a QA habit)

The nesting gives you free arithmetic invariants: count(PIR) = count(PRR) = WAFER.Part_Count; count(WIR) = count(WRR) = number of wafers; one MIR and one MRR per file. Any imbalance = truncated or malformed file, or a parser bug. These checks cost minutes and catch entire classes of loader defects.

## 6.7 Field Notes 🧭

- STDF is *stateful*: records only make sense in sequence (a PTR belongs to whichever PIR is currently open). Parser bugs therefore often corrupt *whole spans* of dies, not single values — when you find one wrong die, check its neighbors in file order.
- Files often arrive **gzip-compressed**; the upload service decompresses automatically. A corrupt .gz is another “why didn’t my file load?” answer.
- Endianness (byte order) in binary STDF differs by tester vendor — a classic source of subtle parsing bugs.
- Multi-site testing (SDR present) means the ATE tests 2, 4, 8+ dies in parallel; per-site data must land as separate die records. Multi-site handling has its own dedicated processing (MPR records) — good hunting ground for edge-case test cases.
- yieldWerx also ingests other formats (CSV, DAS, proprietary); STDF/ATDF are simply the canonical ones to learn first.

## 6.8 Jargon Decoded

- **Record:** one typed unit of data in the file (MIR, PTR, PRR…).
- **Binary format:** machine-oriented encoding, not human-readable (STDF).
- **Pipe-delimited:** fields separated by `|` characters (ATDF).
- **Parser/loader:** code that reads a file format and writes database rows.
- **Multi-site testing:** testing several dies simultaneously on one ATE.
- **Truncated file:** cut off before its closing records (missing MRR).
- **Magic bytes:** the first bytes of a file identifying its true format regardless of extension.

## 6.9 Acronyms

- **STDF** — Standard Test Data Format (binary)
- **ATDF** — ASCII Test Data Format (text twin of STDF)
- **MIR/MRR** — Master Information / Results Record (file open/close)
- **WIR/WRR** — Wafer Information / Results Record (wafer open/close)
- **PIR/PRR** — Part Information / Results Record (die open/close)
- **PTR** — Parametric Test Record (a number)
- **FTR** — Functional Test Record (pass/fail)
- **SDR** — Site Description Record (multi-site config)
- **MPR** — Multi-site Parametric Record

## Global Trends & the Bigger Picture 📈

The volume of test data is exploding as devices grow more complex and test insertions multiply, pushing platforms toward **streaming ingestion and cloud-scale parsing**. Yet the format at the bottom of it all barely changes: **STDF, defined by Teradyne in the 1980s, is still the industry backbone forty years later** — a rare example of a standard outliving generations of hardware. *For management:* betting on robust, standards-based ingestion is a safe long-term investment. *For engineers:* the durable skill is reading these files fluently, because when a modern cloud pipeline misbehaves, the answer is almost always found by opening the raw ATDF and looking.

## Bug-Hunting, Fuzzing & Hardening Tips 🐞

A file parser is a **security surface**, not just a functional one — it consumes untrusted input from external testers and partners. **Fuzz the parser**: feed it truncated files (missing MRR), corrupt headers, wrong-endian data, absurd record counts, and malformed fields, and confirm it fails safely rather than crashing or corrupting the database. Guard against **gzip bombs and oversized files** exhausting memory. Enforce the **record-count invariants** (PIR count = PRR count = Part_Count; one MIR, one MRR) as automatic load-time assertions. Watch **endianness and character-encoding/locale** issues in binary and text parsing. Golden habit: when a load looks wrong, open the ATDF twin in a text editor before theorizing — the raw records rarely lie.

## Did You Know? 💡

- **STDF is older than most engineers using it.** Teradyne defined the Standard Test Data Format in the 1980s, and it remains *the* industry backbone four decades later — a rare case of a data standard outliving generation after generation of the hardware that writes it.
- **ATDF is STDF you can actually read.** The “A” is for ASCII: same records, but as plain pipe-delimited text you can open in Notepad. It exists almost entirely as a debugging courtesy — proof that even in a binary world, human-readable data earns its keep.

## 6.10 Never Forget ⭐

1. **One STDF file = one wafer test pass.** MIR opens, MRR closes; **no MRR = corrupt/truncated file.**
2. The nesting: **MIR → WIR → (PIR → PTR/FTR… → PRR)×dies → WRR → MRR.**
3. **PRR carries the bin and the X/Y coordinates** — the two facts that power bin summaries and wafer maps.
4. **WRR carries Part_Count and Good_Count** — the source of truth for yield.
5. ATDF is your debugging window: same content as STDF, readable in Notepad.
6. Record-count invariants (PIR = PRR = Part_Count) are free, powerful integrity checks.

## 6.11 Summary

ATE machines emit one STDF (binary) or ATDF (readable text) file per wafer test pass, structured as nested records: MIR/MRR bracket the lot, WIR/WRR bracket each wafer, PIR/PRR bracket each die, with PTR (numeric) and FTR (pass/fail) results inside. PRR holds bins and coordinates; WRR holds part/good counts. yieldWerx parses these into LOT/WAFER/BIN_SUMMARY/TEST_PARAM_MAP and dynamic tables. Reading ATDF and applying record-count invariants are core QA skills for diagnosing load issues.

## 6.12 Quiz — Chapter 6

**Q1.** A loaded wafer shows `Good_Count = NULL`. Which record type carries that value, and where does it sit in the file structure?

**Answer.** **WRR** (Wafer Results Record) carries GOOD_CNT; it closes each wafer’s block, just before the next WIR or the MRR.

**Q2.** In the sample file above, exactly why did Die 2 land in bin 3? Quote the failing value, its limit, and the record types involved in detecting and recording the failure.

**Answer.** Die 2’s PTR for Iddq_25C reads **0.0125 mA against a high limit of 0.010 mA** — over limit. The PTR records the failing measurement; the **PRR** closes the die with SOFT_BIN = 3, recording the failure category.

**Q3.** You count 4,998 PIR records but WAFER.Part_Count says 5,000. Give two plausible causes and your next diagnostic step.

**Answer.** (i) Truncated/corrupt file (check MRR presence and PIR/PRR balance); (ii) parser dropped records (check loader logs). Next step: obtain the ATDF equivalent and count records directly.

**Q4.** Which is better for visually debugging a load issue — STDF or ATDF — and why?

**Answer.** ATDF — plain pipe-delimited text, openable in any editor; STDF requires parsing tools. Same logical content.

**Q5.** TEST_PARAM_MAP shows 3 parameters but the file contains PTR records for 5 distinct TEST_NUMs. What kind of bug is this, and in which component?

**Answer.** A loader/parsing bug (or filtered record handling) in the upload pipeline — TEST_PARAM_MAPBC failed to create rows for two TEST_NUMs. Every distinct TEST_NUM must map.

**Q6.** Why must FTR records not create entries in parametric histograms, and what *should* they contribute to?

**Answer.** No numeric value exists to bin into a histogram; including them would distort statistics. They should still exist as test entries and contribute to pass/fail and bin counting.
