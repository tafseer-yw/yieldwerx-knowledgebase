---
id: handbook-third-sec-ch13
title: "Chapter 13 — AMG, LG & Dashboards: Maps, Family Trees, and the Big Screen"
source_id: handbook-third-html
source_section: sec-ch13
edition: 3
status: current
confidentiality: internal
generated: true
---
Part IV · The Analytics Modules

# Chapter 13 — AMG, LG & Dashboards: Maps, Family Trees, and the Big Screen

## 13.1 AMG — telling the factory which dies to pick

After Wafer Sort (and PAT, and SWM), somebody must tell the assembly machine *which of the 15,000+ dies on this wafer to actually package*. **AMG (Assembly Map Generation)** produces that instruction file — the **pick-and-place map**. The policy defines which bins to include (typically Bin 1 plus configured grade bins), output format, and output path. Two formats matter: **JCAP** (ASCII text, for JCap machines) and **MPS** (binary “InkMap”). Generation is automatic post-upload (Broker-triggered) or manual (UI re-generation), with status tracked through Pending/Processing/Complete/Failed.

The name “InkMap” is a fossil: factories once physically dotted bad dies with ink; the digital map replaced the ink dot.

**The ordering imperative (once more, because it’s the one that ships disasters):** AMG must consume **post-PAT, post-SWM** bins. If it reads earlier bins, statistically/spatially suspect dies get packaged and shipped. The stock validation: AMG’s included-die count must equal the *current* Bin 1 count in BIN_SUMMARY. Also test the degenerate case — a wafer with zero passing dies must yield an empty map or clean error, not a crash.

## 13.2 LG — the family tree

**LG (Lot Genealogy)** maintains lineage links across stages: WS lot → assembly lot(s) → FT lot(s). Chapter 3 showed why: lots *split* at assembly, so without deliberate linkage the family tree is lost — and with it, all cross-stage analysis (cross-stage yield loss, GDBNZ, RMA tracebacks, recall scoping).

Mechanics: when an FT lot loads (`Facility_Type='F'`), the Broker triggers the LG engine, which applies an **LG policy** — matching rules over key fields (lot-ID prefixes, part numbers, wafer IDs) — to find the WS parent. Match → `LotGenealogy` record + dashboard “linked.” No match → warning logged, lot shows **“Unlinked.”** Unlinked FT lots are silent traceability holes; the orphan-hunt query (FT lots with no genealogy record) is a standing health check. Re-uploading the same FT lot must not create duplicate links.

The lot family tree that LG rebuilds

The lot family tree that LG rebuilds

**How to read this figure:** one Wafer Sort lot (top) splits at assembly into three assembly lots, each spawning a Final Test lot. The split is a physical fact of manufacturing; the *links* are not recorded anywhere by default — LG re-establishes them by key matching when each FT lot arrives. Trace any failure upward to its origin wafers, or any suspect wafer downward to every affected shipment. Every green box must connect to the tree; an unlinked one is a traceability hole.

Business framing: traceability is often a *contractual and regulatory* requirement (especially automotive). LG isn’t a nice-to-have report feature; it’s what makes recall scoping possible — “which shipments contain material from suspect wafer lot X?”

## 13.3 Dashboard, scheduled reports, and Power BI

The **web dashboard** is the aggregation surface: recent uploads and statuses, yield trends, and each module’s alerts (PAT fails, SWM flags, SPC violations, GDBN status, SBYL holds), plus saved filter sets (“Favourites”). Each tile is fed by that module’s tables — meaning dashboard validation is cross-checking tiles against the source tables you now know.

**AutomaticReportGeneration** runs scheduled reports per `AutomateReportPolicy` (type, schedule, recipients, format) — validate the trinity: right time, right data, right recipients.

**Power BI** connects *directly to SQL Server through dedicated* `V_BI_*` *views* — no API layer in between. Views cover bins, lots, wafer-level yield, PAT results, parametric failures, FT yield, SBYL. QA implication: view output must equal direct table queries; and because the views bypass the application layer entirely, application-layer fixes don’t automatically fix Power BI numbers — a subtle divergence class (“web says 84%, Power BI says 83.2%”) usually rooted in view definitions, filters, or timing.

## 13.4 Field Notes 🧭

- AMG is where yieldWerx stops being “analytics” and becomes an actor in the *physical* factory — its output file drives a machine. Wrong map = wrong dies picked = defective product shipped. Treat AMG defects as top severity.
- Wrong *format* selection (JCAP vs MPS) doesn’t degrade gracefully — the assembly machine simply can’t read the file. Integration testing with format fixtures matters.
- LG matching is policy/key-based, so its failure modes are mostly *data quality* (inconsistent lot-naming between facilities) rather than code. Expect “unlinked” investigations to end in naming-convention conversations — and PRD opportunities for fuzzier matching.
- The dashboard is most users’ entire experience of the platform. A stale or wrong tile erodes trust in modules that are actually working fine underneath.

## 13.5 Jargon Decoded

- **Pick-and-place map:** file telling assembly machines which die positions to pick.
- **InkMap:** legacy term from physically inking bad dies; now the binary MPS map format.
- **Orphan / unlinked lot:** an FT lot with no genealogy parent.
- **Enrichment data:** extra attributes attached to genealogy links.
- **Favourites:** saved dashboard filter configurations.
- **View (SQL):** stored query exposed as a virtual table (`V_BI_*` for Power BI).

## 13.6 Acronyms

- **AMG** — Assembly Map Generation
- **LG** — Lot Genealogy
- **JCAP / MPS** — the ASCII / binary assembly-map formats
- **BI** — Business Intelligence (Power BI)

## Global Trends & the Bigger Picture 📈

Traceability is becoming a regulatory and contractual requirement, not a nicety — automotive quality standards and the **chiplet era’s provenance problem** (which die from which wafer ended up in which package?) both demand end-to-end lineage. Industry interest in **digital-twin and full recall-analytics** capabilities is rising for exactly this reason. *For management:* lot genealogy is what makes recall scoping and customer-quality guarantees possible, directly limiting liability and protecting the brand. *For engineers:* AMG is where analytics becomes a *physical actuator* — its output file drives a machine — so its correctness sits at the top of the severity scale.

## Bug-Hunting, Security & Hardening Tips 🐞

AMG defects ship bad silicon, so treat them as top severity. Assert the **PAT/SWM-before-AMG ordering** (AMG’s included-die count must equal the *current* Bin 1 count). Test **output-file format integrity** (JCAP vs MPS) — a wrong format doesn’t degrade gracefully, the assembly machine simply can’t read it. Handle the **zero-passing-dies edge case** (empty map or clean error, never a crash). For LG, hunt **orphan/unlinked FT lots** and confirm **re-uploading an FT lot does not create duplicate links**. Probe **path handling on configured output paths** for traversal or overwrite risks. And verify **Power BI views match direct table queries**, since the views bypass the application layer entirely.

## Did You Know? 💡

- **“InkMap” remembers a time dies were dotted with ink.** Before digital maps, testers physically marked bad dies with a dot of ink so assembly would skip them. The binary assembly-map format is still called an *InkMap* — a fossil word for a step that no longer uses ink.
- **“Genealogy” is borrowed straight from family trees.** Lot Genealogy treats wafers and lots exactly like ancestors and descendants — parents split into children at assembly — so a field failure can be traced to its “birth” wafer, and a bad wafer forward to all its “offspring” shipments.

## 13.7 Never Forget ⭐

1. **AMG consumes post-PAT/post-SWM bins** — its die count must equal current Bin 1. Ordering bugs here ship bad silicon.
2. **Every FT lot must have a WS parent via LG.** Orphans = broken traceability; hunt them proactively.
3. **Power BI reads views directly** — no API layer; validate views against tables separately from the web app.
4. AMG output is a *machine instruction file* — existence, format, and content at the configured path are all testable facts.
5. Duplicate-prevention on FT re-upload is an explicit LG requirement.

## 13.8 Summary

AMG turns final bin assignments into machine-readable pick-and-place maps (JCAP/MPS), making analytics physically actionable — and making PAT/SWM-before-AMG ordering safety-critical. LG reconstructs the lot family tree as FT data arrives, enabling all cross-stage analysis and contractual traceability, with unlinked lots as its key failure signal. The dashboard aggregates every module’s outputs, scheduled reporting automates delivery, and Power BI taps dedicated database views directly — each surface carrying its own distinct validation obligations.

## 13.9 Quiz — Chapter 13

**Q1.** AMG’s generated map includes 14,700 dies; BIN_SUMMARY currently shows Bin 1 = 14,650. Investigation shows PAT ran before AMG, but SWM ran *after* AMG. Explain the discrepancy, the risk, and the fix.

**Answer.** AMG generated its map from pre-SWM bins (14,700 good); SWM then re-binned 50 spatially suspect dies out of Bin 1 (now 14,650). The map still instructs assembly to pick those 50 suspect dies — the exact outcome SWM exists to prevent. Fix: enforce PAT/SWM-before-AMG ordering, regenerate the map, and verify AMG’s included count equals current Bin 1 exactly.

**Q2.** Why is an “unlinked” FT lot worse than it sounds? Name two analyses it silently breaks.

**Answer.** It silently severs traceability: cross-stage yield-loss analysis (can’t compare WS→FT), GDBNZ (no linkage to compare counts), and — worst — RMA/recall scoping (a field failure can’t be traced to origin wafers).

**Q3.** Web dashboard yield and Power BI yield disagree for the same lot. List three investigation angles unique to how Power BI is wired.

**Answer.** (i) `V_BI_*` view definitions (joins/filters may differ from app logic); (ii) no application layer — app-side fixes/filters don’t apply to Power BI; (iii) timing — the view reads current tables, the dashboard tile may cache or vice versa. Compare view output to direct table queries first.

**Q4.** What must QA verify about a *scheduled* report beyond its data being correct?

**Answer.** Delivery trinity: generated at the configured time, delivered to configured recipients, in the configured format — plus that the schedule policy row (`AutomateReportPolicy`) actually drives it.

**Q5.** A wafer has zero passing dies. What’s the correct AMG behavior, and why is this worth an explicit test case?

**Answer.** Empty map or clean, logged error — never a crash or a malformed file an assembly machine might misread. Degenerate inputs at a machine interface are exactly where crashes become production incidents.

**Q6.** Which two earlier modules must complete before AMG for its output to be trustworthy, and what does each contribute?

**Answer.** PAT (removes statistical mavericks from Bin 1) and SWM (removes spatially suspect dies). AMG’s map is only as good as the final bins it reads.
