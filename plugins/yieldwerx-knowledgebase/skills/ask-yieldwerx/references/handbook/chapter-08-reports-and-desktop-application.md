---
id: handbook-third-sec-ch8
title: "Chapter 8 — Reports, the Desktop Application & the Report Catalog"
source_id: handbook-third-html
source_section: sec-ch8
edition: 3
status: current
confidentiality: internal
generated: true
---
Part III · Inside the Platform

# Chapter 8 — Reports, the Desktop Application & the Report Catalog

*Reports are where all the upstream machinery — parsing, binning, limits, analytics — finally becomes something a human reads and acts on. For most people at the company, a report **is** yieldWerx: it is the surface they see, the number they trust, and the deliverable they send. This chapter walks the full path: the two apps, the one workflow every desktop report shares, the specific report families and their options, how you drill down and share and automate them, and how you validate that every number is true.*

## 8.1 Two apps, two jobs

yieldWerx ships a **web app** and a **desktop app**, and the split is deliberate: the **web app** is for *configuration and live monitoring* (module policies, dashboards, real-time SPC), while the **WinForms desktop app** is for *heavy report generation* — complex multi-chart PDF/Excel reports the web UI can’t handle. Both talk to the same database. Yield engineers live in the desktop app when producing deliverable reports; you will too when validating them.

## 8.2 The one workflow every desktop report shares

Almost every report in the desktop app follows the **same five-step rhythm**. Learn it once and every report family below feels familiar:

1. **Click the report’s icon** (Bin Pareto, Parametric Histogram, XY Scatter, …). This opens that report’s **Selection Criteria** window.
2. **Pick your data.** Choose a **Favorite** (a saved selection — e.g. a “Small Data Set”) or drill the tree manually: Facility → Work Center → Device Name → Test Program → Lot → Wafer → (for parametric) Parameter. The facility level is where the crucial **WS vs FT** distinction is made.
3. **Set the report options** — the knobs that shape the chart. The common ones recur everywhere: **Group By** (Wafer, Site, Lot, Device Name, Test Program, Wafer Group, Zone, Mode…), **Bin Type** (Hard Bin / Soft Bin), **Specify Bins** (All / Failed Bins Only / Custom), **Filter Data By**, **Chart Plotting Options** (e.g. Side by Side), **Color Scheme**, and **Specify Dies**.
4. **Execute.** The result opens first in **Gallery view** — a grid of thumbnail charts (one per wafer/group) with tabs for **Chart**, **Data**, and **Legend** above them.
5. **Zoom in.** Click the **Zoom-In** button on any thumbnail to open the full-size **Zoom-In window (dialog)**, where the detailed statistics tables live and where you can launch *inner reports* (§8.6).

**QA lens:** the header banner produced on Execute is itself a validation target. A Bin Pareto header, for example, reports `Lot ID`, `No. of Wafers`, `Total Sublots`, `Average Yield`, `Total Unique Dies`, and `Pass Count` — every one of which must reconcile to the database for the selected scope before you trust a single bar on the chart.

## 8.3 Bin Summary & Bin Pareto — the bread and butter

The most fundamental report: for selected lots/wafers, how many dies per bin, with percentages, colors (from `USER_BIN_DEFINITION`), and a yield column. Generating one: Reports → Bin Summary → pick Facility Type (WS or FT) → FAB → Lot(s) → Wafer(s) → Soft or Hard bin display → Generate → export PDF/Excel.

Its validation points are pure Chapter 4: report yield must equal `WAFER.Yield`; report total = `Part_Count`; each bin’s count = `BIN_SUMMARY.Part_Count`; and — the classic — **run it before and after PAT, and the Bin 1 drop must equal the PAT fail count.**

**Naming caution — “Bin Pareto,” not “Bin Histogram.”** The report that ranks bins was *renamed* from *Bin Histogram* to **Bin Pareto**, and the change was more than cosmetic: a true Pareto adds a **cumulative representation** — bars sorted biggest-first with a running **cumulative % line** overlaid, so the largest yield-loss category is attacked first. You will still meet older screenshots, tooltips, and even an icon that say “Bin Histogram”; treat any surviving “Histogram” label on the *bin* report as a defect to log, not a second report type. Its options include **Group By**, **Bin Type**, **Specify Bins**, **X-Axis Label** (Bin Number / Bin Name), **Sort By** (Bin Number / Bin Occurrence), **Color Scheme**, **Tooltip Options**, **Chart Plotting Options**, and a **Cumulative %** mode (Default / Line / Breakpoint).

Bin Pareto Report — fail bins ranked largest-first with a cumulative-% line.

**How to read this figure:** the bars are failure bins sorted biggest-first (left to right), read against the left axis (die count). The navy line and its labels read against the right axis (cumulative %): the first two bins already account for ~58% of all loss, so that is where engineering effort goes first. The cumulative line is exactly what the Bin *Pareto* adds over the old Bin Histogram.

At a glance — check these first, in order

1. **The leftmost bar** — that is your #1 yield-loss bin; attack it first.
2. **The cumulative line** — how few bins make up ~80% of loss (the “vital few”).
3. **Which fail bin it is** — a known failure mode, or a surprise worth investigating?
4. **The header totals** — pass count, average yield, total dies reconcile to expectation.

## 8.4 Parametric reports — histograms, trends, scatter, and box plots

These visualize the *numeric* test data. All four share the parametric Selection Criteria (down to the **Parameter** level) and the Gallery→Zoom-In rhythm; each answers a different question.

**Parametric Histogram — “what shape is this measurement?”** Distribution of one parameter across dies, with spec-limit lines overlaid; your Chapter 5 shape-reading applies directly (bell = healthy; bimodal = mixed populations; hugging a limit = a capability problem). Its own controls are worth knowing:

- **Class Type & number of classes** — the histogram’s bin count. Choose *Automatic* or *User Defined* and enter a class count (e.g. 10), with an option to *include points out of range in the end classes*. Wrong class counts are a common “the histogram looks weird” complaint that is really a settings issue.
- **Zoom-In statistics** — the dialog shows a **Distribution Statistics** table (mean, std dev, and the **Lo Limit / Hi Limit**) and a **Limit-Based Statistics** table including **% Fallout** (the share of dies outside the limits). Validate that Lo/Hi Limit and % Fallout are placed correctly and computed against the *active* limits.
- **Cp / Cpk** — computed from `TEST_SUMMARY.Mean/StdDev` exactly as in Chapter 5; recompute manually when validating. When grouping by **Wafer/Mode** and a group spans more than one mode, the report correctly shows **“Multiple”** instead of a single Cp/Cpk value.

Parametric Histogram Report — one parameter’s distribution with spec limits and stats.

**How to read this figure:** each bar is the count of dies whose measurement falls in that class (bin width). The red dashed lines are the low and high spec limits (LSL/USL); the navy curve is the fitted normal. The stats box carries Mean, StdDev, Cpk, and % Fallout. The small second hump pressed against the low limit is a mixed population — the classic bimodal shape from Chapter 5.

At a glance — check these first, in order

1. **Shape first** — one clean bell (healthy), two humps (mixed populations), or a wall against a limit (capability problem).
2. **Position vs the red LSL/USL lines** — is it centred, or leaning on one limit?
3. **The stats box** — Cpk (≥ 1.33 is the production bar) and % Fallout.
4. **Bars past the limits** — that is your quantified fallout.

**Parametric Trend — “is this measurement drifting?”** A metric (Mean, Median, Min, Max, or Cpk) per wafer/lot plotted over time, with control limits, so drift becomes visible. It adds a **Plot By** control alongside Group By, and a **PAT-limits** overlay that is *only* enabled for the **Zone** and **Mode** Group-By modes (and disabled when driven purely from the selection criteria) — a deliberate rule, and a good negative-test target.

Parametric Trend Report — a metric per wafer over time, with control limits.

**How to read this figure:** each point is one wafer’s mean of the parameter, plotted in time order. The solid line is the center line; the red dashed lines are the upper/lower control limits (UCL/LCL). The last wafers drift upward and the red points cross the UCL — a drift the naked eye would miss without the limit lines.

At a glance — check these first, in order

1. **Direction first** — flat, or sloping? A slope means the mean is drifting.
2. **Red points on/over the UCL/LCL** — those are the control alarms.
3. **Where in time the drift starts** — line it up with a tool or process change.
4. **Spread around the centre line** — is the variation tightening or widening?

**XY Scatter — “do two measurements move together?”** Plots one parameter against another to expose correlation, with optional **r and r²** coefficients, a **Union / Intersection** die-set control, and **Specify Dies** selection. A “Passed Dies Data” grid lists exactly the dies selected — its row count must equal the number of dies specified (a clean, checkable invariant).

XY Scatter Report — one parameter against another, with r / r².

**How to read this figure:** each dot is a single die positioned by its two parameter values. The magenta line is the best fit; the r and r² box quantifies how tightly they move together (here r² ≈ 0.72, a strong positive correlation). Scatter that hugs the line means the two measurements are related; a shapeless cloud would mean they are not.

At a glance — check these first, in order

1. **The r / r² box first** — strong (near 1) or weak (near 0) relationship?
2. **Cloud shape** — a tight line means related; a shapeless blob means not.
3. **The slope** — positive or negative correlation.
4. **Points off the trend** — outlier dies that break the relationship.

**Box Plot — “which group is misbehaving?”** Side-by-side distribution summaries (median, quartiles, outliers) across wafers, lots, sites, or devices — ideal for spotting a single misbehaving tester head or site at a glance.

Box Plot Report — distributions compared side by side across groups.

**How to read this figure:** each box spans the middle 50% of dies for that group (the interquartile range); the navy line is the median and the dots are outliers. Comparing sites at a glance, Site 4 sits clearly higher than the rest — a single misbehaving tester site standing out from an otherwise consistent population.

At a glance — check these first, in order

1. **Compare the medians** (navy lines) across groups — which sits high or low?
2. **Box heights** — the tallest box is the most variable group.
3. **The odd one out** — a shifted or stretched box is a misbehaving site/tester.
4. **Outlier dots** — a cluster of them flags a group-level problem.

Key validation subtleties across all parametric reports: if CLM is active, reports must show **CLM limits, not ATE limits**; functional (FTR) parameters must be excluded; and each trend point must correspond to exactly one wafer/lot in the selected range.

## 8.5 Wafer maps — seeing the failure geography

A **wafer map** draws every die at its X/Y position, colored by bin (soft or hard) or by measured value (**parametric heat map**). Variants: SWM overlay (original vs re-binned dies), and **stacked maps** (multiple wafers aligned to expose common spatial patterns — if 20 wafers all fail at the same map position, suspect the probe card or a reticle defect).

Validation: click any die on the map — its values must match the dynamic-table data exactly. The map is only as truthful as the coordinates loaded from PRR records.

Soft-Bin Wafer Map — every die drawn at its X/Y position, colored by bin.

**How to read this figure:** each square is one die at its true wafer coordinate, colored by bin. The red ring around the edge is a classic edge-fail signature; the orange diagonal is a handling scratch; scattered yellow are random fails; green is Bin 1. Spatial patterns like these are invisible in a bin table but obvious on the map.

At a glance — check these first, in order

1. **The pattern first** — edge ring, centre blob, diagonal scratch, or random speckle; each has a different cause.
2. **Where fails concentrate** — edge (handling/process) vs centre (litho/process).
3. **Organised vs random** — organised patterns are the systematic, fixable ones.
4. **Which bin dominates** the pattern — check it against the legend.

Parametric Heat Map — the same wafer colored by a measured value on a gradient.

**How to read this figure:** instead of bins, each die is colored by its actual measurement (here VDD_Core), so gradients and hot-spots appear. The bright center hot-spot and the left-to-right gradient point to a process non-uniformity — a story a pass/fail map cannot tell.

At a glance — check these first, in order

1. **Gradient direction** — uniform colour (good) vs a left-right or centre-edge gradient (non-uniformity).
2. **Hot / cold spots** — localised extremes on the colour scale.
3. **Any zone near a limit** — compare the scale to the spec.
4. **Radial vs linear** pattern — points to a chamber vs a scan/tool issue.

## 8.6 Inner reports — drilling from one chart into another

The single most powerful — and least obvious — feature of the parametric reports is the **inner report**. From the Zoom-In window you can select a die (or all dies) and immediately launch a *different* report on exactly that selection, without going back to Selection Criteria. From a Parametric Histogram or Parametric Trend zoom-in you can open, as inner reports:

- **Parametric Wafer Map** — see *where* on the wafer the dies in this distribution sit.
- **Parametric Trend** and **Parametric Histogram** — pivot the same dies into the other view.
- **Data Extraction** and **Data Summary** — drop to the underlying numbers.
- **XY Scatter** and **Box Plot** — correlate or compare the selected population.

This drill-down is how an engineer goes from “this distribution is bimodal” to “…and the second hump is all edge dies” in two clicks. It is also a rich QA surface: the selection *context must carry through* — the inner report must operate on precisely the dies selected, not the whole wafer. Note one deliberate exclusion: **XY Scatter does *not* appear in the inner reports of the Parametric Histogram** — a documented rule, not a bug.

## 8.7 Data & genealogy reports

- **Data Summary** — a consolidated, gallery-viewable summary of a selection (yields, counts, key stats); the everyday “what am I looking at” report, and a common Setup-Auto-Run target.
- **Lot Summary / Wafer Detail** — consolidated lot lists with yields; per-wafer drill-down including equipment and CLM/PAT flags.
- **Raw Data / Data Extraction Report** — die-level export of actual measured values; the heaviest report (reads dynamic tables). QA should probe its limits: one parameter/one wafer versus all parameters/full lot — watch for timeouts and memory.
- **Wafer-to-Unit Traceability** — from a WS lot, the tree of assembly lots and FT lots derived from it (requires LG configured and run).
- **Cross-Stage Yield Loss** — good counts stage by stage: e.g., 20,000 dies → 16,000 WS Bin 1 (80%) → 15,800 survive assembly → 15,600 FT Bin 1 (98.7% FT yield). Instantly localizes *where* dies are being lost. Sanity invariant: **you can never gain dies at a later stage.**
- **Upload History** — every file processed, with status; every “Success” must have corresponding LOT/WAFER rows.

Cross-Stage Yield Loss Report — good-die accounting from WS to FT.

**How to read this figure:** the tall bar is dies probed; each later bar is how many good dies remain at the next stage, with the red segment showing what was lost between stages. It localizes loss instantly — most is lost at Wafer Sort here, little at assembly. The invariant: counts can only shrink downstream; a taller later bar would be a data bug.

At a glance — check these first, in order

1. **The biggest red segment** — that stage is where most dies are lost.
2. **First bar vs last bar** — overall survival from probe to FT Bin 1.
3. **The assembly drop specifically** — isolates packaging problems from fab.
4. **Any bar taller than the one before it** — impossible; investigate as a join/double-count bug.

## 8.8 Sharing & automating reports — Export, Email, Print, and Auto Run

A generated report is rarely the finish line — it has to leave the app. The desktop app offers four exits, and each is its own QA surface:

- **Export** — from the Export dropdown above the chart, save to **Excel**, **PDF**, or **Web**, with thumbnail toggles to **Include Legend** and **Include Data** (and, for histograms, options like *1 Parameter Per Sheet*). The golden rule: numbers in the exported file must match the on-screen chart and the database *exactly*, across locales and large datasets.
- **Email Data Files** — send the report straight from the app; the “To” field accepts multiple addresses separated by `;`, plus a message body.
- **Print** — print the chart and the data grid, with a print-preview step.
- **Setup Auto Run (SAR) & Report Policies** — the automation layer, so engineers don’t regenerate the same report by hand. This requires the **Report Generation Service** to be installed. From Gallery view you click **Setup Auto Run**, name the run, set run/format options, a destination type and output path, and a historical date/time frame. For reusable, shareable automation you attach a **Report Policy** (Public or Private) carrying test-parameter filters, yield filters, filename format, splitter, and a collision rule (*overwrite / rename old / create new / error out*). Saved runs and policies are then executed and audited from **Admin Utilities → Report Generation Manager** (“Manage auto-generated report setups” and “Manage report policy setups”), where a **View Report Policy Log** shows status and a link to the finished report.

## 8.9 Chart, Report & Tooltip options — and why persistence matters

Once a chart is on screen, three option panels reshape it live — and each is a favorite hiding place for bugs.

- **Report Options** (top-left of the executed chart) re-drive the data view without re-querying from scratch: change Group By, Bin Type, Specify Bins, X-Axis Label, Sort By, or Color Scheme, then **Reset** to defaults.
- **Chart Options** restyle the visualization: display as **3D**, scrollbars inside, show/hide axis labels, **bar width** and **bar style** (Default, Emboss, Cylinder, Wedge, Light-to-Dark), **chart skin**, **Y-/X-axis scale breaks** with a threshold value, and axis font/label-angle. A dedicated **Reset** restores defaults.
- **Point Labels** place values on each bar/point: die count, die percentage, both, Bin Number, or Bin Name.
- **Tooltip Options** control the hover card. Its *default* tooltip carries **Lot ID, Wafer ID, Device Name, Test Program, Bin, Die count, and Percentage**; information already printed in the report body is intentionally disabled in the tooltip to avoid duplication, and the set is user-editable.

**Persistence is the subtle requirement.** Chart-Option changes made in Gallery view must *survive re-execution* — if a user tweaks bar style and scale breaks, then adds another wafer or parameter and runs again, those choices must persist rather than silently resetting. Persistence (and correct Reset behavior) is exactly the kind of state bug that slips through casual testing, so it is called out as its own test obligation.

## 8.10 The yieldWerx Report Catalog — the full picture

The sections above cover the reports you will touch most, but the Desktop Application (and the Reporting & Analysis module) ships **over 300 standard reports** generated automatically — so engineers rarely write scripts or probe the database by hand. It helps to see them grouped by the *question each family answers* rather than as a flat list. Every report is filterable by FAB, device, lot, wafer, test program, date range, and facility type (WS/FT), and virtually all export to Excel and PDF.

**Yield reporting family — “How much are we getting, and is it moving?”**

- **Yield Summary / Yield Trend** — yield rolled up by device, FAB, work center, week, or month, and plotted over time. The headline management report: it answers “are we hitting target, and which direction are we heading?” Business metric: **yield % vs target**, with alerting when a lot or trend crosses a threshold.
- **Bin Summary & Bin Trend** — per-bin counts and percentages for selected lots/wafers, and how that distribution shifts lot-to-lot. Answers “how many good dies, and *what did the rest fail for?*” Business metric: **Bin 1 yield** plus the **failure Pareto** (which fail bin dominates).
- **Bin Pareto** — fail bins ranked biggest-first with a cumulative-% line, so the largest yield-loss category is attacked first. Business metric: **% of loss per bin**.

Yield Trend Report — weekly Bin-1 yield tracked against target.

**How to read this figure:** each point is a week’s Bin-1 yield; the red dashed line is the target. The shaded band marks weeks below target — a multi-week excursion the exec-level view surfaces at a glance, tying the number to a target and a direction.

At a glance — check these first, in order

1. **Latest point vs the target line** — above or below? That is the headline.
2. **Direction of the last few weeks** — recovering or worsening.
3. **The shaded below-target band** — how long the excursion lasted.
4. **One-off dip vs sustained slide** — noise versus a real problem.

**Spatial / wafer-map family — “*Where* on the wafer are we losing dies?”**

- **Soft-Bin & Hard-Bin Wafer Maps** — every die drawn at its X/Y position, colored by bin. Reveals edge rings, clusters, and scratches at a glance (the SWM patterns of Chapter 11).
- **Parametric Heat Map** — the same map colored by a measured *value* on a gradient, exposing gradients and hot spots across the wafer.
- **Composite / Stacked Bin-Pattern Map** — many wafers (even hundreds) aligned and overlaid so a *repeating* spatial signature jumps out; a fixed-position failure across wafers points to a probe card or reticle defect. Business metric: **spatial-signature prevalence** across a population.
- **Wafer-Zone Analysis** — yield and parametrics compared across wafer zones (center vs edge rings), because failure and drift are often position-dependent.

**Parametric family — “Are the *measurements* healthy?”**

- **Histogram** — the distribution of one parameter across dies, with spec-limit lines; a bell shape is healthy, bimodal means two mixed populations (Chapter 5).
- **Parametric Trend** — a metric (mean, median, min, max, or Cpk) per wafer/lot over time, with control limits — the drift detector.
- **XY Scatter** — one parameter against another with r/r² correlation — the “do these move together?” report.
- **Box Plot** — distribution summaries (median, quartiles, outliers) compared side by side across wafers, lots, sites, or devices — ideal for spotting a misbehaving tester head or site.
- **Parametric Fail Report** — which parametric tests are failing and by how much, for reliability qualification and monitoring. Business metric: **Cpk / Cp** (process capability) and **parametric fail rate** per test.

**Traceability family — “Where did this material come from and go?”**

- **Lot Summary / Wafer Detail / Raw Data** — consolidated lists down to die-level exports (see 8.7).
- **Wafer-to-Unit Traceability** and **Cross-Stage Yield Loss** — the genealogy tree and stage-by-stage die accounting (see 8.7). Business metric: **assembly yield loss** and **cross-stage die-loss %**.

**Operational family — “Is the platform itself healthy?”**

- **Upload History** — every file processed with status; the audit that every “Success” produced real LOT/WAFER rows.
- **Module dashboards** — PAT, SWM, GDBN, SBYL, SPC status roll-ups (Chapter 13’s dashboard).

## 8.11 Reading the numbers that matter — key business metrics

Reports are only useful if the reader knows which number to watch. The metrics below recur across the catalog and are the shared language between the engineering floor and the boardroom:

- **Yield %** — Good ÷ tested × 100. The headline. Tracked against a **yield target**; a miss triggers investigation.
- **Cost per good die** — wafer cost ÷ good dies. The metric management actually optimizes (Chapter 1); a report showing yield without cost context under-tells the story.
- **Cpk / Cp (process capability)** — how comfortably a parameter fits its spec limits (Chapter 5); **Cpk ≥ 1.33** is the usual production bar. The leading indicator that a parameter is drifting toward loss.
- **Bin Pareto / failure mix** — which failure categories dominate; it directs where engineering effort is spent.
- **Assembly / cross-stage yield loss** — the fraction of good Wafer-Sort dies lost by Final Test; isolates packaging problems from fab problems.
- **PAT / SWM fail rate** — how many otherwise-passing dies were screened as outliers; a rising rate flags a sick process (Chapters 10–11).
- **SPC violation count** — process-control alarms over a window; the predictive early-warning tally (Chapter 12).
- **First-pass yield vs final yield (after retest)** — how much yield depends on retesting, a quality and cost signal.

A well-designed report ties a **metric** to a **target** and a **trend**: the number, the line it must stay above, and where it is heading. That triad is what lets a one-page view serve a line engineer and a VP at the same time.

## 8.12 Beyond standard reports — statistical analytics

When a standard report shows *that* yield dropped but not *why*, engineers reach for yieldWerx’s built-in statistical toolset. These turn the platform from a reporting tool into a root-cause engine, and they are a major part of its value story:

- **Commonality Analysis (CA)** — the workhorse of root-cause. It mines genealogy and history data to find the manufacturing variable *common to the failures* — a specific tester, probe card, reticle, chamber, time window, or wafer zone. It uses **Association Rules** (support × confidence ranking) for discrete good/bad problems and **ANOVA** for parametric variations. CA narrows a haystack of possibilities to a short list of suspects, which engineers then confirm with focused experiments. It is prone to false positives/negatives, so it is a *starting point*, not a verdict.
- **ANOVA (Analysis of Variance)** — decomposes a parameter’s variation into contributions from different sources (which wafer, which machine, which layer), pinpointing where variation enters. The go-to when the loss is *parametric* rather than pass/fail.
- **Equipment Commonality** — ANOVA run automatically at regular lot/time intervals across tools and layers to catch equipment that is systematically underperforming — a standing SPC-style monitor in modern fabs.
- **Correlation & T-Tests** — quantify whether two parameters move together, or whether two groups (two lots, two sites, before/after a change) differ significantly. The evidence base for “did this change actually help?”
- **DOE (Design of Experiments)** — structured experiments that vary factors deliberately to find which settings drive yield — the disciplined alternative to one-variable-at-a-time guessing.
- **PCA (Principal Component Analysis)** — collapses many correlated parameters into a few underlying dimensions, making high-dimensional test data visualizable and surfacing hidden structure.
- **Virtual binning & PAT/GDBN/GDBN-Z** — re-grade and re-analyze dies analytically without re-testing (Chapters 10–11), so “what if we applied a tighter limit?” is a report, not a re-run.

## 8.13 Field Notes 🧭

- Reports are *the deliverable* for many engineering workflows — a wrong number in a customer-facing yield report is a reputation-level defect. Report validation is therefore high-status QA work, not drudgery.
- “Report disagrees with database” bugs usually aren’t rendering bugs — they’re *filter* bugs (facility type, date range, soft-vs-hard bin) or *timing* bugs (report generated before engines finished). Check those two before blaming the chart.
- The Gallery view is a thumbnail grid; the Zoom-In window is where the real statistics tables and inner-report drill-downs live. Bugs love the boundary between the two — validate that a value shown in Gallery matches the same value in Zoom-In.
- Automated reports (Setup Auto Run / Report Policy) fail silently if the **Report Generation Service** isn’t running — always confirm the service and check the *View Report Policy Log* before concluding “the report is broken.”
- The desktop app checks for updates via a VersionChecker component and connects with its own DB settings — a report validated on the wrong environment/database is a classic rookie mishap.
- Weekly/monthly yield roll-ups and FAB-vs-FAB comparisons are the exec-level views; accuracy expectations are highest exactly where audiences are least technical.

## 8.14 Jargon Decoded

- **Selection Criteria:** the window where you pick the data (Facility→…→Parameter) and options before executing a report.
- **Favorite / Data Set Size:** a saved selection (e.g. “Small Data Set”) you can reload instead of drilling the tree by hand.
- **Gallery view:** the post-execute grid of thumbnail charts, with Chart / Data / Legend tabs.
- **Zoom-In window:** the full-size dialog for one chart, where detailed statistics tables and inner reports live.
- **Inner report:** a report launched *from* another report’s zoom-in, operating on the currently selected dies.
- **Setup Auto Run (SAR):** a saved, scheduled report generation run.
- **Report Policy:** a reusable, shareable bundle of report/format/destination settings attached to auto-runs.
- **Report Generation Manager / Service:** the admin console and background service that execute and log automated reports.
- **Wafer map:** spatial plot of dies at X/Y, colored by bin or value.
- **Heat map:** wafer map colored by continuous measurement values.
- **Stacked wafer map:** several wafers overlaid to reveal shared patterns.
- **Trend chart:** metric over time; drift detector.
- **% Fallout:** the share of dies outside the limits, shown in the histogram’s limit-based statistics.
- **Raw data / Data Extraction report:** die-level export of measurements.
- **Genealogy report:** family-tree report of lot lineage across stages.
- **Roll-up:** aggregation to a coarser level (device, FAB, week).
- **Box plot:** a chart summarizing a distribution by median, quartiles, and outliers; used to compare wafers, sites, or lots side by side.
- **Pareto chart:** failure categories ranked biggest-first with a cumulative-% line, so the largest yield-loss contributor is tackled first.
- **Commonality Analysis (CA):** statistical mining of genealogy and history data to find the manufacturing variable (tester, reticle, chamber, time window) common to the failures.
- **ANOVA:** Analysis of Variance — decomposes a parameter’s variation into contributions from different sources to locate where variation enters.
- **DOE:** Design of Experiments — structured experiments that deliberately vary factors to learn which drive yield.
- **PCA:** Principal Component Analysis — collapses many correlated parameters into a few underlying dimensions for visualization.
- **Correlation / T-test:** measures of whether two parameters move together, or whether two groups differ significantly.

## 8.15 Acronyms

- **PDF/XLSX** — export formats reports produce
- **WS/FT** — the facility-type filter on almost every report
- **SAR** — Setup Auto Run (automated report generation)
- **RGM** — Report Generation Manager
- **CA** — Commonality Analysis
- **ANOVA** — Analysis of Variance
- **DOE** — Design of Experiments
- **PCA** — Principal Component Analysis
- **Cpk/Cp** — process capability indices

## Global Trends & the Bigger Picture 📈

Reporting is shifting from static, engineer-generated documents toward **self-service and embedded analytics** and **real-time dashboards**, so that a product engineer, a customer-quality manager, and an executive can each pull the view they need without waiting on a report request. *For management:* this is where the platform’s value becomes visible daily — a trustworthy dashboard is what turns yield data into decisions. *For engineers:* as more audiences consume reports directly, correctness and clarity of every number become higher-stakes, because a wrong figure now reaches a customer or an executive without an engineer in the loop to catch it.

## Report QA & Validation Playbook ✅

Most “the report is wrong” findings are not rendering bugs — they are **filter bugs** (facility type, date range, soft-vs-hard bin) or **timing bugs** (report generated before the analytics engines finished). Check those two first. Then work the checklist that recurs across every report family: verify **export integrity** (numbers in the exported PDF/Excel match the database exactly, across locales and large datasets); confirm **chart-option persistence** and **Reset** behave correctly across re-execution; check that **inner reports carry the die selection** faithfully; validate that **Setup Auto Run / Report Policy** runs produce a valid, correctly named file and a clean entry in the *View Report Policy Log*; stress **large-report performance** (a raw die-level report can be enormous) for timeouts and memory; and confirm the invariant that **dies can never be gained at a later stage**. Golden habit: recompute-and-compare every headline number against source tables.

## Did You Know? 💡

- **The Pareto chart is named after an Italian economist counting pea pods.** Vilfredo Pareto noticed ~80% of Italy’s land was owned by ~20% of people (and, the story goes, that 20% of his garden’s pods yielded 80% of the peas). Quality guru Joseph Juran generalized it into the “80/20 rule” and named it after him — which is why the biggest fail bin gets attacked first. It is also why the *Bin Histogram* report was renamed *Bin Pareto*: sorting biggest-first with a cumulative line *is* the Pareto principle in one chart.
- **ANOVA is a century old.** Analysis of Variance was invented by statistician Ronald Fisher in the 1920s — and box plots by John Tukey in the 1970s. The analytics inside a modern yield platform rest on statistics developed long before the transistor existed.

## 8.16 Never Forget ⭐

1. **Web app = configure + monitor; desktop app = heavy reports.** Same database.
2. **Every desktop report shares one workflow:** Selection Criteria (Favorite → Group By / Bin Type / Specify Bins) → Execute → Gallery → Zoom-In.
3. Every report number must be reproducible by SQL — **recompute-and-compare** is the validation method for all of them.
4. Bin Summary before/after PAT: **ΔBin 1 = PAT fail count.** And the ranked bin report is **Bin Pareto** (cumulative line), not “Bin Histogram.”
5. Parametric reports must show **CLM limits when CLM is active** and must exclude functional tests.
6. Cross-stage counts can only shrink: **dies are never gained downstream.**

## 8.17 Summary

The desktop app generates the heavyweight deliverable reports; the web app configures modules and monitors live. Every desktop report shares one rhythm — pick data and options in **Selection Criteria**, **Execute** into **Gallery view**, then **Zoom-In** for detailed statistics and **inner-report** drill-downs. Core report families: bin summaries and **Bin Pareto** (validate against WAFER/BIN_SUMMARY and the before/after-PAT rule); parametric **histograms** (classes, distribution & limit-based statistics, % Fallout, Cp/Cpk), **trends** (Group By/Plot By, Zone/Mode PAT limits), **XY Scatter** (r/r², Specify Dies) and **box plots**; wafer maps (validate against die coordinates and values); and genealogy, cross-stage yield-loss, data-summary and upload-history reports. Reports leave the app four ways — **Export** (Excel/PDF/Web, Include Legend/Data), **Email**, **Print**, and automated **Setup Auto Run / Report Policy** via the Report Generation Manager and Service. Beyond these, the platform ships 300+ standard reports grouped by the question each answers, plus a statistical toolset (commonality analysis, ANOVA, DOE, PCA, correlation, T-tests) that turns reporting into root-cause analysis. The reader’s job is to know which metric — yield %, cost per good die, Cpk, bin Pareto, cross-stage loss — answers their question, tied to a target and a trend. Most “wrong report” findings are filter, timing, persistence, or export bugs.

## 8.18 Quiz — Chapter 8

**Q1.** A Bin Summary total says 19,800 dies; WAFER.Part_Count says 20,000. Name two likely causes and how you’d distinguish them.

**Answer.** (i) Report filter excludes something (a wafer, a bin type, retest pass) — reproduce with filters wide open; (ii) report ran on/joined the wrong bin view or stale data — recompute from BIN_SUMMARY and compare. Filters first: they’re the usual culprit.

**Q2.** Which report type and which chart would you reach for to answer: “has this parameter been drifting for the last 30 lots?” What overlay lines should you expect?

**Answer.** Parametric **trend chart** of the parameter’s Mean (or Cpk) per lot over the range; expect UCL/LCL control-limit lines overlaid.

**Q3.** A histogram shows spec-limit lines at values that don’t match TEST_PARAM_MAP. What module do you suspect and what column proves it?

**Answer.** CLM — active custom limits override ATE limits in reports. `WAFER.CustomLimitVersionId` being non-NULL proves CLM applied; join to CustomLimitDetail for the shown values.

**Q4.** In a cross-stage report: WS Bin 1 = 16,000; assembled units = 16,150. Is this possible? What does it indicate?

**Answer.** Impossible in reality — dies are never gained downstream. Indicates double-counting (e.g., retest units counted twice) or a genealogy/join error. Data bug, investigate joins and retest handling.

**Q5.** Twenty stacked wafers show failures at the identical map position. What physical causes does this suggest, and why does stacking reveal what single maps hide?

**Answer.** A repeating defect at fixed coordinates across wafers → probe-card damage (same needle position) or photomask/reticle defect (same printed position). Single maps look like scattered noise; stacking aligns and amplifies the repetition.

**Q6.** Why should a raw data report be tested at both minimal and maximal scope?

**Answer.** It reads the heaviest tables (dynamic, die-level). Minimal scope proves correctness; maximal scope proves performance/stability (timeouts, memory) — both are release risks.

**Q7.** A device’s yield suddenly drops and the Bin Pareto shows one fail bin dominating, but the root cause isn’t obvious. Which built-in analytics would you reach for, and what does each tell you: (a) Commonality Analysis with Association Rules, (b) ANOVA?

**Answer.** Reach for **Commonality Analysis**. (a) *Association Rules* mine genealogy/history to rank which discrete variable is common to the bad dies — a specific tester, probe card, reticle, handler, or time window — using support × confidence, producing a short suspect list. (b) *ANOVA* applies when the loss is parametric: it decomposes the parameter’s variance across sources (wafer, machine, layer) to show *where* the variation enters. CA narrows the haystack; engineers confirm with a focused DOE.

**Q8.** For each reader, name the single most useful report or metric and why: (a) a VP reviewing weekly performance, (b) a product engineer qualifying a new device, (c) a QA engineer validating a data load.

**Answer.** (a) VP — the **Yield Trend / Yield Summary** against target (with cost per good die): direction and business impact at a glance. (b) Product engineer — **parametric histograms/trends and Cpk** plus the wafer map: confirms the device is centered, capable, and free of spatial signatures. (c) QA engineer — the **Bin Summary checked against the Golden Rule** and **Upload History**: proves the data loaded completely and correctly before any analysis is trusted.
