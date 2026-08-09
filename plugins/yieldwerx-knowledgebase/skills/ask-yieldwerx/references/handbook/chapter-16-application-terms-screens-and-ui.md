---
id: handbook-third-sec-ch16
title: "Chapter 16 — Speaking yieldWerx: The App’s Own Terms, Screens & UI/UX"
source_id: handbook-third-html
source_section: sec-ch16
edition: 3
status: current
confidentiality: internal
generated: true
---
Part VI · Platform Deep Dives

# Chapter 16 — Speaking yieldWerx: The App’s Own Terms, Screens & UI/UX

*Every product invents its own vocabulary, and yieldWerx is no exception. New users often understand the semiconductor domain yet still get lost because the desktop application labels things in its own way — “Work Center,” “WCR,” “Zonal Map,” “Cart,” “Fallout Stats.” This chapter, drawn from the yieldWerx Getting Started Guide, is your translator: the proprietary terms, the screen anatomy, and the UI/UX conventions that are specific to the tool itself rather than to the industry. Read it with the app open if you can.*

## 16.1 The Data Selection hierarchy — how you point at data

Almost every action in the desktop app begins the same way: in the **Selection Criteria** window you narrow down to the data you want by walking a fixed hierarchy, top to bottom:

> **Facility → Work Center → Device Name → Test Program → Lot → Wafer → (Parameter)**

This is the app’s spine. Learn it once and every report’s setup feels the same. Each level filters the next: pick a facility, and only that facility’s work centers appear; pick a work center, only its devices; and so on down to the individual wafer (and, for parametric reports, the individual test parameter).

## 16.2 Work Center (T, F, S) — the term people ask about first

**Work Center** is yieldWerx’s label for the *test stage / operation* that produced the data — the manufacturing step where the testing happened. It is the level just below Facility in the hierarchy, and it is usually shown with a single-letter **type code**. Mapped to the three test areas you learned in Chapter 3:

- **T — e-Test / WAT (Wafer Acceptance Test / PCM), Test Area 1.** Process-monitor testing on scribe-line structures, *before* product testing.
- **S — (Wafer) Sort, Test Area 2.** Testing every die on the whole wafer (corresponds to `Facility_Type = 'W'` in the database — Chapter 3).
- **F — Final Test, Test Area 3.** Testing every packaged unit (corresponds to `Facility_Type = 'F'`).

So “Work Center” is the UI-facing way of choosing *which test stage’s data* you are analyzing, and the T/F/S codes are the shorthand for those stages. This is why filtering by Work Center is the fastest way to keep Wafer-Sort data from getting mixed up with Final-Test data — the classic ‘W’ vs ‘F’ trap from Chapter 3, surfaced in the interface.

> **A caution worth keeping (in the spirit of Appendix D):** the exact letter-to-stage mapping and the full set of Work Center codes are **deployment-configurable** — different customers may define additional or differently-lettered work centers. Treat T/F/S as the common convention, but confirm the authoritative mapping for your environment with a product SME before relying on it in a report or a customer-facing document.

## 16.3 Anatomy of a report screen — the recurring tabs

Once you execute a report, the output window has the same furniture almost every time. Knowing these panels means you can drive *any* report, not just the one you learned first:

- **Selection Criteria** (top) — the data picker from 16.1; change it and re-execute to regenerate without starting over.
- **Report Options** (left) — filters that reshape *this report type*: common ones are **Group By**, **Bin Type** (soft vs hard — Chapter 4), **Specify Bins**, **X-Axis Label**, **Sort By**, and **Color Scheme**. Wafer-map reports add **probe card site**, **reticle site**, **wafer plotting option**, and **map type**.
- **Chart Options** — cosmetic controls for the chart’s appearance, with a **Reset** button to return to defaults.
- **Chart Toolbar** — zoom in / zoom out / reset-zoom / rescale, plus print and export (Excel, HTML, PDF).
- **Data Tab** — the summarized data behind the chart, in table form.
- **Fallout Stats Tab** — a summary of the fail breakdown for the report (present on parametric reports).
- **Passed Die(s) / Failed Die(s) Data Tabs** — the split of individual dies by result.
- **Error Data Tab** — records that had *errors* in the data (not the same as failed dies) — a QA-relevant place to catch load or measurement problems.

## 16.4 The report families, in the app’s own menu order

The tool groups its reports the way the toolbar does. Beyond the ones in Chapter 8, note the app-specific names:

- **Bin(s) Analysis:** Bin Histogram, Stacked Histogram, **Wafer Map**, **Stacked Wafer Map**, and **Zonal (Zonal Map) Report** — the last divides the wafer into zones and reports per-zone, the UI form of the wafer-zone analysis from Chapter 8.
- **Parametric Test Result(s) Analysis:** Parametric Wafer Map, Parametric Trend, Parametric Failure, Parametric Histogram, **Data Extraction Report** (customizable die-level export with a chooser for which metadata fields appear), **Data Summary Report**, **XY Scatter**, **Box Plot**, **Sweep Report** (identifies sweep-trend data), and **Yield Report**.
- **Correlation:** **Bin Correlation** and **Parametric Correlation** reports.

## 16.5 Upload-time settings — the app’s proprietary knobs

When you upload a file (from the toolbar **Upload** button, or automatically via the **Upload Service Manager**), yieldWerx exposes several tool-specific configuration dialogs. These matter to QA because they silently change what lands in the database:

- **Loader Type** — which parser handles the file format.
- **Run modes** — *Not Defined* (run manually), *Schedule* (run at a set frequency), or **Folder Listener** (upload the instant a new file appears in a watched folder — the UI face of the FileSystemWatcher from Chapter 7).
- **Data Scaling** — apply raw data or no scaling, and load-or-reject accordingly.
- **Data Filters** — pull *additional* fields out of the file that would not be loaded by default.
- **Die ID Mapping** — supply X/Y coordinates for **Final Test** data, where units have no wafer XY of their own (a subtle but important point — FT units aren’t on a wafer).
- **Limit File Setting** — attach spec limits, with a load-or-reject option if limits are missing.
- **WCR Setting** (Wafer Configuration/Coordinate settings) — rotate, flip, change the X or Y axis, or change wafer/die dimensions *during upload* so maps from different sources align. This is the upload-time cousin of SWM’s wafer-rotation correction (Chapter 11).
- **Advanced Setting** — success/failure/scan directory paths, **Duplicate Parts Behavior**, a fallback limits file, functional-test parameter-name location, **generate missing dies in a merged wafer** from bin or parametric data, and the option to run the upload through a specific **rule**.

## 16.6 Productivity & UX features unique to the app

- **Favorites** — save, load, and clear a selection/report configuration so a routine analysis is one click next time (also used for saved *Policy Favorites* in automation).
- **Cart** — pick specific die coordinates on a wafer map and collect them for **image comparison** — a genuinely distinctive feature for eyeballing suspect dies side by side.
- **Find Data** — search for a file, lot, or wafer directly.
- **Help** — the in-app user guide.
- **Setup Auto Run + Report Policy** — bundle reports into a named **Policy** that generates outputs automatically on a schedule (Excel/HTML/PDF, to Local/Network/FTP), managed under *Admin Utilities → Report Generation Manager → Manage Report Policy Setup*, with enable/disable, run-status logs, and historical-data-range selection.
- **Application Preferences** (*Admin Utilities → Application Preferences*) — four tabs: **Application setting** (general, real-time wafer map, image/iView/export paths, email), **Data file setting** (including **wafer notch position** and dump folder), **Reports setting**, and **Chart setting** (axis, gridlines, chart view type).
- **iView** — the image-viewing path/component referenced in preferences for wafer and die imagery.

## 16.7 Why a whole chapter on vocabulary?

Because the number-one reason a domain-literate new hire still feels lost in front of the app is *label mismatch*: they know “Final Test,” the screen says “Work Center F”; they know “wafer-rotation correction,” the dialog says “WCR.” Closing that gap is pure speed. This chapter is also your Rosetta Stone when writing test cases and PRDs: when you reference a feature, use the app’s own name for it (Zonal Map, Fallout Stats, WCR, Cart) so engineers, QA, and support are unambiguously talking about the same button.

## 16.8 Field Notes 🧭

- The Selection Criteria hierarchy is deliberately identical across every report — once muscle memory forms, you set up an unfamiliar report as fast as a familiar one. Teach new hires the hierarchy *before* any single report.
- “Error Data” and “Failed Die(s)” are different tabs for different things: a *failed* die tested fine and lost; an *error* record couldn’t be tested or loaded cleanly. Confusing them hides real data-quality problems.
- The **Cart** feature is underused gold: for spatial debugging, collecting a handful of suspect die coordinates for side-by-side image comparison beats scrolling a giant map.
- **Folder Listener** upload mode is how production runs unattended — and it’s the same mechanism you validate for the automated pipeline. If files “aren’t loading,” check whether the listener process is running before suspecting the parser.

## 16.9 Global Trends & the Bigger Picture 📈

The industry-wide move is toward **self-service, role-tailored analytics UIs** — dashboards and pickers that let a product engineer, a customer-quality manager, and an executive each get their view without an intermediary. yieldWerx’s Favorites, Report Policies, and schema-driven report screens are steps along that path, and the Rule Engine (Chapter 15) pushes it further with schema-driven screens generated from parameter definitions. *For management:* a shallower learning curve directly lowers onboarding cost and widens who in the org can self-serve insight. *For engineers:* expect the UI to keep absorbing configuration that used to require scripts or database access — which makes *knowing the app’s vocabulary* an increasingly high-leverage skill.

## 16.10 Bug-Hunting & Hardening Tips 🐞

- **Filter-state bugs are the #1 “wrong report” cause.** Re-run with Selection Criteria wide open and confirm numbers move as expected; a stuck Work Center or Bin Type filter silently changes every result.
- **WCR mis-settings corrupt geography.** A wrong rotate/flip at upload puts every die in the wrong place — validate wafer maps against known-good reference wafers after any WCR change.
- **Die ID Mapping for Final Test** is a rich edge-case source: test FT uploads where the XY-supplying parameters are missing, malformed, or duplicated.
- **Duplicate Parts Behavior** must be tested explicitly — upload the same part twice and confirm the configured behavior (keep first, keep last, reject) actually happens.
- **“Generate missing dies in merged wafer”** can invent die records — verify it never violates the Golden Rule (bin counts must still equal part count).
- **Error Data tab as a test oracle:** after any load, a non-empty Error Data tab is a signal to investigate before trusting the report.
- **Report Policy / Auto Run:** verify scheduled outputs land at the right path, in the right format, with the right historical range — and that a disabled policy truly stops running.

## 16.11 Did You Know? 💡

- **“WCR” is one of those acronyms that hides in plain sight.** It governs wafer rotation, flipping, and axis/dimension changes at upload — so when two fabs’ wafer maps look mirror-imaged, WCR is almost always the setting that reconciles them, long before SWM ever runs.
- **The “Cart” borrows the shopping metaphor.** Just as an online cart collects items to check out together, yieldWerx’s Cart collects die coordinates to compare together — a small, human touch of UX vocabulary in a very technical tool.

## 16.12 Jargon Decoded

- **Selection Criteria:** the data-picker panel present on every report; walks Facility → Work Center → Device → Program → Lot → Wafer → Parameter.
- **Work Center:** the test stage/operation that produced the data (commonly coded T = e-Test/WAT, S = Sort, F = Final Test).
- **WCR Setting:** upload-time wafer configuration — rotate, flip, change axes or dimensions so maps align.
- **Zonal Map:** a wafer report that divides the wafer into zones and reports per zone.
- **Data Extraction Report:** a customizable die-level export where you choose which metadata fields appear.
- **Fallout Stats:** the fail-breakdown summary tab on a report.
- **Error Data tab:** records with data errors (distinct from failed dies).
- **Cart:** a collector of chosen die coordinates for side-by-side image comparison.
- **Favorites:** saved selection/report configurations for one-click reuse.
- **Report Policy / Setup Auto Run:** a named bundle of reports generated automatically on a schedule.
- **Folder Listener:** upload mode that loads a file the instant it appears in a watched folder.
- **Die ID Mapping:** supplying X/Y coordinates to Final Test data, which has none natively.
- **iView:** the app’s image-viewing path/component for wafer and die imagery.

## 16.13 Acronyms

- **WCR** — Wafer Configuration/Coordinate (rotation/flip/axis) settings at upload
- **WAT / PCM** — Wafer Acceptance Test / Process Control Monitoring (Work Center “T”)
- **T / S / F** — common Work Center codes: e-Test/WAT · Sort · Final Test
- **FTP** — file-transfer destination option for report outputs
- **XY** — die coordinate axes

## 16.14 Never Forget ⭐

1. **The Selection Criteria hierarchy — Facility → Work Center → Device → Program → Lot → Wafer → Parameter — is the app’s spine.** Learn it before any single report.
2. **Work Center = test stage; T/S/F ≈ e-Test/WAT · Sort · Final Test** (confirm exact codes per deployment). It maps to the Facility_Type ‘W’/‘F’ database flag.
3. **Every report screen shares the same tabs** — Selection Criteria, Report Options, Chart Options, Data, Fallout Stats, Error Data — so learning one report teaches you all of them.
4. **WCR at upload fixes wafer geography; “Error Data” ≠ “Failed Dies.”** Both are QA-critical distinctions.
5. Use the **app’s own names** (Zonal Map, WCR, Cart, Fallout Stats) in test cases and PRDs so everyone means the same thing.

## 16.15 Summary

The yieldWerx desktop application layers its own vocabulary over the semiconductor domain, and fluency in that vocabulary is what turns a domain-literate hire into a fast, confident user. Data selection always follows one hierarchy anchored on Facility and Work Center (the test stage, coded T/S/F for e-Test/WAT, Sort, and Final Test). Every report shares the same screen anatomy of tabs and options; uploads expose proprietary knobs (Loader Type, run modes including Folder Listener, Data Scaling, Die ID Mapping, WCR, Advanced settings); and distinctive UX features — Favorites, Cart, Find Data, Setup Auto Run/Report Policies, Application Preferences, iView — round out the tool. Knowing these names, and the W-vs-F trap they help you avoid, is pure operational speed.

## 16.16 Quiz — Chapter 16

**Q1.** Write out the seven-level Selection Criteria hierarchy in order, from broadest to most specific.

**Answer.** Facility → Work Center → Device Name → Test Program → Lot → Wafer → Parameter.

**Q2.** A colleague says a report “shows Final Test data mixed with Wafer Sort data.” Which single Selection Criteria level should you check first, and what code would isolate each stage?

**Answer.** Check **Work Center** first — it identifies the test stage. Isolate Wafer Sort with the **S** code (Facility_Type ‘W’) and Final Test with the **F** code (Facility_Type ‘F’); a stuck or wrong Work Center filter is the usual reason stages appear mixed.

**Q3.** What does the WCR setting do at upload time, which later analytics module performs a conceptually similar correction, and what bug appears if WCR is set wrong?

**Answer.** WCR rotates, flips, or changes the X/Y axes and wafer/die dimensions *during upload* so maps from different sources align. The conceptually similar step is **SWM’s wafer-rotation correction** (Chapter 11), done later at analysis time. A wrong WCR setting mislocates every die on the wafer map — geography corruption — so maps must be re-validated against a known-good reference wafer after any WCR change.

**Q4.** Distinguish the “Failed Die(s)” tab from the “Error Data” tab. Why does the difference matter to QA?

**Answer.** A **Failed Die** was tested successfully but did not meet limits (a legitimate result). An **Error Data** record could not be tested or loaded cleanly (a data-quality problem). It matters because errors masquerading as passes/fails silently distort yield and hide load bugs — a non-empty Error Data tab is a signal to investigate before trusting the report.

**Q5.** Final Test data has no wafer X/Y coordinates. Which upload setting supplies them, and name two edge cases you would test around it.

**Answer.** **Die ID Mapping** supplies X/Y coordinates for Final Test data (units have no wafer coordinates natively). Edge cases: the XY-supplying parameters are missing; malformed/out-of-range values; duplicated coordinates across units; and FT data with no mapping configured at all.

**Q6.** Name three app features that speed up repetitive work, and say what each does: Favorites, Cart, Setup Auto Run / Report Policy.

**Answer.** **Favorites** — save/load/clear a selection-and-report configuration for one-click reuse. **Cart** — collect specific die coordinates from a wafer map for side-by-side image comparison. **Setup Auto Run / Report Policy** — bundle reports to generate automatically on a schedule (Excel/HTML/PDF to Local/Network/FTP), with enable/disable and run-status logs.
