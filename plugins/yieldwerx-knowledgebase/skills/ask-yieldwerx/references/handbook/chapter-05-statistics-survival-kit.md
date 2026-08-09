---
id: handbook-third-sec-ch5
title: "Chapter 5 — Statistics Survival Kit: The Math, Made Friendly"
source_id: handbook-third-html
source_section: sec-ch5
edition: 3
status: current
confidentiality: internal
generated: true
---
Part II · The Language of Test

# Chapter 5 — Statistics Survival Kit: The Math, Made Friendly

*Everything statistical in yieldWerx — PAT, SPC, Cpk, control charts — is built from a handful of ideas. Master these ten pages and no formula in this domain will scare you again.*

## 5.1 Mean: the center of gravity

The **mean** (average) is all values summed, divided by the count. If five dies measure threshold voltages of 0.44, 0.45, 0.45, 0.46, 0.45 volts, the mean = 2.25 ÷ 5 = **0.45 V**. The mean tells you where the process is *centered*. (The **median** — middle value when sorted — is a cousin you’ll occasionally see in trend reports; it ignores extreme values.)

## 5.2 Standard deviation: how spread out things are

Two archers can both average a bullseye — but one clusters arrows tightly, the other sprays them everywhere. Same mean, very different **spread**. **Standard deviation (StdDev, symbol σ, “sigma”)** measures that spread: *roughly, the typical distance of a value from the mean.*

- Small σ → measurements cluster tightly → a stable, consistent process.
- Large σ → measurements scatter widely → an unpredictable process.

You don’t need to hand-compute σ (the database’s `TEST_SUMMARY.StdDev` does it), but understand what it *is*: take each value’s distance from the mean, square those distances, average them, take the square root. Squaring makes big deviations count extra — σ is sensitive to wild values.

## 5.3 The normal distribution: nature’s bell curve

Measure the same parameter on thousands of dies and plot a histogram (bars showing how many dies fall in each value range). For a healthy process you’ll almost always see a **bell curve**: most dies near the mean, fewer and fewer as you move away, symmetric on both sides. This shape is the **normal distribution**, and it appears whenever many small random influences add up — which is exactly what chip manufacturing variation is.

The magic of the bell curve is that σ becomes a universal ruler:

- Mean ± 1σ contains ≈ **68%** of all dies
- Mean ± 2σ contains ≈ **95%**
- Mean ± 3σ contains ≈ **99.7%**
- Mean ± 4σ contains ≈ 99.994% — only ~63 dies per *million* fall outside
- Mean ± 6σ — about 2 dies per *billion* outside

So “this die is 4.8σ from the mean” translates to: *for a healthy process, a die this extreme is a near-impossibility — something is wrong with it.* That single sentence is the entire philosophy of PAT (Chapter 10).

The bell curve as a ruler: sigma zones, control limits, spec limits

The bell curve as a ruler: sigma zones, control limits, spec limits

**How to read this figure:** the curve is a healthy parameter’s distribution. The shaded bands show how much of the population lives within ±1σ, ±2σ, ±3σ of the mean. The orange dashed lines are *control limits* (the process’s own normal boundary, Mean ± 3σ); the red solid lines are *spec limits* (the customer’s requirement) — deliberately farther out. The red dot is a maverick die: inside spec, so a fixed limit passes it, but far outside the population — exactly what PAT catches. Keep this picture in mind for the whole book; PAT, SPC, and Cpk are all just conversations about these lines.

**Warning shape:** a histogram with **two peaks (bimodal)** means two different populations got mixed — e.g., two testers calibrated differently, or two process conditions. A bimodal histogram is always worth investigating.

## 5.4 Outliers: the mavericks

An **outlier** is a value implausibly far from the rest of the population. Key insight for this domain: *a die can be inside the specification limits and still be an outlier.* Spec limits say “0.35–0.55 V is acceptable”; if the whole wafer sits at 0.45 ± 0.01 V and one die reads 0.54 V, that die *passed* — but it is wildly abnormal (9σ away!) and statistically likely to be defective in ways the test didn’t catch. Such “maverick” dies fail disproportionately later, in customers’ products. Automotive quality standards demand they be screened out — hence PAT.

## 5.5 Cpk: grading the process against its limits

**Cpk (Process Capability Index)** answers: *how comfortably does the process distribution fit inside the spec limits?* It measures the distance from the mean to the *nearest* spec limit, in units of 3σ:

> **Cpk = min( (High_Limit − Mean) ÷ 3σ , (Mean − Low_Limit) ÷ 3σ )**

Intuition: parking a car (the distribution) in a garage (the limits). Cpk asks how much clearance you have on the *tighter* side, measured in “3σ car-widths.”

- **Cpk ≥ 1.67** — excellent (Six-Sigma territory)
- **Cpk ≥ 1.33** — good; typical requirement for production qualification
- **Cpk ≥ 1.00** — marginal; distribution just barely fits
- **Cpk < 1.00** — failing; the process *will* produce out-of-spec parts routinely

Worked example: limits 0.35–0.55 V, mean 0.47 V, σ = 0.02 V. Upper: (0.55 − 0.47) ÷ (3 × 0.02) = 0.08 ÷ 0.06 = 1.33. Lower: (0.47 − 0.35) ÷ 0.06 = 2.00. **Cpk = min(1.33, 2.00) = 1.33** → good, but the risk is on the high side (mean sits closer to the upper limit). Note how Cpk punishes off-center processes: same σ centered at 0.45 V would give Cpk = 1.67.

## 5.6 Control limits vs spec limits — do not confuse them

- **Specification limits (LSL/USL)** — what the *customer/design* requires. Fixed by engineering. Violating them = bad part.
- **Control limits (LCL/UCL)** — what the *process itself* normally does, computed as **Mean ± 3σ of historical data**. Violating them = the process changed, even if parts are still in spec.

Analogy: your commute takes 30 ± 5 minutes normally (control limits ≈ 15–45 min with 3σ), and you must arrive within 60 minutes (spec limit). A 50-minute commute violates *control* (something unusual happened — investigate!) while still meeting *spec* (you weren’t late). SPC (Chapter 12) lives entirely on this distinction: it alarms on control-limit behavior to catch drift *before* spec limits are ever threatened.

## 5.7 Detecting drift: Western Electric / Nelson rules

A single point outside ±3σ is an obvious alarm. But subtler patterns also betray a process change, and the classic **Western Electric / Nelson rules** codify them. The ones yieldWerx uses:

- **Rule 1:** one point beyond 3σ — a sudden extreme event.
- **Rule 2:** nine consecutive points on the same side of the mean — the center has *shifted* (fair coin won’t land heads 9 times running).
- **Rule 3:** six consecutive points steadily rising (or falling) — a *trend* (drift in progress).
- **Rule 4:** fourteen consecutive points alternating up/down — systematic oscillation (e.g., two alternating machines disagree).
- **Rule 5:** two of three consecutive points beyond 2σ — clustering near the edge.

The shared logic: each pattern is *statistically improbable by chance*, so its appearance means an assignable cause exists. You now understand every SPC alarm you will ever test.

## 5.8 Field Notes 🧭

- “Six Sigma” the quality movement is named exactly from this math — engineering processes so capable that defects are measured per *billion*.
- PAT typically uses 3σ to 6σ screening thresholds. Tighter (smaller N) catches more mavericks but throws away more good dies — a real business tradeoff customers configure per product. There is no free lunch: false alarms vs escapes.
- σ-based limits are *dynamic*: they’re recomputed from each wafer’s own population. A limit that adapts to the data is the fundamental upgrade over fixed spec limits.
- When validating any statistic in yieldWerx, you can recompute it independently — `TEST_SUMMARY` gives you Mean/StdDev; the formulas above give you expected PAT limits, Cpk, and control limits. *Recompute-and-compare is your standard QA weapon.*

## 5.9 Jargon Decoded

- **Mean (μ):** the average; the process center.
- **Standard deviation (σ):** typical distance of values from the mean; the spread.
- **Normal distribution:** the bell curve; arises from many small random variations.
- **Histogram:** bar chart of how many values fall in each range.
- **Bimodal:** two-peaked histogram — two mixed populations; investigate.
- **Outlier / maverick:** value implausibly far from its population, even if within spec.
- **Cpk:** how well the distribution fits within spec limits (min clearance ÷ 3σ).
- **UCL/LCL:** upper/lower control limits (Mean ± 3σ of the process itself).
- **USL/LSL:** upper/lower specification limits (what the design requires).
- **EWMA chart:** control chart weighting recent points more — catches small sustained shifts earlier.

## 5.10 Acronyms

- **σ** — sigma, standard deviation
- **Cpk** — Process Capability Index
- **UCL/LCL** — Upper/Lower Control Limit
- **USL/LSL** — Upper/Lower Specification Limit
- **SPC** — Statistical Process Control
- **EWMA** — Exponentially Weighted Moving Average

## Global Trends & the Bigger Picture 📈

Statistics in this field is being augmented by machine learning. Research and industry practice increasingly use **ML and AutoML for yield prediction**, and — importantly — **explainable AI (xAI)**, because engineers must be able to *act* on a prediction, not just receive it. There is also growing awareness that real parametric distributions are **not always perfectly normal**, so blindly applying ±3σ Gaussian assumptions can mislead; robust and multivariate methods are gaining ground. *For everyone:* the intuition you build here — mean, spread, “how abnormal is this,” capability — remains the foundation; ML sits on top of it, and a model you cannot explain is a model you cannot ship.

## Bug-Hunting & Hardening Tips 🐞

Numerical bugs love statistics code. Always compare computed statistics (Cpk, σ, control limits) with a **floating-point tolerance**, never `==`. Guard **sample size**: standard deviation is undefined for n<2, and small samples give wild Cpk — test the n=0 and n=1 cases. Watch for the **population-vs-sample standard deviation** mismatch (dividing by n versus n−1); if the database, the R engine, and the report disagree by a hair, this is the usual culprit. Trap **NaN/Infinity propagation** from a stray divide-by-zero so one bad wafer doesn’t poison an aggregate. And sanity-check the shape: a **bimodal histogram** almost always means two populations got mixed — a data bug worth chasing before a statistics bug.

## Did You Know? 💡

- **The “k” in Cpk does *not* stand for a word starting with “index.”** It comes from the Japanese *katayori* (片寄り), meaning “offset” or “bias.” Cp measures raw capability; the *k* correction accounts for how far *off-center* the process mean sits. The index was developed by Japanese quality engineers (Kato and Otsu proposed the index form in 1956; Ishiyama’s *Cpb* became *Cpk* in 1967). So Cpk literally reads “capability of the process, corrected for bias.”
- **“Six Sigma” is a Motorola trademark.** Engineer Bill Smith coined it at Motorola in 1986; the company registered *Six Sigma* as a trademark in 1993. The whole quality movement is named after the σ ruler you just learned.
- **The Western Electric rules come from a 1956 handbook.** The pattern-detection rules SPC uses (Chapter 12) were codified by a committee at Western Electric — AT&T’s manufacturing arm — in its *Statistical Quality Control Handbook* (1956), still a standard reference nearly 70 years later.

## 5.11 Never Forget ⭐

1. **σ is a ruler for “how abnormal.”** ±3σ covers 99.7% of a healthy population; beyond that, suspect the die (PAT) or the process (SPC).
2. **In-spec ≠ normal.** A die can pass limits yet be a statistical maverick — that’s why PAT exists.
3. **Cpk = min clearance to a spec limit ÷ 3σ; 1.33 is the standard production bar.**
4. **Control limits (process voice) ≠ spec limits (customer voice).** SPC alarms on the first to protect the second.
5. Western Electric rules = codified “this pattern is too improbable to be chance.”
6. You can (and should) **recompute any statistic yourself** from TEST_SUMMARY to validate the platform.

## 5.12 Summary

The mean locates a process; standard deviation measures its spread; healthy processes form bell curves where ±3σ spans 99.7% of parts, making σ a universal abnormality ruler. Outliers are in-spec but improbable dies that fail later in the field. Cpk grades how comfortably a distribution fits its spec limits (1.33 = production-worthy). Control limits describe the process’s own normal behavior and are deliberately tighter than spec limits, so SPC’s Western Electric rules can flag shifts, trends, and oscillations before defective material is produced.

## 5.13 Quiz — Chapter 5

**Q1.** A parameter has Mean = 1.20 V, σ = 0.05 V. Compute the PAT dynamic limits at ±3σ, and state approximately what fraction of a healthy population falls inside them.

**Answer.** 1.20 ± 3×0.05 → **1.05 to 1.35 V**; ≈ **99.7%** of a healthy population lies inside.

**Q2.** A die measures 1.45 V on that parameter. Spec limits are 1.00–1.50 V. Does it pass spec? How many σ from the mean is it? What would PAT ±4σ do with it?

**Answer.** Passes spec (1.45 ≤ 1.50). It’s (1.45−1.20)/0.05 = **5σ** out. PAT ±4σ limits are 1.00–1.40 V → **PAT fails it** and re-bins it despite the spec pass. Textbook maverick.

**Q3.** Limits 2.0–3.0 V, Mean = 2.8 V, σ = 0.05 V. Compute Cpk. Is this process production-qualified? What single change would most improve Cpk?

**Answer.** Upper: (3.0−2.8)/(3×0.05) = 1.33; lower: (2.8−2.0)/0.15 = 5.33. **Cpk = 1.33** — meets the usual production bar, but only just, and entirely limited by the upper side. Best single fix: **center the mean** (shift toward 2.5), which would raise Cpk without touching σ.

**Q4.** Explain, using the commute analogy or your own, why a point can violate a control limit while the part is still perfectly within spec — and why we alarm anyway.

**Answer.** Control limits describe the process’s own habitual behavior; spec limits describe customer requirements. A 50-minute commute (normal: 30±5) means *something changed* — investigate now, while you’re still arriving on time. SPC alarms on change, not on failure.

**Q5.** Nine consecutive wafer means land above the centerline, none beyond 3σ. Which rule fires and what physical situation does it suggest?

**Answer.** Western Electric **Rule 2** (nine consecutive same-side points). The process mean has shifted — e.g., a tool recalibration, material change, or chamber drift.

**Q6.** A histogram of one parameter across a wafer shows two distinct peaks. Give two plausible physical causes and the name for this shape.

**Answer.** Bimodal. Causes: two testers/probe cards calibrated differently; two process tools or chambers behaving differently; mixed material from two FABs/flows.
