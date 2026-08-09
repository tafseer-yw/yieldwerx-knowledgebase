# NotebookLM Video Prompts — yieldWerx Domain Handbook

**How to use:** Create a notebook in NotebookLM → upload `yieldWerx_Domain_Handbook.docx` as the source → Studio → **Video Overview** → click **Customize** → paste one chapter prompt below → Generate. Repeat per chapter (NotebookLM generates one video at a time; each prompt scopes the video to a single chapter so the series becomes a course).

**Tip:** keep the same closing line in every prompt ("end by challenging viewers with one quiz question") so the series feels consistent, like episodes.

---

## Chapter 0 — Silicon 101

> Focus ONLY on Chapter 0 (Silicon 101). Audience: a brand-new employee with zero electronics background. Explain what a semiconductor is (conductor vs insulator vs switchable silicon), how doping creates transistors, and the journey from quartz sand → ingot → wafer → die → packaged unit. Use everyday analogies, keep it visual and slow-paced. Emphasize the wafer/die/unit trio and the notch/XY coordinate idea. End by challenging viewers with one quiz question from the chapter.

## Chapter 1 — Chips, Yield, and Money

> Focus ONLY on Chapter 1. Audience: newcomer to the chip industry. Explain why yield = (good ÷ total) × 100 is the industry's most important number, using the cost-per-good-die math ($10,000 wafer at 90% vs 60% yield) and the cookie-factory analogy. Stress that yield is a financial metric worth millions, and that failures leave three clue types: position, statistics, and trend. End by challenging viewers with one quiz question from the chapter.

## Chapter 2 — The Players and the Product

> Focus ONLY on Chapter 2. Explain the industry roles — IDM, fabless, foundry, OSAT, ATE vendor — and why a fabless company's data is scattered across partners. Walk through the yield engineer's story: a customer reports failures, and the detect → diagnose → trace → contain journey with vs without yieldWerx. Describe yieldWerx as pipeline + analytics engines + apps, and its ROI story. End by challenging viewers with one quiz question from the chapter.

## Chapter 3 — The Life of a Chip

> Focus ONLY on Chapter 3. Walk chronologically through the manufacturing flow: FAB fabrication, WAT/PCM (Test Area 1), Wafer Sort (Test Area 2), Assembly & Packaging, Final Test (Test Area 3). Explain what each test stage measures ("WAT tests the process; Wafer Sort tests the product; Final Test tests the package"), the Facility_Type W/F flag, lot splitting at assembly, and the material hierarchy FAB → Lot → Wafer → Die → Unit. End by challenging viewers with one quiz question from the chapter.

## Chapter 4 — Binning

> Focus ONLY on Chapter 4. Explain the bin system as a grading system: Bin 1 = good, other bins = grades or failure categories. Make the hard bin vs soft bin distinction crystal clear (soft bins are re-binnable by PAT/SWM; hard bins never change). Cover parametric vs functional tests, the core database tables, and the Golden Rule: bin counts must sum to part count. Use the worked 20,000-die example. End by challenging viewers with one quiz question from the chapter.

## Chapter 5 — Statistics Survival Kit

> Focus ONLY on Chapter 5. Audience: someone who finds math intimidating — be gentle and visual. Teach mean, standard deviation (the archer analogy), the bell curve and sigma zones (68/95/99.7), outlier "maverick" dies that pass spec but are statistically abnormal, Cpk (the car-in-garage analogy, 1.33 bar), control limits vs spec limits (the commute analogy), and the Western Electric rules as "patterns too improbable to be chance." End by challenging viewers with one quiz question from the chapter.

## Chapter 6 — STDF & ATDF

> Focus ONLY on Chapter 6. Explain the test data files as nested envelopes: MIR/MRR bracket the file, WIR/WRR the wafer, PIR/PRR each die, with PTR (numbers) and FTR (pass/fail) inside. Walk through the two-die sample file story — die 1 passes, die 2 fails Iddq and gets bin 3. Stress: STDF is binary, ATDF is its readable twin for debugging, missing MRR = truncated file, and the record-count sanity checks. End by challenging viewers with one quiz question from the chapter.

## Chapter 7 — Architecture

> Focus ONLY on Chapter 7. Use the restaurant analogy for the four layers (client, application, analytics engines, data). Then narrate "the journey of a file": watched folder → UploadService parsing → database tables → CLM applied at load → JobCard to BrokerService → parallel independent engine queues → dashboards. Emphasize engines are independent and queued, upload success ≠ engines finished, and always resolve Lot_Sequence first. End by challenging viewers with one quiz question from the chapter.

## Chapter 8 — Reports & the Desktop App

> Focus ONLY on Chapter 8. Explain the split: web app configures and monitors; desktop app generates heavyweight reports. Tour the report families — bin summary (before/after PAT), parametric histograms/trends/Cpk, wafer maps and stacked maps, genealogy and cross-stage yield loss, upload history. Stress the recompute-and-compare validation method and that dies can never be gained downstream. End by challenging viewers with one quiz question from the chapter.

## Chapter 9 — CLM

> Focus ONLY on Chapter 9. Explain why customers need custom limits (Customer A's tighter Vt example), the Master → Versions → Details model, Engineering vs Production mode (exactly one active version in Production), and how CLM applies at upload time with no engine — stamping WAFER.CustomLimitVersionId. Cover the known gaps G-17, G-23, G-03, G-02 as real QA obligations. End by challenging viewers with one quiz question from the chapter.

## Chapter 10 — PAT & MVPAT

> Focus ONLY on Chapter 10. Tell the maverick die story: a die passes the 0.700V spec at 0.690V but is 4.8σ from the wafer's mean — PAT catches it with dynamic limits (Mean ± Nσ). Explain why automotive standards demand this, radial zones for edge dies, and re-binning through soft bins. Then MVPAT: the height/weight combination analogy for correlated-parameter outliers. Stress PAT must run before AMG. End by challenging viewers with one quiz question from the chapter.

## Chapter 11 — SWM, GDBN & SBYL

> Focus ONLY on Chapter 11. Frame the three watchdogs by their questions: SWM — "do failures form shapes?" (edge rings, clusters, scratches, guilty neighbors); GDBN — "did we deliver the promised die counts?" (contract example: 10,000 Grade-A dies); SBYL — "are bin percentages inside their bands?" (Bin 3 spiking to 15%). Note wafer rotation correction, holds as real factory actions, and that too-good numbers are also suspicious. End by challenging viewers with one quiz question from the chapter.

## Chapter 12 — SPC

> Focus ONLY on Chapter 12. Explain SPC as the predictive module: PAT judges finished parts, SPC watches the process over time to catch drift before bad wafers are made — critical because weeks of wafers are always in the pipeline. Cover control charts (X-bar, EWMA), UCL/LCL = Mean ± 3σ, the Western Electric rules in action, batch vs real-time modes with SignalR, and why an SPC alarm is an investigation trigger, not a verdict. End by challenging viewers with one quiz question from the chapter.

## Chapter 13 — AMG, LG & Dashboards

> Focus ONLY on Chapter 13. Explain AMG as the moment analytics becomes physical: the pick-and-place map (JCAP/MPS) tells the assembly machine which dies to pick — and why PAT/SWM must run first. Then LG: the family tree from WS lot → assembly lots → FT lots, orphan lots as traceability holes, and recall scoping. Finish with the dashboard, scheduled reports, and Power BI reading database views directly. End by challenging viewers with one quiz question from the chapter.

## Chapter 14 — Wearing All the Hats

> Focus ONLY on Chapter 14. Audience: an allrounder doing user journeys, PRDs, development, and SQA. Explain how one domain foundation feeds all four: journeys narrate detect-diagnose-trace-contain, PRDs specify database-verifiable acceptance criteria, development respects the queued-engine architecture, and QA runs the predict → query → compare → logs loop. Cover the known-gaps register as an inherited backlog and the capstone as the bar for autonomy. End by challenging viewers with one motivating summary of the whole handbook.

---

## Optional extras

**Full-course trailer (1 video):**
> Create a short, energetic overview of the ENTIRE handbook as a course trailer: why yield is money, the life of a chip, the statistics toolkit, the yieldWerx platform and its analytics modules, and the allrounder's role. Preview what each part teaches. Audience: a new yieldWerx employee deciding to start the course. Keep it exciting and under-detailed — a teaser, not a lecture.

**Appendix D warning (short video):**
> Focus ONLY on Appendix D (Naming Caution). Explain briefly why CLM, SWM, and GDBN have conflicting full-name expansions across source documents, which behaviors conflict, and what the viewer should do about it (verify with an SME before external use). Keep it under 3 minutes, tone: practical warning.
