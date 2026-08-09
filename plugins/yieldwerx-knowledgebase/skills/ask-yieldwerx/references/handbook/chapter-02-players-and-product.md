---
id: handbook-third-sec-ch2
title: "Chapter 2 — The Players and the Product: Where yieldWerx Fits"
source_id: handbook-third-html
source_section: sec-ch2
edition: 3
status: current
confidentiality: internal
generated: true
---
Part I · The Brass Tacks

# Chapter 2 — The Players and the Product: Where yieldWerx Fits

## 2.1 The cast of characters

The chip industry split itself into specialized roles decades ago. You must know them because they are yieldWerx’s customers, and their differing needs shape product requirements:

- **IDM (Integrated Device Manufacturer):** does everything in-house — designs, fabricates, tests, and sells chips (e.g., the classic Intel or Texas Instruments model).
- **Fabless company:** designs and sells chips but owns no factory (e.g., Qualcomm, NVIDIA, AMD). They pay others to manufacture — which means they *depend on data* from partners to know their product’s health.
- **Foundry:** a factory-for-hire that fabricates wafers for fabless companies (e.g., TSMC).
- **OSAT (Outsourced Semiconductor Assembly and Test):** a contractor that packages chips and runs final testing (e.g., ASE, Amkor).
- **ATE vendor:** builds the multi-million-dollar Automated Test Equipment machines that electrically test chips (e.g., Teradyne, Advantest).

A real-life supply chain often looks like: *a fabless company in California designs a chip → a foundry in Taiwan fabricates the wafers → an OSAT in Malaysia packages and final-tests them → finished chips ship to a phone assembler in China.* Test data is born at each step, in different facilities, owned by different companies, in different formats.

## 2.2 The fabless company’s problem — a user journey you should internalize

Imagine you are a yield engineer at a fabless company. Your product is manufactured across two foundry fabs and three OSAT sites. One Monday, a customer emails: *“Field returns are up on your power-management chip. What changed?”*

Without a YMS, your week looks like: emailing five external facilities for raw test files, receiving gigabytes of binary data in slightly different formats, writing throwaway scripts, manually cross-referencing lot numbers in Excel, and hoping you can even connect a failed packaged unit back to the wafer it came from. Two weeks later you have a partial answer.

With yieldWerx: all five facilities’ files were auto-loaded into one database as they were produced. You filter by device → see yield trend by fab → spot that Fab A’s wafers started drifting three weeks ago on one electrical parameter → click into wafer maps → see failures ring the wafer edge → trace affected lots forward to exactly which customer shipments contain suspect material. Hours, not weeks.

This journey — *detect, diagnose, trace, contain* — is the core value story. When you write PRDs later, ask “which step of detect-diagnose-trace-contain does this feature serve?”

## 2.3 What yieldWerx actually is

**yieldWerx** (by Trisoft) is an end-to-end semiconductor yield management and ATE data analytics platform. Its public positioning: turn-key yield management for IDMs, fabless companies, and OSATs, capturing data from hundreds of formats (STDF, ATDF, CSV, proprietary) and producing analytics from device characterization through automated yield/quality monitoring to RMA (returned parts) analysis. It deploys on-premises, cloud, or hybrid.

Functionally, it is three things stacked together:

1. **A data pipeline** — watches folders, ingests ATE test files, parses them, and populates a SQL Server database (Chapters 6–7).
2. **An analytics engine suite** — background services that automatically run screening and monitoring algorithms on every uploaded wafer: PAT, MVPAT, SWM, GDBN, SPC, SBYL, AMG, LG (Chapters 9–13).
3. **User-facing apps** — a web application (configuration, dashboards, live monitoring), a Windows desktop application (heavy report generation), and Power BI views (executive reporting) (Chapter 8).

## 2.4 The business sense, in one paragraph

Customers pay for yieldWerx because it converts undigested test data into avoided losses: catching a process drift one week earlier can save a month of bad wafers; screening out statistically suspicious chips prevents field failures (which, in automotive, mean recalls costing orders of magnitude more than the chip); proving traceability wins contracts with quality-obsessed customers; and automating data plumbing frees engineers for engineering. The product’s ROI story is *“we pay for ourselves the first time we catch an excursion early.”*

## 2.5 Field Notes 🧭

- Test data formats are dominated by **STDF**, a binary standard originally defined by ATE-maker Teradyne in the 1980s — still the industry backbone forty years later. You’ll master it in Chapter 6.
- Automotive customers are the most demanding: standards like **AEC-Q100** effectively require statistical screening (PAT — Chapter 10). “Zero defect” programs are why several yieldWerx modules exist at all.
- An **excursion** is industry slang for “something went abnormal in manufacturing.” Excursion detection speed is a key selling point for any YMS.
- Your company Trisoft builds yieldWerx; you’ll see both names in code namespaces (e.g., `Trisoft.yieldWerx.Web`).

## 2.6 Jargon Decoded

- **RMA (Return Material Authorization):** the process when a customer returns failed parts; RMA analysis = figuring out why they failed.
- **Excursion:** an abnormal deviation in a manufacturing process — the thing everyone wants to catch early.
- **Field failure:** a chip that passed all factory tests but failed later in the customer’s product — the most expensive kind of failure.
- **Traceability:** ability to link any chip back through packaging, testing, and fabrication to its origin.
- **Turn-key:** delivered ready to use, rather than a toolkit you assemble.

## 2.7 Acronyms

- **IDM** — Integrated Device Manufacturer
- **OSAT** — Outsourced Semiconductor Assembly and Test
- **ATE** — Automated Test Equipment
- **YMS** — Yield Management System
- **RMA** — Return Material Authorization
- **AEC-Q100** — Automotive Electronics Council qualification standard for ICs
- **STDF/ATDF** — Standard / ASCII Test Data Format (Chapter 6)

## Global Trends & the Bigger Picture 📈

The industry’s structure is shifting under the platform’s feet. **Fabless** designers keep gaining share while **OSATs** grow rapidly on the back of chiplets and advanced packaging — meaning ever more of a product’s test data is born *outside* the company that owns the design, in more facilities and more formats. In parallel, yield platforms are moving to **hybrid-cloud and cloud-native** deployments so that data from many sites can be pooled and analyzed centrally. *For management and sales:* this is the strategic case for a platform like yieldWerx — it is the neutral ground where fragmented, cross-company data becomes one picture. *For engineers:* expect more external data sources, more connectors, and more emphasis on secure multi-party data handling.

## Bug-Hunting, Security & Hardening Tips 🐞

Because data arrives from many organizations, this is where **security testing** starts to matter as much as functional testing. Probe **multi-tenant data isolation** — Customer A must never, under any query, filter, or export, see Customer B’s data; treat this as a top-severity class. Verify **role-based access control (RBAC)** on every endpoint, not just in the UI. Treat every externally supplied file and connector feed as **untrusted input** — the partner who generated it is not your QA department. And watch for **confidential-data leakage** in logs, error messages, URLs, and cached exports, since yield numbers and customer identities are commercially sensitive.

## Did You Know? 💡

- **“Silicon Valley” was coined by a journalist.** The name was popularized in 1971 by trade reporter Don Hoefler in a series titled *“Silicon Valley USA”* — before that it was just the Santa Clara Valley, better known for its orchards.
- **“Foundry” is borrowed from metalworking.** A chip foundry takes its name from the metal-casting foundry — a factory that pours a design someone else supplied. “Fabless” (fabrication-less) was coined in the 1980s to describe the then-radical idea of a chip company that owned no factory at all.

## 2.8 Never Forget ⭐

1. yieldWerx’s customers are **IDMs, fabless companies, and OSATs** — the fabless case (data scattered across external partners) is the clearest value story.
2. The core user journey is **detect → diagnose → trace → contain**.
3. yieldWerx = **pipeline + analytics engines + apps** (web, desktop, Power BI). Keep this three-part mental model; the whole architecture chapter hangs off it.
4. Field failures cost far more than factory failures — that asymmetry justifies statistical screening modules like PAT.

## 2.9 Summary

The chip industry is split into designers (fabless), factories (foundries/IDMs), and assembly/test contractors (OSATs), so one product’s test data is born in many places, formats, and companies. yieldWerx unifies that data and layers automated analytics and reporting on top, selling the ability to detect excursions early, diagnose causes, trace material, and contain damage. Architecturally it is a data pipeline, a set of background analytics engines, and three user-facing surfaces.

## 2.10 Quiz — Chapter 2

**Q1.** Match: IDM, fabless, foundry, OSAT — to: “designs but doesn’t manufacture”, “manufactures wafers for others”, “packages and final-tests for others”, “does everything in-house”.

**Answer.** IDM = does everything in-house; fabless = designs but doesn’t manufacture; foundry = manufactures wafers for others; OSAT = packages and final-tests for others.

**Q2.** Why does a *fabless* company arguably need a YMS even more than an IDM?

**Answer.** Its manufacturing data is born in *other companies’* facilities, in scattered formats. Without a YMS it has no unified view of its own product’s health — the aggregation problem is worst for fabless.

**Q3.** List the four steps of the core user journey, and give a one-line example of each from the power-management-chip story.

**Answer.** Detect (yield trend shows Fab A drifting) → diagnose (wafer maps show edge-ring failures) → trace (genealogy identifies affected lots/shipments) → contain (hold/quarantine suspect material).

**Q4.** A prospect asks “what’s the ROI?” Give the one-paragraph business answer.

**Answer.** yieldWerx converts undigested test data into avoided losses: earlier excursion detection saves weeks of bad wafers; PAT screening prevents expensive field failures; traceability wins/keeps quality-critical contracts; automation frees engineers. It typically pays for itself the first time it catches an excursion early.

**Q5.** Name the three architectural parts of yieldWerx and one example of each.

**Answer.** Pipeline (UploadService parsing STDF into SQL Server); analytics engines (PAT, SWM, SPC, etc. auto-running per upload); apps (web app, desktop app, Power BI).
