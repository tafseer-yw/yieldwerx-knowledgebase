---
id: handbook-third-sec-ch3
title: "Chapter 3 — The Life of a Chip: From Sand to Shipment"
source_id: handbook-third-html
source_section: sec-ch3
edition: 3
status: current
confidentiality: internal
generated: true
---
Part I · The Brass Tacks

# Chapter 3 — The Life of a Chip: From Sand to Shipment

## 3.1 The journey at a glance

Every chip travels this road. Memorize it — every yieldWerx concept attaches to one of these stages:

**Design → FAB (wafer fabrication) → WAT/PCM test (Test Area 1) → Wafer Sort test (Test Area 2) → Assembly & Packaging → Final Test (Test Area 3) → System test/burn-in → Customer**

Notice there are **three test stages**, and yieldWerx literally numbers them Test Areas 1, 2, and 3. Data from each flows into yieldWerx.

The manufacturing flow and where yieldWerx listens

The manufacturing flow and where yieldWerx listens

**How to read this figure:** follow the top row left to right — that is the chip’s physical journey. The three orange boxes are the test stages (Test Areas 1, 2, 3); each emits STDF/ATDF files (green dashed arrows) that flow down into yieldWerx. Note the one orange arrow flowing *up*: the AMG pick-and-place map is yieldWerx’s output that physically guides Assembly’s die picking — the platform is not just an observer. The Facility_Type labels (‘W’, ‘F’) are the database flags you met in this chapter.

## 3.2 Stage 1 — The FAB: where chips are born

A **FAB** (fabrication facility) is the cleanroom factory that manufactures chips on silicon wafers. Raw silicon is purified, grown into a crystal ingot, and sliced into thin discs — wafers. Each wafer then undergoes **hundreds of process steps building up ~30–100 microscopic layers** over several weeks:

- **Photolithography** — projecting circuit patterns onto light-sensitive coating with UV light (like developing a photograph, repeated layer after layer).
- **Etching** — chemically removing unwanted material.
- **Deposition** — laying down thin films of conductors and insulators.
- **Doping / ion implantation** — shooting impurity atoms into the silicon to create transistor junctions.
- **CMP (chemical mechanical planarization)** — polishing the surface flat between layers.
- **Metallization** — adding metal wiring layers that connect transistors into circuits.

Output: a wafer carrying thousands of identical, still-attached dies.

**yieldWerx connection:** the FAB is the root of the data hierarchy. Every lot record stores `Facility_ID` (which FAB) — because the same chip design can be made in *multiple* FABs, and comparing yields across FABs is a core analysis. Wafers are processed in batches called **lots** (typically up to 25 wafers that move through the FAB together, sharing the same process history — like one classroom of students who take all classes together).

## 3.3 Stage 2 — WAT/PCM: testing the process, not the product (Test Area 1)

Before anything else, the FAB checks *did the manufacturing process itself come out right?* **WAT (Wafer Acceptance Test)**, also called **PCM (Process Control Monitoring)**, measures special test structures — purpose-built transistors, resistors, and capacitors placed in the **scribe lines** (the narrow “streets” between dies that will later be cut through). These structures measure the *process*: transistor threshold voltage (Vt), sheet resistance, gate-oxide thickness, leakage currents.

Real-life analogy: before tasting the cookies, the baker checks the oven’s own thermometer log and a small test biscuit placed in each corner of the tray. If the process is off, you know before wasting effort on the product.

A wafer failing WAT can be scrapped *before* money is spent packaging it. WAT data is also the earliest warning of drift: **if WAT parameters shift, Wafer Sort yield will suffer next** — so WAT parameters are prime targets for SPC monitoring (Chapter 12).

## 3.4 Stage 3 — Wafer Sort: grading every single die (Test Area 2)

**Wafer Sort (WS)** — also called wafer probe — is the first full test of every individual die’s actual circuitry, done while the wafer is still whole. A **probe card** (a precision bed of microscopic needles) touches down on each die’s contact pads in turn; the **ATE** machine runs the test program: applying voltages, measuring currents, checking frequencies, exercising digital logic — comparing every measurement against low/high **specification limits**.

Each die gets a **bin** assignment — a category code (Chapter 4 covers binning deeply). Bin 1 conventionally means “good.” The results — every measurement, every bin, every die’s X/Y position on the wafer — are written to an **STDF file, one file per wafer**, which flows into yieldWerx.

This stage produces the fundamental data yieldWerx lives on: yield per wafer, per-bin counts, per-die parametric values with wafer coordinates (enabling wafer maps that reveal spatial failure patterns).

## 3.5 Stage 4 — Assembly & Packaging: from die to unit

The wafer is **singulated** (sawn apart into individual dies), and *only dies that passed Wafer Sort* are picked and packaged — guided by a pick-and-place map that yieldWerx itself generates (the AMG module, Chapter 13). Packaging steps: die attach (glue die to frame) → wire bonding or flip-chip (connect die pads to package pins) → encapsulation in protective plastic → laser marking. This happens at an **ATS (Assembly Test Site)**, which yieldWerx treats organizationally like a FAB.

A packaged die is now called a **unit**. Critically, **one wafer FAB lot typically splits into multiple assembly lots** (e.g., wafers 1–5 become Assembly Lot A, wafers 6–10 become Lot B…). This splitting is why the **Lot Genealogy (LG)** module exists — without deliberate tracking, the family tree is lost (Chapter 13).

Assembly introduces its own failure modes: cracked dies from sawing, broken bond wires, contamination during encapsulation.

## 3.6 Stage 5 — Final Test: the last gate before the customer (Test Area 3)

**Final Test (FT)** electrically tests every *packaged unit*. A robotic **handler** drops each unit into a test socket; the ATE runs the final test program (often different from the Wafer Sort program): DC parametrics, AC/timing tests, functional patterns. Units are binned again — pass bins may encode **speed grades** (faster chips sell for more; this is why the same processor family has cheap and expensive variants).

FT answers two questions: *did packaging break anything?* and *does the finished product meet its full datasheet?* Comparing FT yield to WS yield exposes **assembly yield loss**. Output: STDF files again, ingested by yieldWerx, which uses Lot Genealogy to link FT units back to their origin wafers — enabling true end-to-end analysis, one of yieldWerx’s core value propositions.

## 3.7 The two-letter code that will follow you everywhere

In the yieldWerx database, every lot carries `Facility_Type`: **‘W’ = Wafer Sort** (testing whole wafers) and **‘F’ = Final Test** (testing packaged units). Nearly every query, report filter, and test case cares about this flag. Mixing up W and F data is a classic bug class.

## 3.8 Field Notes 🧭

- A wafer takes **8–12+ weeks** to travel from raw silicon to packaged, tested product. This latency is why *early* detection (WAT, SPC) is so valuable — by the time bad chips are found at Final Test, weeks of production are already in the pipeline behind them.
- Scribe-line test structures (used by WAT) are destroyed when the wafer is sawn apart — they exist purely to be measured, then die. Elegant, and slightly poetic.
- The notch or flat on a wafer’s edge marks crystal orientation and gives every die an unambiguous X/Y address — the coordinate system that wafer maps, SWM, and AMG all depend on.
- Why test at Wafer Sort at all, if Final Test re-tests everything? Because packaging a dead die wastes packaging cost (and OSAT capacity). Wafer Sort is a *cost filter*; Final Test is a *quality gate*.
- Test Areas: **1 = WAT/PCM, 2 = Wafer Sort, 3 = Final Test.** yieldWerx keeps them as separate datasets — QA must verify data lands in the right area.

## 3.9 Jargon Decoded

- **Lot:** a batch of wafers (typically up to 25) processed together through the FAB — the primary unit of tracking.
- **Scribe lines:** the streets between dies where the saw will cut; WAT test structures live here.
- **Probe card:** needle array that contacts a bare die’s pads during Wafer Sort.
- **Handler:** robot that feeds packaged units into test sockets at Final Test.
- **Singulation:** cutting the wafer into individual dies.
- **Speed grade / binning:** classifying passing chips by measured performance so they can be sold at different price points.
- **Burn-in:** stressing chips at elevated temperature/voltage to weed out infant failures (used for high-reliability products).
- **Test program:** the software recipe the ATE executes — the ordered list of tests, limits, and bin assignments.

## 3.10 Acronyms

- **FAB** — Fabrication Facility
- **WAT** — Wafer Acceptance Test
- **PCM** — Process Control Monitoring (synonym of WAT)
- **WS** — Wafer Sort (a.k.a. wafer probe)
- **FT** — Final Test
- **ATS** — Assembly Test Site
- **CMP** — Chemical Mechanical Planarization
- **Vt** — Threshold voltage (the voltage at which a transistor switches on)

## Global Trends & the Bigger Picture 📈

More stacking means more testing. As 2.5D/3D packaging and chiplets take over, the number of **test insertions** in a product’s life is rising, and **system-level test** (exercising the finished multi-die package under realistic workloads) is becoming standard rather than optional. The chiplet era also raises the stakes on **known-good-die**: because good dies from different wafers are combined into one expensive package, a single bad die can scrap a package worth far more than itself — so Wafer Sort and its data quality matter more than ever. *For everyone:* the “life of a chip” is getting longer and more instrumented, and every new test insertion is another data stream the platform must ingest cleanly.

## Bug-Hunting & Hardening Tips 🐞

The classic defect at this layer is **test-area / facility-type misclassification** — Wafer Sort (‘W’) data loaded or reported as Final Test (‘F’) or vice versa. Make a standing test that every dataset lands in the correct Test Area. Probe the **lot-split boundary at assembly**: does one FAB lot correctly fan out into multiple assembly lots without losing or duplicating units? Check **timestamp handling** across stages and facilities — different sites in different time zones, daylight-saving transitions, and locale date formats routinely corrupt “which happened first” logic. And verify the **material hierarchy** holds: every wafer resolves to a lot, every die to a wafer, every unit to a die.

## Did You Know? 💡

- **Bunny suits protect the chip, not the human.** Cleanroom “bunny suits” exist mainly to stop *humans* — who shed millions of skin flakes and particles — from contaminating the wafers. A top-grade cleanroom holds under ~10 particles per cubic foot; ordinary room air holds millions.
- **The streets between chips are called “scribe lines” — or just “streets.”** Chip-layout slang borrows from city planning: the empty channels the saw cuts through are “streets,” and the test structures living there are demolished the moment the wafer is diced.
- **A chip is older than it looks.** By the time a chip reaches Final Test it may be 8–12+ weeks into its life — which is why catching a problem early (at WAT or via SPC) is worth so much: weeks of wafers are always already in the pipeline behind it.

## 3.11 Never Forget ⭐

1. The flow: **FAB → WAT (TA1) → Wafer Sort (TA2) → Assembly → Final Test (TA3)**. Three test areas, numbered 1/2/3, each feeding yieldWerx.
2. **WAT tests the process; Wafer Sort tests the product; Final Test tests the package.**
3. `Facility_Type`: **‘W’ = Wafer Sort, ‘F’ = Final Test.** Check it in every query.
4. One FAB lot **splits** into many assembly lots → Lot Genealogy exists to preserve the family tree.
5. Hierarchy of material: **FAB → Lot → Wafer → Die → (after packaging) Unit.**

## 3.12 Summary

A chip’s life runs from FAB fabrication (weeks of layered processing on a wafer), through three test stages — WAT/PCM verifying the process, Wafer Sort grading every die, Final Test validating every packaged unit — with assembly/packaging in between, where lots split and dies become units. yieldWerx ingests data from all three test areas, tags it by facility and type (‘W’/‘F’), and reconnects the split lineage via genealogy so failures anywhere can be traced to their origin.

## 3.13 Quiz — Chapter 3

**Q1.** Put in order and name the test area numbers: Final Test, WAT/PCM, Wafer Sort.

**Answer.** WAT/PCM = Test Area 1 → Wafer Sort = Test Area 2 → Final Test = Test Area 3.

**Q2.** What does WAT measure, and *where* physically do its test structures live? Why is failing WAT early actually a cost saving?

**Answer.** WAT measures the *process* via purpose-built test structures in the scribe lines (streets between dies). A failing wafer is scrapped before assembly spends packaging money on it — failure caught before value is added.

**Q3.** Match each term to its stage: probe card, handler, scribe line, singulation, speed grade.

**Answer.** Probe card → Wafer Sort; handler → Final Test; scribe line → WAT/fabrication; singulation → assembly; speed grade → binning at WS/FT.

**Q4.** A batch record shows `Facility_Type = 'F'`. What kind of material was tested, and what module links it back to its origin wafers?

**Answer.** Packaged units at Final Test. Lot Genealogy (LG) links it back to origin wafer-sort lots.

**Q5.** A wafer lot of 25 wafers is split at assembly into three assembly lots. Later, one Final Test lot shows abnormal failures. What question does Lot Genealogy let you answer that would otherwise be impossible?

**Answer.** “Which wafers and which sibling assembly lots share history with the failing units?” — i.e., scoping the problem back to origin and across to affected siblings. Without LG the split severs that lineage.

**Q6.** Why does the industry bother with Wafer Sort when Final Test re-tests every unit anyway?

**Answer.** Wafer Sort is a cost filter: packaging a dead die wastes assembly money and capacity. Final Test is the quality gate for what packaging itself may have broken.
