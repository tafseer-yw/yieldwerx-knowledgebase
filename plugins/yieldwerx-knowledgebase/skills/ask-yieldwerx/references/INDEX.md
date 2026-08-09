# YieldWerx knowledge index

Read this file first. Open only the chapter files needed for the question.

## Source and answer rules

- The current source is the Third Edition of the YieldWerx Domain Handbook.
- An approved feature specification or durable product decision overrides the handbook.
- Archived editions are retained in the repository for history, not current answers.
- Supporting guides add context but do not silently override the current handbook.
- Chapter frontmatter contains the exact `source_id` and `source_section` for citation.

## Fast topic routing

| Topic or user words | Read |
| --- | --- |
| How to use the handbook, source confidence, reading guide | `handbook/00-how-to-use-this-handbook.md` |
| Training, onboarding, learning order, zero to hero | `handbook/01-learning-path.md` |
| Silicon, wafer, die, chip basics, notch, crystal | `handbook/chapter-00-silicon-101.md` |
| Yield, money, business value, excursions, scrap | `handbook/chapter-01-chips-yield-and-money.md` |
| IDM, fabless, foundry, OSAT, customer, supplier | `handbook/chapter-02-players-and-product.md` |
| Manufacturing flow, wafer sort, final test, assembly, test areas | `handbook/chapter-03-life-of-a-chip.md` |
| Hard bin, soft bin, Bin 1, binning, re-binning | `handbook/chapter-04-binning.md` |
| Mean, sigma, standard deviation, Cpk, limits, distributions | `handbook/chapter-05-statistics-survival-kit.md` |
| STDF, ATDF, MIR, WIR, PTR, FTR, PRR, TSR, records | `handbook/chapter-06-stdf-and-atdf.md` |
| Architecture, database, services, queue, JobCard, tables | `handbook/chapter-07-architecture.md` |
| Reports, desktop app, report catalog, charts, gallery, export | `handbook/chapter-08-reports-and-desktop-application.md` |
| CLM, custom limits, roles, limit override | `handbook/chapter-09-clm.md` |
| PAT, MVPAT, DPAT, maverick die, dynamic limits | `handbook/chapter-10-pat-and-mvpat.md` |
| SWM, GDBN, GDBNZ, SBYL, spatial rules, bin limits | `handbook/chapter-11-swm-gdbn-and-sbyl.md` |
| SPC, control charts, Nelson rules, Western Electric, EWMA | `handbook/chapter-12-spc.md` |
| AMG, assembly map, lot genealogy, LG, dashboards | `handbook/chapter-13-amg-lg-and-dashboards.md` |
| Role-based views, developer, QA, support, product, management | `handbook/chapter-14-wearing-all-the-hats.md` |
| Rule Engine, policy, signature, provider, sequence, execution | `handbook/chapter-15-rule-engine.md` |
| Application terms, screens, UI, navigation, common controls | `handbook/chapter-16-application-terms-screens-and-ui.md` |
| Cluster Detection, inking, flood-fill, adjacency, wafer map | `handbook/chapter-17-cluster-detection.md` |
| Quiz answers | `handbook/appendix-a-quiz-answer-key.md` |
| Acronym, definition, glossary, terminology | `handbook/appendix-b-master-glossary.md` |
| Known gaps, uncertain or missing product details | `handbook/appendix-c-known-gaps.md` |
| Naming warning, similar names, overloaded terms | `handbook/appendix-d-naming-caution.md` |
| Reading path by job role | `handbook/appendix-e-reading-paths-by-role.md` |
| End-to-end mental map, big picture | `handbook/appendix-f-mental-map.md` |
| Closing note | `handbook/closing-note.md` |

## QA cross-module routing

For test design, boundaries, calculations, module order, data integrity, negative
cases, and wrong-data risks, read `domain-map.md` first. Then open the exact module
chapter from the table above.

## Common combinations

| Question | Read together |
| --- | --- |
| Why did yield change after PAT? | Chapters 4, 5, and 10 |
| What order should analysis modules run? | Domain map and Chapters 7, 10, 11, 13, and 15 |
| How should report values be tested? | Domain map and Chapters 5 and 8 |
| What is the difference between spec and control limits? | Chapters 5, 9, and 12 |
| How does uploaded test data become a report? | Chapters 6, 7, and 8 |
| How do wafer patterns change bins? | Chapters 4, 11, and 17 |
| What must a QA verify for a module? | Domain map and that module’s chapter |
