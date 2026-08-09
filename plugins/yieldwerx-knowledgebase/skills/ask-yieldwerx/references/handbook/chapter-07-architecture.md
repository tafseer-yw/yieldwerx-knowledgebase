---
id: handbook-third-sec-ch7
title: "Chapter 7 — Architecture: The Four Layers and the Journey of a File"
source_id: handbook-third-html
source_section: sec-ch7
edition: 3
status: current
confidentiality: internal
generated: true
---
Part III · Inside the Platform

# Chapter 7 — Architecture: The Four Layers and the Journey of a File

## 7.1 The big picture

yieldWerx is a classic multi-tier enterprise system with **four layers**. When something goes wrong, your first diagnostic question is always *“which layer?”*

1. **Client layer** — what users touch: the web browser UI (ASP.NET MVC), the Windows desktop app (WinForms), and Power BI reports.
2. **Application layer** — the web application’s business logic: `Trisoft.yieldWerx.Web` with one controller per module (CLM, PAT, SWM, GDBN, SPC, AMG, LG, SBYL, Reports, Dashboard), layered as Controller → BL (business logic) Service → DL (data logic) Service → Repository.
3. **Analytics engine layer** — the event-driven background machinery: **UploadService** (watches folders, loads files) and **BrokerService** (routes work to the independent engine services: PAT, MVPAT, SWM, GDBN, SPC, AMG, LG, SBYL).
4. **Data layer** — one SQL Server database: **294 tables, 934+ stored procedures, 29 views**, centered on LOT / WAFER / BIN_SUMMARY / TEST_PARAM_MAP plus per-device dynamic tables.

Analogy: a restaurant. The dining room (client), the head chef translating orders (application), a brigade of independent line cooks each with their own queue of tickets (analytics engines), and the pantry everything draws from (database).

## 7.2 The tech stack — what a QA/dev allrounder should register

ASP.NET MVC 5 on .NET Framework 4.7.2; Entity Framework 6 as ORM — **mostly Code-First but the CLM module uses an older EDMX model** (a known technical-debt wart: two data-access styles in one codebase); Dapper for hand-written complex queries; SignalR 2.4.1 for real-time SPC push to browsers; **RDotNet bridging to the R language** for SPC statistics; Castle Windsor (dependency injection); AutoMapper (DTO mapping); Log4Net (logging — your first stop after any engine run); Highcharts (server-rendered charts); LinqToStdf custom fork (STDF parsing).

You don’t need to be expert in each — you need to know *where classes of bugs live*: mixed ORM → CLM schema-sync bugs; SignalR → race conditions under concurrent uploads; R bridge → numeric mismatches between R and SQL computations; AutoMapper → silently unmapped fields.

## 7.3 The journey of a file — the single most important flow in the product

Follow one wafer file end to end. *Every* data bug traces back to a step here:

1. **Arrival.** A file lands in a watched folder (e.g., `D:\yieldWerx\Inbox\LOT_001_W1.stdf`).
2. **Detection.** UploadService’s folder listener (a FileSystemWatcher) notices it.
3. **Loading.** `ProcessFile()` detects type (extension + magic bytes), decompresses gzip if needed, picks the right parser, then Business Controllers populate the database in order: **LOTBC** → LOT row; **WAFERBC** → WAFER row; **BIN_SUMMARYBC** → one row per soft bin; **TEST_PARAM_MAPBC** → one row per parameter; **TEST_SUMMARYBC** → Min/Max/Mean/StdDev per parameter; **dynamic tables** get per-die values. Then the **CLM lookup**: `GetParameterDetail()` checks whether a custom-limit version matches this test program — if so, CLM limits override the file’s limits and `WAFER.CustomLimitVersionId` is stamped (Chapter 9).
4. **Announcement.** UploadService HTTP-POSTs a **JobCard** to BrokerService: essentially a work ticket saying *“Load event: lot X, wafer Y.”*
5. **Fan-out.** BrokerService’s EventPublisher dispatches the JobCard **in parallel** to every registered engine (PAT, SPC, SWM, GDBN, AMG, LG…).
6. **Queued processing.** Each engine drops the JobCard into its own in-memory queue (**AJobQueue** pattern) and a background thread processes tickets one at a time: `PreToDo() → ToDo() → PostToDo()`. Each engine writes its results to its own tables.
7. **Surfacing.** The web dashboard refreshes; SignalR pushes SPC updates live.

The journey of a file through yieldWerx

The journey of a file through yieldWerx

**How to read this figure:** steps 1–3 happen inside UploadService: the file is detected, parsed, and loaded into the core tables — with CLM’s custom limits applied right there at load time (step 3b, orange). Step 4 is the handoff: one JobCard posted to the Broker, which fans out to every green engine box in parallel; each engine queues and processes independently. Step 5 is where users finally see results. When any data bug appears, locate it on this map first — everything downstream of the broken step will be wrong, everything upstream innocent.

Two architectural properties worth tattooing on your memory:

- **Engines are independent.** A crash in SWM does not block PAT. (Testable: kill one engine, verify others complete and data isn’t corrupted.)
- **Queues absorb bursts.** Upload 20 wafers at once; each engine drains its queue sequentially. (Testable: bulk-upload and verify all 20 eventually process.)

## 7.4 The JobCard and RecordType

The **JobCard** is the unit of work: `{JobId, QueueId, Event (RecordType), Wafer{Lot_ID, Wafer_ID, Lot_Sequence, Wafer_Sequence}}`. The **RecordType** enum says which engine(s) should act: `Load` (new file — everyone), or targeted values (`PAT`, `SWM`, `GDBN`, `SPC`, `AMG`, `LG`, `SBLSYL`, `Merge`, `GDBNZ`) used for manual re-runs from the UI. When a user clicks “re-run PAT,” the web app posts a JobCard with `Event=PAT` — same machinery, narrower audience.

## 7.5 Background Windows services — the invisible actors

Beyond upload/broker/engines, these services change system state with no user action — QA must account for them: **AutomaticReportGeneration** (scheduled reports per `AutomateReportPolicy`), **DataDeletionAndMaintenance** (deletes old wafers per retention policy — test that it *never deletes early*), **FloatingLicenseService** (concurrent-user limits — test behavior *at* capacity), **YWImageService** (renders wafer-map images to disk), **LotGenealogyService** (batch genealogy), **FileArchivingService** (archives processed source files — test files are archived, not lost).

## 7.6 Keys and sequences — the query survival rule

Human-readable IDs (`Lot_ID`, `Wafer_ID`) are for people. The database joins on surrogate keys: `Lot_Sequence` **and** `Wafer_Sequence`. Practically every validation query starts:

```
SELECT Lot_Sequence FROM LOT WHERE Lot_ID = 'X';
```

…then joins downstream tables on that sequence. Internalize this or every query you write will frustrate you.

## 7.7 Field Notes 🧭

- The same physical wafer can be tested more than once (retest passes); `Merge` exists as a RecordType to combine multiple passes. Retest handling is a rich source of edge cases (which pass wins?).
- The Broker dispatches asynchronously (`Task.Factory.StartNew`) — meaning *upload success* and *engine completion* are different moments. A report generated seconds after upload may predate PAT results. Timing-awareness is a QA superpower here.
- Dynamic tables (per-device die-level data) are why the schema says “294 tables” yet real deployments grow more — tables are *created at runtime* per device/test program via stored procedure. Schema-less-ish data inside a rigid RDBMS: respect it.
- Log4Net logs per service are your black-box flight recorder. Habit: after any engine action, read its log *before* forming theories.
- The known architecture gaps your manager’s doc lists (mixed ORM, legacy WCF SPC path alongside Web API, no unit tests on main web controllers) are standing QA priorities — and future PRD fodder for you.

## 7.8 Jargon Decoded

- **Multi-tier architecture:** separating UI, business logic, background processing, and storage into layers.
- **ORM (Object-Relational Mapper):** library mapping database rows to code objects (EF6 here); *Code-First* and *EDMX* are two EF styles.
- **IoC / dependency injection:** pattern where components receive their dependencies (Castle Windsor).
- **JobCard:** yieldWerx’s work-ticket object dispatched to engines.
- **RecordType:** enum on a JobCard naming which engine(s) should process it.
- **AJobQueue:** per-engine in-memory queue serializing JobCard processing.
- **FileSystemWatcher:** .NET component that raises events when files appear in a folder.
- **SignalR:** library for pushing live updates from server to browser.
- **Stored procedure (SP):** SQL program stored in the database; yieldWerx has 934+.
- **Surrogate key:** internal numeric key (Lot_Sequence) used for joins instead of business IDs.

## 7.9 Acronyms

- **BC** — Business Controller (loader components: LOTBC, WAFERBC…)
- **BL/DL** — Business Logic / Data Logic (service layers)
- **EF** — Entity Framework
- **WCF** — Windows Communication Foundation (legacy service tech; SPC has one)
- **SP** — Stored Procedure
- **IoC** — Inversion of Control

## Global Trends & the Bigger Picture 📈

Enterprise architecture is moving decisively toward **event-driven, microservice, cloud-native** designs — which is exactly the direction the Rule Engine (Chapter 15) takes yieldWerx, retiring legacy WCF services in favor of REST on a single gateway. Alongside this, **zero-trust security** (authenticate and authorize every call, even internal ones) is becoming the default posture for platforms that pool multi-customer data. *For management:* modernizing the architecture is what keeps the platform extensible and defensible as the module count grows. *For engineers:* the four-layer mental model stays valid, but expect the boundaries between layers to be enforced by contracts and authentication, not convention.

## Bug-Hunting, Security & Hardening Tips 🐞

This layer is where the highest-value bugs live. Hammer **concurrency**: upload many wafers at once and hunt race conditions, especially around shared mutable state (recall CLM gap G-23) and SignalR pushes. Test **queue back-pressure and idempotency** — does re-delivering the same JobCard double-process? Probe **SQL injection** anywhere dynamic table or column names are built from data (the per-device dynamic tables are a natural risk). Verify **authentication and authorization on internal service endpoints**, not just the public UI. Scan configs and logs for **leaked secrets and connection strings**. And always separate “upload succeeded” from “engines finished” in your test timing, because the asynchronous gap hides real defects.

## Did You Know? 💡

- **The first computer “bug” was a real insect.** In 1947, operators of the Harvard Mark II found a moth stuck in a relay, taped it into the logbook, and noted the “first actual case of bug being found.” Grace Hopper popularized the story — and the word — though engineers had loosely called glitches “bugs” since Edison’s day.
- **Some bugs have names.** A *Heisenbug* vanishes when you try to observe it (a nod to Heisenberg’s uncertainty principle); a *Bohrbug* is the reliable opposite that reproduces every time. Concurrency bugs — exactly the kind lurking in this layer — are the classic Heisenbugs.

## 7.10 Never Forget ⭐

1. **Four layers: Client → Application → Analytics Engines → Data.** First question in any bug: which layer?
2. **The upload pipeline: folder → UploadService → DB population (+CLM stamp) → Broker → parallel engines → dashboards.** Every data bug lives somewhere on this line.
3. **Engines are independent and queued** — partial failure and burst handling are designed properties, and testable ones.
4. **Resolve** `Lot_Sequence` **first** — all joins run on sequences, not IDs.
5. Upload success ≠ engines finished. Mind the asynchronous gap.
6. Logs (Log4Net) before theories.

## 7.11 Summary

yieldWerx has four layers: user-facing clients, the ASP.NET web application, an event-driven analytics layer, and a large SQL Server database. Files arrive in watched folders; UploadService parses them and populates LOT/WAFER/BIN_SUMMARY/TEST_PARAM_MAP/TEST_SUMMARY/dynamic tables, applying CLM limits at load; BrokerService fans a JobCard out to independent, queued engine services that each write their results; dashboards then reflect the outcome. Independence and queuing make the system resilient — and give QA specific properties to verify. Background Windows services (retention, licensing, archiving, imaging, scheduled reports) act autonomously, and all serious queries navigate by Lot_Sequence/Wafer_Sequence.

## 7.12 Quiz — Chapter 7

**Q1.** Name the four layers and assign each of these to one: Power BI, BrokerService, `PATController`, the WAFER table.

**Answer.** Client (Power BI), Analytics engine (BrokerService), Application (`PATController`), Data (WAFER table).

**Q2.** A file uploads fine (LOT/WAFER/BIN_SUMMARY populated) but PAT results never appear; the broker log shows the JobCard dispatched. Give three distinct plausible causes, each in a different component.

**Answer.** (i) PAT engine service down/crashed before dequeue (its log will show no receipt); (ii) no active PAT policy matches the device/program (engine ran, nothing to do); (iii) engine received but errored mid-processing (log shows exception; queue may hold or drop the JobCard). Three components: transport/service, configuration, engine logic.

**Q3.** What is a JobCard, and how does a *manual PAT re-run* differ from an upload-triggered run in JobCard terms?

**Answer.** A work ticket ({JobId, Event=RecordType, wafer identifiers}) dispatched to engines. Upload-triggered runs carry `Event=Load` (all engines); manual re-runs carry `Event=PAT` (targeted).

**Q4.** Write (or sketch) the SQL that verifies the Golden Rule for every wafer of lot ‘L123’, remembering the survival rule about keys.

**Answer.** Resolve the key first, then aggregate: `SELECT w.Wafer_ID, w.Part_Count, SUM(bs.Part_Count) FROM WAFER w JOIN BIN_SUMMARY bs ON bs.Wafer_Sequence = w.Wafer_Sequence WHERE w.Lot_Sequence = (SELECT Lot_Sequence FROM LOT WHERE Lot_ID='L123') GROUP BY w.Wafer_ID, w.Part_Count HAVING w.Part_Count <> SUM(bs.Part_Count);` — zero rows = healthy.

**Q5.** Why is “upload succeeded” not the same as “data is ready for reporting,” and which architectural choice causes this?

**Answer.** The Broker dispatches asynchronously and each engine drains its own queue — upload completion says nothing about engine completion. Reports read whatever is committed *now*.

**Q6.** Which background service could make data *disappear* legitimately, and what’s the QA concern to test around it?

**Answer.** DataDeletionAndMaintenance (retention deletion). QA concern: it must never delete earlier than policy — and its deletions must not orphan related records.
