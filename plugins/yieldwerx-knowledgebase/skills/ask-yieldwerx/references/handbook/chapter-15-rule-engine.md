---
id: handbook-third-sec-ch15
title: "Chapter 15 — The Rule Engine: One Pipeline to Run Them All"
source_id: handbook-third-html
source_section: sec-ch15
edition: 3
status: current
confidentiality: internal
generated: true
---
Part VI · Platform Deep Dives

# Chapter 15 — The Rule Engine: One Pipeline to Run Them All

*Chapter 7 showed you today’s architecture: every analytics module (PAT, SWM, GDBN…) has its own engine service, its own queue, its own tables, its own dashboard. This chapter covers the platform’s next-generation design — a single, unified Rule Engine — from your manager’s design document. It matters doubly for you: it is where the product is heading, and it is a masterclass in how the team thinks about architecture.*

## 15.1 The problem with one-engine-per-module

Recall the Chapter 7 pattern: each module ships as a separate Windows service with duplicated plumbing — its own queue handling, its own policy tables, its own dashboard table, its own logging. Adding a new analytics module means building all of that again. The Rule Engine design replaces this with one idea:

> **One pipeline for every module; everything that differs is a provider.**

The pipeline (accept work → queue → load config → load data → evaluate rules → act on results) is *identical* for every module. What differs — which rules exist, how they evaluate, where data comes from — is packaged into swappable **providers**. Adding a future module (GDBN, PAT, SWM on the new engine) should mean writing new providers and detail tables, *not* a new engine. **Cluster Detection ships first; GDBN, PAT, and SWM follow later.** The design marks deferred pieces explicitly: *designed now, built later* — so today’s decisions don’t paint tomorrow into a corner.

## 15.2 Five architecture principles — each backed by a mechanism

The design doc pairs every principle with the concrete mechanism that delivers it — a habit worth stealing for your own PRDs:

- **Scalable** — workers are *stateless*, so throughput scales horizontally: need more capacity, add more workers.
- **Reliable & resilient** — requests are *persisted, queued, and retried*; a failure is isolated to the step where it happened rather than poisoning the run.
- **Decoupled** — components talk through *contracts (interfaces), not internals*, so the engine stays stable while modules evolve.
- **Extensible** — a new module = new *providers + detail tables + screens*; the engine itself is untouched.
- **Auditable** — rule *versions*, request status, execution results, and skip reasons are all recorded; **any past result can be explained**.

## 15.3 The pipeline, step by step

**Gateway.** A caller submits work (today’s WCF callers are supported; they later move to REST on the same gateway and the WCF host retires). The Gateway *validates, selects matching policies, queues the work, and immediately replies* `Accepted(RequestId)` — the caller doesn’t wait for processing.

**Eligibility as data.** Whether a policy applies to a wafer is decided by simple condition rows (e.g., “Device = D100 or D200”) combined with AND — value lists are just extra rows. A new kind of condition needs **no schema change**. If no policy matches, the run completes as **OK (Skipped)** — *a skip is not an error, and it is never silent*: the reason is saved. (Remember Chapter 12’s “why didn’t SPC fire?” mystery — this design makes that question answerable by query.)

**Queue.** Each matched policy becomes one row in `RE_RequestLog` — one policy-bound unit of work, with status, attempt count, and lease tracking for safe retries.

**Worker — four steps after dequeue:**

1. **Load configuration** — the policy and its rules, always the *latest versions*.
2. **Load unit data** — dies/pixels via a data provider (Database now; ATDF-file loading deferred).
3. **Evaluate rules** — per rule type, in configured order, always against the *original* data (one rule’s changes don’t contaminate the next rule’s input).
4. **Post-actions** — one ordered chain finishes the run: ink and final-bin providers shape the result in a declared order, **first matching rule wins**, and the result **freezes** after the last provider. Then **Save** appends a new result pass (optional — a run can be *evaluate-only*), and **Notify** always calls the caller back, with retries. Neither Save nor Notify can change the frozen result.

## 15.4 Providers: the three extension points

Everything module-specific lives behind one of three interfaces:

- **IDataProvider** — knows facts, load, and save for one data source: `DatabaseDataProvider` (now), `AtdfDataProvider` (deferred), `CsvFixtureProvider` (a *test double* — a fake data source purpose-built for testing, which should make your QA heart sing).
- **IRule / IPolicyProvider** — supplies the policy and its ordered rules, one per policy type (Cluster Detection now; GDBN providers deferred and required to **match legacy output die-for-die**).
- **IRuleEvaluator** — `Evaluate(data, rule) → clusters + their units`, one per rule type: **ClusterSizeDetection** (flood fill, diagonal on/off), **PatternDetection** (offset-set matching with 8 rotations, mirroring, notch awareness — variants pre-generated at save time so the engine just slides shapes), **ClusterMatrixDetection** (N×N window count — deferred), and **MlClusterDetection** (deferred).

The ML evaluator has its own inner seam, **IMlScorer**: one call per wafer returns a score for every unit; the rule then applies its configured threshold. Two deployments hide behind the same interface — **InProcessScorer** (ML.NET/ONNX in-process, nothing extra to deploy) and **RemoteScorer** (a separate Python/GPU ML service over HTTP/gRPC, owned by data science). Switching deployment is *configuration, not an engine change* — and if the ML service is down, the ML rule *skips* and the run still completes.

## 15.5 The framework schema (RE_* tables)

One framework schema serves every module — about twelve tables now. The heart of it:

- `RE_Policies` (type, name, active, automated, priority) → `RE_PolicyRules` (ordered rule list) → `RE_Rules` — where **editing a rule creates a new versioned row** (`RuleKey`, `Version`, `IsLatest`). Results point at the *exact version that ran*.
- `RE_Eligibility` — the data-driven wafer-level gate from 15.3.
- `RE_RuleBins` (which bins mean detect/skip/ink-eligible) and `RE_RuleActions` (post-action settings as rows).
- `RE_Rule<Type>` **detail tables** — one small table per detection mode (`RE_RuleClusterSize`, `RE_RulePatterns`, deferred `RE_RuleMatrix`/`RE_RuleMl`), so no mode carries another mode’s empty columns.
- `RE_RequestLog` (the queue: status, attempts, lease, before/after yield) → `RE_RunRuleResults` (per-rule outcome: match count, units detected/inked) → `RE_AuditLog` (write-once trail of every step, event, and skip reason).

The doc’s worked example knits it together: *policy 7 lists rule 42 (order 1) and rule 43 (order 2); eligibility says “Device D100 or D200”; wafer W-0455 arrives → one request row → two result rows, each pinned to the exact rule version that ran.* Notice also what’s **gone**: no per-module `*_Dashboard` tables — one query over `RE_RequestLog` + `RE_RunRuleResults` and one endpoint serve every module’s dashboard, with before/after yield stored on the request row so no extra joins are needed.

## 15.6 The API surface

REST endpoints under `/rule-engine/`: policy types (with rule types and parameter schemas — so screens are *schema-driven* and new rule types get UIs largely for free), policy CRUD/copy/activate, ordered rule management with per-type validation, eligibility at both policy-type and policy scope, artifacts (pattern grids; ML model registry with validate/promote lifecycle), automation config, and — the QA gold — **executions**: submit, status, *idempotent retry*, **preview** (a simulation that saves nothing), and **match-policies** (a dry run that reports which policies would match a wafer with per-criterion verdicts), plus per-request audit trails and the shared dashboard.

## 15.7 Why this design matters to you specifically

As **QA**: versioned rules + write-once audit means *any* historical result is reproducible and explainable — test that claim. The preview and match-policies endpoints are purpose-built test instruments. The GDBN migration carries an explicit acceptance criterion — *legacy output, die-for-die*. Skips must never be silent — test that every skip has a recorded reason. As **PRD author**: this doc is a model — every principle tied to a mechanism, every deferral explicit, every claim testable. As **developer**: contracts-not-internals and eligibility-as-data are patterns you’ll be expected to preserve.

## 15.8 Field Notes 🧭

- This design directly answers Chapter 7’s technical-debt list: the per-module engine sprawl, the WCF legacy (callers migrate to REST on the same gateway, then the WCF host retires), and per-module dashboard tables all get retired by architecture rather than patched.
- “Evaluate-only” runs + the preview endpoint mean engineers can trial a policy against real wafers with zero side effects — expect this to become the standard way policies are tuned before activation.
- Pattern variants (rotations/mirrors) are *pre-generated when the rule is saved*, not computed at run time — a classic trade: storage for speed and simplicity.
- “First matching rule wins, then the result freezes” is a deliberately simple conflict-resolution law. Simple laws are testable laws.
- The color code in the design doc (purple = deferred) is itself a communication technique worth copying: it lets one diagram serve both this release and the roadmap.

## 15.9 Jargon Decoded

- **Rule engine:** a system that evaluates configurable rules against data, separating *what to check* (rules, data) from *how checking runs* (the engine).
- **Provider:** a swappable component implementing a contract (interface) — the unit of extension in this design.
- **Contract / interface:** an agreed method signature components code against, hiding internals.
- **Stateless worker:** a processor keeping no local state between jobs — any worker can take any job, enabling horizontal scaling.
- **Test double / fixture:** a fake implementation (like `CsvFixtureProvider`) used to test the engine without real infrastructure.
- **Idempotent retry:** retrying safely without duplicating effects.
- **Lease (queue):** a time-boxed claim a worker takes on a job so a crashed worker’s job can be reassigned.
- **Flood fill:** an algorithm that finds connected regions on a grid — here, clusters of adjacent failing dies.
- **Versioned rows:** edits create new rows instead of overwriting — history is preserved and referencable.
- **Evaluate-only / preview:** a run that computes results without saving them.
- **Schema-driven UI:** screens generated from parameter schemas the API publishes, rather than hand-built per rule type.
- **Dry run:** executing the decision logic (like policy matching) without doing the work.

## 15.10 Acronyms

- **RE_** — the Rule Engine table prefix
- **WCF / REST** — legacy Windows service protocol / modern HTTP API style
- **gRPC** — a fast cross-service call protocol (option for the ML service)
- **ML.NET / ONNX** — .NET machine-learning runtime / portable model format
- **ERD** — Entity-Relationship Diagram (schema map)
- **CRUD** — Create, Read, Update, Delete
- **PK / FK** — primary / foreign key

## Global Trends & the Bigger Picture 📈

The Rule Engine embodies where enterprise platforms are heading: **rules-as-configuration** rather than code, **ML rule types** slotted in behind clean interfaces, and **MLOps discipline** — a model registry with validate/promote lifecycle, versioning, and safe fallback when a model service is unavailable. This mirrors the wider industry move to treat models and rules as first-class, versioned, auditable assets. *For management:* this architecture is what lets the platform add modules (and ML) as fast as the market demands without costly rewrites — an agility and cost story. *For engineers:* contracts-not-internals, eligibility-as-data, and versioned-and-audited-everything are the patterns to internalize, because they are becoming table stakes across the software industry.

## Bug-Hunting, Reproducibility & Hardening Tips 🐞

The Rule Engine is designed to be testable — use it. Lean on **preview** (full simulation, saves nothing) and **match-policies** (dry-run eligibility with per-criterion verdicts) as built-in test instruments. Verify **reproducibility**: because rules are versioned and results pin the exact version that ran, a historical result must be re-explainable — assert it. Test **idempotent retry** (a re-delivered request must not double-apply) and **lease expiry** (a crashed worker’s job must be safely reassigned, not processed twice). Confirm **skips are never silent** — every skip carries a saved reason. Treat **eligibility values as an injection/validation surface**, write **provider contract tests** (including the CSV fixture double), and confirm the **ML-service-down path degrades to a recorded skip** while the run still completes.

## Did You Know? 💡

- **“Idempotent” is a 150-year-old math word.** Coined by mathematician Benjamin Peirce in the 1870s from Latin *idem* (“same”) + *potent* (“power”), it means an operation you can apply many times with the same result. A retried Rule-Engine request must be idempotent — run it twice, get one outcome, not two.
- **“Provider” and “contract” are borrowed from law and commerce on purpose.** The Rule Engine’s providers honor *contracts* (interfaces) the way a supplier honors a purchase order — the engine doesn’t care *how* the work gets done, only that the agreed shape is delivered. Swap the provider, keep the contract, and nothing else has to change.

## 15.11 Never Forget ⭐

1. **One pipeline, many providers.** Modules differ only behind IDataProvider, IPolicyProvider, IRuleEvaluator.
2. **Skips are recorded, never silent** — “OK (Skipped)” with a saved reason is a designed outcome, not an error.
3. **Rules are versioned; results pin the exact version that ran** — any past result can be explained. Test exactly that.
4. **Post-actions: ordered chain, first match wins, result freezes; Save is optional, Notify always happens (with retries).**
5. **Preview and match-policies are your built-in test instruments** — simulation with no side effects.
6. The GDBN migration bar: **match legacy output die-for-die.**

## 15.12 Summary

The Rule Engine unifies yieldWerx’s per-module engines into one pipeline — gateway, data-driven eligibility, persisted queue, stateless workers, ordered rule evaluation, and a frozen-result post-action chain — with all module-specific behavior behind three provider interfaces and per-rule-type detail tables in a single RE_* schema. Rules are versioned, every step is audited, skips carry reasons, dashboards collapse to one query, and ML slots in behind a scorer interface that works in-process or as a remote service. Cluster Detection ships first; PAT, SWM, and GDBN follow as providers — not rewrites.

## 15.13 Quiz — Chapter 15

**Q1.** A wafer arrives and no policy’s eligibility conditions match it. What does the engine record, and why is this design decision important for QA?

**Answer.** The run completes as **OK (Skipped)** with the reason saved (request/audit rows record the skip). It matters because “nothing happened” becomes queryable and testable — QA can assert that every skip has a recorded reason, and “why didn’t the module fire?” investigations end in data, not guesswork.

**Q2.** In one sentence each, name the three provider interfaces and what varies behind each.

**Answer.** **IDataProvider** — where unit data comes from and how results save (Database, ATDF file, CSV test fixture). **IRule/IPolicyProvider** — which policy and ordered rules apply, per policy type. **IRuleEvaluator** — how one rule type turns data into detected clusters (size, pattern, matrix, ML).

**Q3.** An engineer edits an active rule’s threshold. What happens in `RE_Rules`, and how can last month’s execution results still be explained afterwards?

**Answer.** Nothing is overwritten: a **new versioned row** is created (`RuleKey` kept, `Version` incremented, `IsLatest` moved). Old results still point at the exact rule version that ran, so historical executions remain fully explainable — the write-once audit trail plus versioned rules reconstruct the past.

**Q4.** Your team must validate the future GDBN migration onto the Rule Engine. What is the explicit acceptance criterion, and which two endpoints would you lean on while testing policies safely?

**Answer.** The GDBN providers must **match legacy GDBN output die-for-die**. Safe testing leans on `POST /rule-engine/executions/preview` (full simulation, saves nothing) and `POST /rule-engine/executions/match-policies` (dry-run of eligibility with per-criterion verdicts).

**Q5.** The ML scoring service is down when a wafer with an ML rule arrives. What is the designed behavior, and which interface makes the in-process vs remote choice irrelevant to the engine?

**Answer.** The ML rule **skips** (with recorded reason) and the run still completes — failures isolate to their step. **IMlScorer** hides the deployment: in-process (ML.NET/ONNX) and remote (Python service over HTTP/gRPC) implement the same interface, so switching is configuration, not an engine change.

**Q6.** Contrast this architecture with Chapter 7’s current design in two sentences: what stays conceptually the same, and what disappears?

**Answer.** The same conceptual flow survives — work arrives, is queued, processed asynchronously, and surfaces on dashboards (Chapter 7’s JobCard/queue thinking). What disappears is the duplication: per-module engine services, per-module queues and dashboard tables, and module-specific plumbing all collapse into one audited pipeline with pluggable providers.
