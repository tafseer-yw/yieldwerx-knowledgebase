---
id: handbook-third-sec-ch17
title: "Chapter 17 — Cluster Detection: Failure-Centric Pattern Hunting & the Rule Engine"
source_id: handbook-third-html
source_section: sec-ch17
edition: 3
status: current
confidentiality: internal
generated: true
---
Part VII · What’s New

# Chapter 17 — Cluster Detection: Failure-Centric Pattern Hunting & the Rule Engine

*Cluster Detection (CD) is the newest analytics feature in yieldWerx — and the first module built on the brand-new **Rule Engine**. This chapter is meant to be a one-stop shop: by the end you will understand the problem it solves, its three main building blocks (**signature**, **rule**, **policy**), the three detection modes, how it inks a wafer, how it runs under the hood, and how to build your own detection from an easy first rule up to a full multi-rule policy. Everything is shown with pictures, including a real wafer processed end to end.*

## 17.1 Why cluster detection exists

Chapter 11 introduced **GDBN** (Good Die, Bad Neighbor): a good die surrounded by failing neighbors is *itself* suspect, because defects tend to cluster. GDBN is **good-die-centric** — it looks at each passing die and asks “is my neighborhood bad enough that I should be screened out?” That is a proven way to cut **DPPM** (defective parts per million), which is exactly what automotive and other high-reliability customers demand.

But customers (RMT/Cosmic, Navitas) asked for scenarios GDBN could not express, because their thinking starts from the *failures*, not the good dies. They want to say: “*find groups of these specific failing bins, and then ink the good dies around them.*” That is **failure-centric**, and it is the gap Cluster Detection fills. You choose the bin(s) of interest, the tool finds where those failures cluster, and then it propagates the failure outward to surrounding dies by inking them.

GDBN asks whether a good die has too many bad neighbors; Cluster Detection starts from the failing bins and inks the good dies around them.

**How to read this figure:** on the left (GDBN), the boxed *good* die is the subject — it is flagged because failing neighbors surround it. On the right (Cluster Detection), the red failing dies are the subject: the tool groups them into a cluster and then *inks* (dark) the good dies touching the cluster. Same wafer, opposite starting point.

## 17.2 The big idea in one picture — Signature → Rule → Policy

Everything in Cluster Detection is built from three nested pieces. Learn these three words and the rest of the chapter is detail:

- **Signature** — *how a cluster looks.* The shape or size definition (and which detection engine drives it).
- **Rule** — *which dies, and what to do.* It attaches a signature, says which bins are candidates, where on the wafer to look, and how to ink the result.
- **Policy** — *when it runs, and in what order.* It gathers rules, targets a scope (facility / device / program), and orders them.

The definition model: a signature is reused by many rules; a policy chains many rules and runs them in order.

**How to read this figure:** read left to right — a **signature** (the shape) feeds into a **rule** (candidates + inking), which is chained inside a **policy** (scope + order). The arrows are “used by”. One signature can back many rules; one policy can run many rules; when two rules touch the same die, the *first* rule in the policy wins.

At a glance — the three pieces

1. **Signature = shape.** How does the cluster look — a blob of a certain size, an exact drawn pattern, or a dense window?
2. **Rule = candidates + action.** Which bins count, where to look, and how many rings of neighbors to ink.
3. **Policy = scope + order.** Which wafers it runs on, which rules, in what order, and one email/result at the end.

## 17.3 Signatures — how a cluster looks

A **signature** is created on the *Custom Signature* screen. The first choice is the **Detection Engine**: **Rule-Based Detection** (the default, and all that ships today) or **AI/ML** (present but disabled, reserved for a later release). When you pick Rule-Based, you then choose one of three **Cluster Detection Modes** — Cluster Size, Cluster Pattern, or Cluster Matrix. Each mode is a different way of answering “what counts as a cluster?”, and the next three sections take them one at a time, from the easiest to the most powerful.

A crucial vocabulary point that trips up newcomers: the **signature only describes the shape.** It does *not* say which bins to look at or what to do with the result — those live on the *rule* (§17.7). Keeping shape (signature) separate from candidates-and-action (rule) is what lets one drawn pattern be reused across many rules.

## 17.4 Mode 1 — Cluster Size (the easy one)

The simplest mode. You set a **minimum number of failing dies** that must be **adjacent** to each other to count as a cluster. Internally the engine does a **flood-fill**: it starts on an in-scope failing die and grows outward to every touching failing die, forming one connected component; if that component is at least the minimum size, it is a cluster.

“Touching” is controlled by one switch: **4-way** adjacency (up/down/left/right only) or **8-way** (also diagonals, when *IncludeDiagonal* is on). Failures that don’t touch are *separate* — three lone fails scattered across the wafer are not a cluster of three.

Cluster Size: adjacent failures form a connected component; a component at or above the minimum count is a cluster.

**How to read this figure:** the two left grids are valid clusters — every red die touches another red die, so they flood-fill into one group of 3 and one of 5. The two right grids are *not* clusters: the red dies are separated by passing dies, so each is its own group of 1, below the minimum. Turning on 8-way adjacency would let diagonal touches join.

At a glance — Cluster Size

1. **Adjacency switch first** — 4-way or 8-way? Diagonals change what joins.
2. **Minimum count** — how many touching fails make a cluster (e.g. ≥ 3).
3. **Are the fails actually touching?** Scattered same-bin fails do *not* count.

## 17.5 Mode 2 — Cluster Pattern (the exact one)

When you know the *exact shape* you are hunting — an L, a line, a corner — use **Cluster Pattern**. You draw the shape once on a small grid (e.g. 3×3), marking which cells must be failing and which are “don’t care.” The tool then matches that shape everywhere on the wafer by **sliding** it across the map.

Two powerful options make one drawing cover many real-world cases:

- **Rotations & flips** — tick 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°, and Flip X / Flip Y. The tool *pre-generates a concrete grid for each ticked orientation*, so at run time it is just a fast sliding match — there is no rotation math happening live, and every variation is inspectable.
- **Angle vs the wafer notch** (0°/90°/180°/270°) — this fixes the pattern relative to the notch, so the *same physical defect* is matched no matter how the wafer map happens to be oriented when loaded. Without it, four wafers that look identical on screen could actually carry four *different* physical patterns.

**Overlap** behavior is configurable: you decide whether two pattern matches are allowed to share a die.

Cluster Pattern: draw the shape once; each ticked rotation and flip is stored as its own ready-to-match grid.

**How to read this figure:** the leftmost grid is the L you drew (magenta = must-fail, grey = don’t care). The next grids are the same L pre-generated at 90°, 180°, 270°, and flipped — the tool made these for you from the one drawing. The evaluator simply slides each grid over the notch-aligned wafer looking for a match.

At a glance — Cluster Pattern

1. **The shape** — which cells are must-fail vs don’t-care?
2. **Which orientations are enabled** — rotations and flips widen what matches.
3. **Notch angle** — is the pattern pinned to the notch so it survives map re-orientation?
4. **Overlap** — may two matches share a die, or not?

## 17.6 Mode 3 — Cluster Matrix (the density one)

**Cluster Matrix** asks a looser question: “are there *enough* failures packed into a small window, wherever they fall?” You set a window size (rows × columns, e.g. 5×5) and a **minimum failure count**. The engine slides that window across the wafer; any position holding at least the minimum in-scope failures is a cluster. Unlike Cluster Size, the failures do **not** need to touch, and unlike Cluster Pattern, they need not form any particular shape — it is a pure density detector.

Cluster Matrix: a sliding window flags any region dense enough in failures, regardless of shape or adjacency.

**How to read this figure:** the navy box is the sliding window. It contains six failing dies, which is at or above the minimum of three, so this window position is a cluster — even though the fails are scattered and never touch. Move the window one step and it re-counts.

At a glance — Cluster Matrix

1. **Window size** — how big is the counting region (rows × cols)?
2. **Minimum fails** — how many in-scope failures inside the window trigger a cluster.
3. **Remember:** no adjacency, no shape — it is about density.

## 17.7 Rules — which dies, and what to do

A **signature** is a shape with no opinion about bins. The **rule** is where the real detection is defined. On the rule screen you set three things:

- **What to cluster on** — the **Detection Basis** is *Bin* today (Parameter may come later). You pick **Bin Type** (Hard or Soft) and a **Cluster Bin Mode**: *Bins to Detect* (only these bins are candidates) or *Bins to Skip* (every bin except these). The bins can be a comma-separated list, or shortcuts like *All Fail Bins*, *All Pass Bins*, *All PAT Fail Bins*, *All GDBN Fail Bins*, and so on. Bin here is a *classification*, never simply pass/fail.
- **Where to look** — optional **spatial filters** narrow the candidates to a region: reticle, radial zone, probe site, or an X/Y range. Shape (signature) and region (filter) are separate concerns.
- **What to do** — the **actions**. **Inking / layering** fails the neighborhood: set the number of **layers** (rings of neighboring dies to change) and a **layering mode** (All Pass Bins, All Fail Bins, or specific bins), plus the ink bin’s number, name and color. A rule can also **Output** (re-bin the detected dies themselves).

Inking & layering: once a cluster is found, the rule fails N rings of surrounding dies (here, one ring).

**How to read this figure:** the red dies are the detected cluster (layer 0). “Ink Layer = 1” fails one ring of neighbors around it (dark). Increase the layer count to fail more rings; the layering mode decides *which* neighbors qualify (all passing dies, all failing dies, or a specific bin list).

At a glance — reading a rule

1. **Bins to Detect / Skip** — which dies are candidates?
2. **Bin Type** — Hard or Soft bin classification.
3. **Spatial filter** — the whole wafer, or just a zone / reticle / probe site?
4. **Ink layers & mode** — how many rings, and which neighbors, get failed.

## 17.8 Policies — when it runs, and in what order

A **policy** wraps one or more rules and decides when the whole thing runs. Its parts:

- **Eligibility (scope)** — the gate that decides which wafers a policy applies to, built from wafer/lot facts: **facility, work center, device, program**, and probe type. Scope is either *device-level* (multiple devices allowed) or *program-level* (multiple programs allowed); you select a single facility and work center. All criteria must match (AND), while multiple values of the *same* fact form an OR list.
- **Ordered rules** — you set the execution order. Order matters because inking follows it, and because of the tie-breaker below.
- **First-rule-wins** — if two rules both claim the same die, the *first* rule in execution order assigns that die’s ink/fail bin. This makes results deterministic and explainable.
- **Policy actions & result pass** — after all rules run, a policy-level action (e.g. a summary **Email**) fires once, then the engine **Saves** a new result pass and **Notifies** downstream. Cluster Detection writes exactly two pass codes: **−14** for an automatic run (CD) and **−15** for a manual run (MCD). The original data is never modified — CD always writes a *new* pass alongside the originals.

**Automatic vs manual.** An *automated* policy is elected for a scope (at most one automated policy per scope — overlaps are blocked when you activate it), and the scanner runs it as matching wafers arrive. A *manual* run is launched by a person against a chosen policy; a Draft policy can be *previewed* (evaluated but never saved). When both are queued, manual runs jump ahead of automated ones by priority.

## 17.9 Seeing it on a real wafer

Enough theory — here is an actual wafer from the demo dataset (Lot A, Wafer 1, a 50×50 map with 100 failures across several bins), processed by a single Cluster-Size rule: *detect all fail bins, minimum size 4, 8-way adjacency, ink one layer of neighbors.*

Before — the raw wafer map, colored by hard bin. Failures are scattered; a few dense knots are visible.
After Cluster Detection — connected failure groups of 4+ are marked as clusters and their good neighbors are inked.

**How to read these figures:** in the “before” map, colored squares are failing bins on a field of green passing dies. In the “after” map, the engine kept the lone, scattered fails untouched but found the dense knots — each connected group of four or more became a cluster (outlined), and every passing die touching a cluster was inked dark. The header reports the exact counts the run produced.

At a glance — reading a CD result

1. **Which knots became clusters** — dense groups, not lone fails.
2. **The inked rings** — good dies now failed because they neighbor a cluster.
3. **The counts** — clusters found, dies detected, neighbors inked (top of the map).
4. **Yield before vs after** — inking always lowers yield; that trade is the point.

## 17.10 Under the hood — the Rule Engine

Cluster Detection is the first module of the **yieldWerx Rule Engine**, a single pipeline meant to eventually replace the separate, hand-built plumbing of GDBN, PAT and SWM. The guiding idea: *everything module-specific is data or a named provider, not new code.* Rules, filters, eligibility and actions are edited on screens and take effect without a deployment; a new module (GDBN next) becomes new rows and providers, not a new engine.

The Rule Engine pipeline: submit → gateway → queue → stateless worker → actions → save → notify, with skips recorded, never silent.

**How to read this figure:** a wafer event enters at the left. The **gateway** validates it and checks **eligibility** to pick the policy; if nothing matches, the wafer ends in a recorded *Skipped* row with the failing criterion named (bottom box) — never a silent drop. Matches are queued (the queue *is* the request-log table), a stateless worker evaluates each rule in order, then actions run and the result is saved (pass −14/−15) and downstream is notified.

**Why it is built this way (the parts worth knowing):**

- **Data model** — a small set of versioned `re.*` tables: `RE_Signatures`, `RE_Rules` and `RE_Policies` hold the config (shape, candidates, scope), while `RE_RequestLog` (which doubles as the queue and the dashboard), `RE_RunRuleResults`, `RE_RunRuleUnits` (die-level) and `RE_AuditLog` record what happened. Rule and signature settings are JSON on the row; eligibility criteria are indexed relational rows.
- **Versioning & audit** — editing a rule creates a *new version*; results reference the exact version that ran, so “why was this die failed in March?” is a plain database join. The audit log is write-once.
- **No silent failures** — every wafer event ends in a terminal state: processed, or skipped with a reason. The dashboard is a single query over the request log.
- **Operational plumbing** — the queue is the SQL request-log itself (persist = enqueue in one transaction); config can be cached in **Redis** (read-through, never the queue); every endpoint is secured with **Keycloak** (author / operator / viewer roles), and authorization decisions are themselves audited.

## 17.11 Worked example — Policy 7, end to end

Here is the design document’s golden example, “**Navitas WT clusters**” (Policy 7), which chains two rules of different modes:

- **Scope (eligibility):** Facility = NAV-01, Work Center = WT-01, Device ∈ {D100, D200}, Program = D100_PROBE, run on PAT output (probe sequences −2 automated, −5 manual).
- **Rule 42 (Cluster Size):** Detect Hard Bins [5, 7], minimum size 3 with diagonals → *Ink layer 1 to Hard Bin 90.*
- **Rule 43 (Cluster Pattern):** Detect Hard Bin [5], filtered to Probe Site 1, an L-shape saved as four pre-generated grids → *Output (re-bin) to Hard Bin 96.*

Policy 7 on wafer W-0455: two rules run in order; overlaps go to the first rule; the result is saved as pass −14.

**How to read this figure:** the “before” map shows the raw failures; “after” shows Rule 42’s two size-clusters with their inked rings (to bin 90) plus Rule 43’s single L-shape match re-binned (to bin 96). Because rules run in order, any die both rules claim is assigned by Rule 42 (first-rule-wins). The run drops yield from 91.20% to 89.60% and is saved as a new pass −14, leaving the originals untouched.

The companion wafer W-0456 carries Device D999, which is *not* in scope, so it ends as a **Skipped** row reading “Device=D999 not equal to D100” — visible on the dashboard, never silently dropped.

At a glance — reading a policy run

1. **Did the wafer match scope?** If not, expect a Skipped row with the reason.
2. **Which rules fired, in order** — and how many clusters/dies each claimed.
3. **Overlaps** — first rule in order owns any shared die.
4. **Pass code & yield** — −14 (auto) or −15 (manual); yield before → after.

## 17.12 Easy → hard: building your first three detections

Put it all together by building up, one step at a time:

- **Easy — “fail any knot of 3.”** One signature (Cluster Size, min 3, 8-way), one rule (Detect = All Fail Bins; Ink 1 layer of pass bins), one device-level policy. This is the fastest way to screen dense failure knots and their halos.
- **Medium — “hunt an L-shaped scratch of bin 5.”** A Cluster Pattern signature (draw the L; enable all rotations + both flips; pin to the notch), a rule (Detect Hard Bin [5]; Output/re-bin the match to a scratch bin), same policy. Now you catch a specific physical signature in every orientation.
- **Hard — “two rules, ordered, in a scoped policy.”** Combine the two rules above into one policy, put the pattern rule first so its exact matches win any overlap, scope the policy to a facility + work center + device list, set it to run automatically on PAT output, and add a policy Email. This is essentially Policy 7 — a production-grade detection.

## 17.13 How it fits the rest of yieldWerx

A cluster-detected wafer is a first-class citizen. **AMG** (Assembly Map Generation) can build an assembly map directly from one, using two new probing sequences — **−14 (PostCD)** and **−15 (MPostCD)** — exactly as it does from PrePAT/PostPAT/PostGDBN today. Assigning −14/−15 is a one-way door: once written they persist through the WAFER table and downstream and can never be repurposed, so every consumer (labels, wizards, SBL/SYL templates) must learn them in one coordinated change before the first CD wafer is saved. Other modules (PAT, GDBN, SWM) are slated to run *on* CD wafers and to be re-platformed *onto* the Rule Engine over time — AMG first. And the disabled **AI/ML** engine is the planned next step: a model scores each die’s confidence, adjacency groups the marks into clusters, and graded confidence maps to graded actions (high → fail, medium → downgrade, low → flag) — through the very same rule/action/audit machinery.

## 17.14 Field Notes 🧭

- Say the three words out loud until they stick: **signature = shape, rule = candidates + action, policy = scope + order.** Most confusion in this feature is putting a setting on the wrong one.
- Binning and layering live on the **rule**, not the signature — the signature is deliberately bin-agnostic so it can be reused.
- The notch angle is not decoration. Two wafers can look identical on screen yet carry different *physical* patterns; pinning the pattern to the notch is what makes matches physically meaningful.
- Inking only ever *lowers* yield — it fails good dies on purpose to protect quality (DPPM). The value is fewer field returns, so judge a CD policy by escapes prevented, not by the yield it costs.
- Cluster Detection never edits the original data; it writes a new pass (−14/−15). If a downstream screen shows the “raw” yield, it may be reading the pre-CD pass.

## 17.15 Jargon Decoded

- **Cluster Detection (CD):** failure-centric detection of failing-die groups on a wafer, with inking of surrounding dies.
- **Signature:** the reusable shape/size definition of a cluster.
- **Rule:** the candidates (bins), region (filters), attached signature, and actions (inking/output).
- **Policy:** a scoped, ordered collection of rules that writes one result.
- **Flood-fill / connected component:** growing a cluster outward from a failing die to all touching failing dies.
- **4-way / 8-way adjacency:** whether diagonal neighbors count as touching.
- **Inking / layering:** failing N rings of neighboring dies around a detected cluster.
- **Notch angle:** the pattern’s orientation relative to the wafer notch, so matches are physically consistent.
- **First-rule-wins:** when two rules claim a die, the earlier rule in execution order assigns it.
- **Pass −14 / −15:** the result codes CD writes — automatic (CD) and manual (MCD).
- **Rule Engine:** the shared, data-driven pipeline CD is the first module of.
- **Eligibility:** the fact-based gate (facility/device/program…) that selects a policy.

## 17.16 Acronyms

- **CD / MCD** — Cluster Detection (auto) / Manual Cluster Detection
- **GDBN** — Good Die, Bad Neighbor
- **DPPM** — Defective Parts Per Million
- **AMG** — Assembly Map Generation
- **HB / SB** — Hard Bin / Soft Bin
- **WS / FT** — Wafer Sort / Final Test
- **JSON** — the on-row config format for rules & signatures

## Global Trends & the Bigger Picture 📈

Two industry currents meet in this feature. First, **consolidation**: rather than a zoo of separately-coded screening modules, vendors are moving to a single *rule engine* where new detectors are configuration, not code — safer, versioned, auditable. Second, **AI-assisted wafer-map analytics**: deep-learning models now classify the classic spatial signatures (center, donut, edge-ring, scratch, and more) and flag good-die-bad-neighborhood escapes that hand-written rules miss. *For management:* failure-centric detection with clean audit is exactly what automotive and high-reliability customers ask for when they push DPPM targets. *For engineers:* the rule/signature/policy split means the ML engine, when it lands, plugs into the same actions and audit you already know.

## QA & Validation Playbook ✅

Cluster Detection is dense with checkable invariants — a rich QA surface. Verify **adjacency** both ways: 4-way must *not* join diagonal-only fails, 8-way must. Confirm **minimum count** boundaries (a group one below the threshold is not a cluster; one at it is). For patterns, test every **rotation and flip** you ticked, and prove the **notch angle** actually changes what matches. Check **first-rule-wins** by making two rules claim the same die and confirming the earlier one owns it. Verify **inking layers** fail exactly N rings and only the neighbors the mode allows (real pass flags, never “assume bin 1”). Confirm **originals are untouched** and the result is a new pass **−14/−15**, with **yield before/after** recorded. Prove **skips are terminal and named** (an out-of-scope wafer produces a Skipped row with the failing criterion, not a silent drop). Finally, exercise **versioning**: edit a rule, re-run, and confirm the old result still points at the old version. Golden habit: recompute cluster counts by hand on a small fixture and compare die-for-die.

## Did You Know? 💡

- **Cluster detection borrows a 50-year-old image-processing trick.** “Flood-fill with connected components” is the same algorithm behind the paint-bucket tool and counting blobs in microscope images — here it counts failing-die blobs on a wafer.
- **The eight canonical wafer patterns have names.** Researchers standardized wafer-map defects as Center, Donut, Edge-Loc, Edge-Ring, Loc, Near-Full, Scratch, and Random — the vocabulary modern ML classifiers are trained on, and the shapes a Pattern signature aims to catch.

## 17.17 Never Forget ⭐

1. **Signature = shape · Rule = candidates + action · Policy = scope + order.** Three words, whole feature.
2. **Three modes:** Cluster Size (adjacent, ≥ count), Cluster Pattern (exact shape, rotations/flips/notch), Cluster Matrix (density in a window).
3. **Bins and inking live on the rule**, not the signature.
4. **First-rule-wins** resolves overlaps; execution order matters.
5. **CD writes a new pass −14 (auto) / −15 (manual)** and never edits the originals.
6. **Nothing is silent:** every wafer is processed or skipped-with-a-reason, all versioned and audited.

## 17.18 Summary

Cluster Detection is yieldWerx’s failure-centric answer to GDBN: choose the failing bins that matter, find where they cluster, and ink the surrounding good dies to protect quality. It is built from three nested pieces — a **signature** (how a cluster looks), a **rule** (which bins are candidates, where to look, and how to ink), and a **policy** (which wafers, which rules, in what order). Signatures come in three modes: **Cluster Size** (adjacent failures via flood-fill, 4- or 8-way), **Cluster Pattern** (an exact drawn shape matched by sliding, with rotations, flips and notch alignment), and **Cluster Matrix** (density inside a sliding window). Rules add candidate bins, spatial filters and inking layers; policies add scope, ordering, first-rule-wins conflict resolution, and a result written as pass −14/−15 without touching the originals. Under the hood it is the first module of the yieldWerx **Rule Engine** — a data-driven, versioned, fully audited pipeline where new detectors are configuration, not code — and it already feeds AMG, with GDBN/PAT/SWM and an AI/ML engine on the roadmap.

## 17.19 Quiz — Chapter 17

**Q1.** In one sentence each, define signature, rule, and policy — and say which one carries the inking/layering settings.

**Answer.** *Signature* = how a cluster looks (shape/size); *rule* = which bins are candidates, where to look, and what to do (inking/output); *policy* = which wafers it runs on and in what order. Inking/layering lives on the **rule**, not the signature.

**Q2.** Three failing dies of the bin of interest sit on the wafer but none touches another. Under Cluster Size with min = 3, is this a cluster? What single setting could make a diagonal-only arrangement qualify?

**Answer.** No — Cluster Size needs the failures to be *adjacent*; three isolated fails are three components of one, all below 3. Turning on **8-way adjacency (IncludeDiagonal)** lets diagonal touches join dies into one component.

**Q3.** Which detection mode counts failures in a window regardless of shape or adjacency, and which matches an exact drawn shape? Name the key inputs of each.

**Answer.** **Cluster Matrix** counts density — inputs: window rows × columns and minimum failures. **Cluster Pattern** matches an exact shape — inputs: the drawn grid, enabled rotations/flips, notch angle, and overlap behavior.

**Q4.** Why does the notch angle matter for pattern detection? What can go wrong if you ignore it?

**Answer.** The notch angle pins the pattern to the wafer’s physical orientation. Two wafers can look identical on screen yet carry different physical patterns; without notch alignment you either miss real matches or match different physical defects as if they were the same. Pinning to the notch (0/90/180/270°) makes matches physically meaningful.

**Q5.** Two rules in a policy both mark the same die. Which rule assigns its ink bin, and why is this behavior valuable?

**Answer.** The **first rule in execution order** (first-rule-wins). It makes results deterministic and explainable — order the rules deliberately (put the more specific pattern rule first if it should own overlaps).

**Q6.** A wafer arrives whose device is not in any policy’s scope. What happens to it, and where can you see the outcome?

**Answer.** It ends in a terminal **Skipped** row naming the failing criterion (e.g. “Device=D999 not equal to D100”), visible on the dashboard. It is never silently dropped — every wafer event ends in a recorded state.

**Q7.** After a CD run, an engineer opens the original wafer map and sees the pre-CD yield. Is that a bug? What passes does CD write and what happens to the originals?

**Answer.** Not a bug. CD never modifies the originals — it writes a *new* result pass, **−14** (automatic) or **−15** (manual). The pre-CD pass still shows the original yield; the post-CD yield lives on the new pass.

**Q8.** Cluster Detection is “the first module of the Rule Engine.” Give two concrete benefits of that architecture for changing detection behavior and for explaining past results.

**Answer.** (i) *Change behavior without code* — rules/signatures/eligibility/actions are screen-edited data that take effect without a deployment, and a new module is rows + providers, not a rewrite. (ii) *Explain any past result* — rules and signatures are versioned and results reference the exact version that ran, with a write-once audit log, so “why was this die failed in March?” is a plain database join.
