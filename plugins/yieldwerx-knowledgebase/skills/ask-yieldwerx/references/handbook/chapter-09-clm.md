---
id: handbook-third-sec-ch9
title: "Chapter 9 — CLM: Custom Limit Management"
source_id: handbook-third-html
source_section: sec-ch9
edition: 3
status: current
confidentiality: internal
generated: true
---
Part IV · The Analytics Modules

# Chapter 9 — CLM: Custom Limit Management

## 9.1 The problem CLM solves

The ATE test program ships with spec limits baked in — usually set generously for broad production safety. But real business is messier: **Customer A** builds speed-sensitive products and demands Vt_nMOS < 0.500 V even though the process spec says < 0.700 V. **Customer B** is fine with the standard limit. Limits also tighten over a product’s life. Rebuilding and re-qualifying an ATE test program for every limit change is slow and expensive — so CLM lets engineers define **custom limits in yieldWerx that override the program’s limits at data-load time.** Same test data, different judgment.

## 9.2 The three-tier data model

- **CustomLimitMaster** — the definition: name, device, **Program_Name (must match** `LOT.Program_Name` **exactly — matching is checksum-based)**, and Mode.
- **CustomLimitVersions** — versioned snapshots of a limit set; `InUse` flag marks active; `ExpiryDate` (see the gap below); versioning gives audit history.
- **CustomLimitDetail** — the actual rows: one per test parameter, with Low/High limits (entered manually or imported via CSV/Excel).

Analogy: Master = “the rulebook for MPQ5500/Customer A”; Versions = editions of the rulebook; Details = the individual rules.

## 9.3 Engineering vs Production mode — the one distinction to burn in

- **Engineering mode:** *multiple* versions may be active simultaneously — for R&D comparison work.
- **Production mode:** **exactly one version active at a time**; activating a new version must auto-deactivate the old one.

A Production-mode master with two active versions is a *serious data-integrity bug* — ambiguous limits on a production floor. The audit query (count active versions per production master, expect zero rows with >1) is a standing health check.

## 9.4 How CLM is applied — at load time, silently

CLM has **no engine service**. It acts *during upload*: the loader calls `GetParameterDetail()`, checks for a matching active version by Program_Name checksum, applies the custom limits over the file’s limits, and stamps `WAFER.CustomLimitVersionId`. That stamp is your proof: NULL means no CLM applied; populated means which version judged this wafer. Downstream, everything that consumes limits — parametric reports, PAT context, SPC — sees CLM’s numbers.

## 9.5 Access control

CLM has its own RBAC: **CLM Admin** (full control), **CLM Device Admin** (only assigned devices), **CLM User** (read-only). Group/device mappings define scope. Standard security test: a CLM User attempting any write must get HTTP 403.

## 9.6 Known gaps — pre-documented bugs you must test around

Your manager’s document flags these explicitly (they’re also PRD candidates for you):

- **G-17:** `ExpiryDate` is stored but **not enforced** — an expired version keeps applying. Manual audits required.
- **G-23:** thread-safety flaw (`LimitComparison.CompareList` shared mutable state) — concurrent uploads with CLM active risk cross-contamination. Concurrency testing is mandatory, not optional.
- **G-03:** CSV import can fail validation *silently* — import bad values and verify every error surfaces.
- **G-02:** missing guard allows two active Production versions via direct DB manipulation.

## 9.7 Field Notes 🧭

- CLM is the *first* module to touch data (at load) and has *no* engine — architecturally unique among the modules. Remember “CLM runs in the loader” and several exam-style questions answer themselves.
- Program-name matching is **checksum-exact**. The most common “why didn’t CLM apply?” answer: the program name in the file differs (even trivially) from the Master’s Program_Name.
- CLM is also the module carrying the most technical debt (EDMX data model, the four gaps) — expect disproportionate defect density here. Test accordingly.
- Business lens: CLM is effectively *per-customer product differentiation without re-engineering* — the same wafers graded per each buyer’s contract.

## 9.8 Jargon Decoded

- **Custom limit:** engineer-defined spec limit overriding the test program’s.
- **Version (CLM):** a frozen, auditable snapshot of a full limit set.
- **InUse:** the active flag on a version.
- **Checksum matching:** exact-match technique tying limits to a test program identity.
- **RBAC:** role-based access control.
- **EDMX:** the older Entity Framework modeling style CLM’s data access uses.

## 9.9 Acronyms

- **CLM** — Custom Limit Management (a.k.a. Custom Limit Module — see Appendix D on naming)
- **CSV** — comma-separated values (the import format)

## Global Trends & the Bigger Picture 📈

Custom-limit management reflects a broader industry move toward **per-customer, contract-driven quality** and **customer-facing portals**, where each buyer’s specific requirements are applied to their material without re-engineering the test program. As products serve more diverse markets (automotive, industrial, consumer) from the same silicon, the ability to apply different limits to the same device becomes a competitive necessity. *For management:* CLM is effectively product differentiation without new engineering cost. *For engineers:* it also concentrates risk — CLM carries the platform’s densest cluster of documented gaps, so it rewards careful testing more than almost any module.

## Bug-Hunting, Security & Hardening Tips 🐞

Make the four documented gaps a standing test suite: **G-17** (expiry stored but not enforced — upload after expiry and confirm/measure the behavior), **G-23** (thread-safety under concurrent upload — run 20+ simultaneous CLM uploads and check for cross-contamination), **G-03** (silent CSV import validation failures — import bad values and confirm every error surfaces), and **G-02** (missing guard allowing two active Production versions). Beyond those: test the **checksum-exact program-name match** (the usual reason CLM silently doesn’t apply), attempt writes as a read-only **CLM User and expect HTTP 403**, and treat **CSV import as an injection and validation surface**. The instant audit is `WAFER.CustomLimitVersionId`: NULL vs populated tells you whether CLM fired.

## Did You Know? 💡

- **Checksums make CLM picky on purpose.** CLM matches limits to a test program by *checksum* — an exact fingerprint — so even a trivial difference in the program name means the custom limits silently don’t apply. It is the single most common “why didn’t CLM fire?” answer, and it is a feature, not a bug: you never want *approximately* the right limits.
- **“Custom limits” are how one silicon serves many masters.** The same physical die can ship to a phone maker and a car maker under completely different limit sets — CLM applies each customer’s spec at data-load time without ever re-cutting the test program.

## 9.10 Never Forget ⭐

1. **CLM overrides ATE limits at load time and stamps** `WAFER.CustomLimitVersionId` — NULL vs populated is your instant audit.
2. **Production mode = exactly one active version.** Two = bug, full stop.
3. CLM has **no engine service** — it lives inside the upload.
4. Program_Name matching is exact/checksum-based — near-misses silently don’t apply.
5. Gaps G-17 (expiry ignored), G-23 (concurrency), G-03 (silent import), G-02 (missing guard) are standing test obligations.

## 9.11 Summary

CLM lets engineers impose customer- or lifecycle-specific spec limits over ATE program limits, modeled as Master → Versions → Details with engineering (multi-active) and production (single-active) modes. It executes inside the upload pipeline — no engine — matching by exact program name and stamping each wafer with the applied version ID. Its RBAC has three levels, and four documented gaps (expiry unenforced, thread safety, silent imports, missing guards) make it the highest-scrutiny module for QA.

## 9.12 Quiz — Chapter 9

**Q1.** `WAFER.CustomLimitVersionId` is NULL though a Master exists for the device. Most likely cause? Second-most likely?

**Answer.** Most likely: **Program_Name mismatch** — checksum matching is exact, so any difference means no application. Second: no version was active (`InUse=1`) at upload time (or wrong mode configuration).

**Q2.** In Production mode, an engineer activates version 4 while version 3 is active. Expected system behavior? What SQL confirms health afterward?

**Answer.** Version 3 auto-deactivates (InUse→0), version 4 activates (InUse→1). Confirm: the “count active versions per Production master HAVING >1” query returns zero rows.

**Q3.** Why does testing CLM require *concurrent* upload scenarios specifically? Name the gap ID.

**Answer.** Gap **G-23**: shared mutable state in limit comparison during load. Only concurrent uploads exercise the race; serial testing can never catch it.

**Q4.** A version expired last month but wafers still get its limits. Bug or known limitation? What is QA’s obligation either way?

**Answer.** Known limitation **G-17** — documented, open. QA must still test it, document current behavior explicitly, and audit for expired-active versions until enforcement ships.

**Q5.** A CLM User successfully edits a limit via a direct API call. Which test category failed, and what’s the expected HTTP status?

**Answer.** Authorization (RBAC) testing failed — API-level permission enforcement missing (UI hiding is not enforcement). Expected: **HTTP 403 Forbidden**.

**Q6.** Explain in business terms why a fabless company would insist on CLM before buying the platform.

**Answer.** Different customers demand different limits on the same device; CLM applies each buyer’s contractual limits at data-load time without re-engineering the ATE program — per-customer quality grading, auditable via versions.
