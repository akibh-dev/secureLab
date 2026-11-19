# Phase 4 · Author the six lessons and finish navigation

[Plan index](README.md) · [Previous phase](03-playable-pilot.md) · [Next phase](05-release-qualification.md)

**Entry condition.** Pilot accepted. Use its schema version, UI and fixture structure as the authoring template.

**Ownership.** Curriculum lead owns the shared manifest. Each lab author owns one directory. Navigation owner owns public pages and layouts.

## Work queue

| Ticket | Action | Acceptance evidence |
|---|---|---|
| [ ] L2–L6 | Assign the five remaining packs independently | Each pack has a human content review, three hint tiers and successful good-policy and distractor checks. |
| [ ] N1 | Generate the curriculum, catalog and progress routes | All six slugs resolve; direct links and prerequisite labels agree with the shared manifest. |
| [ ] N2 | Finish public pages, glossary and metadata | Landing, contribution, accessibility and privacy links work on small screens. |
| [ ] I1 | Integrate packs in prerequisite order | Complete all six, confirm the capstone summary and reopen a completed lesson. Rebuild the offline manifest against the full catalog. |

## Implementation details

Use the slug and ID independently so links can remain stable through copy edits. Chain MVP-01 → 02 → 03 → 04 → 05 → 06. Include at least one legitimate success and one meaningful boundary for every operation. Expected values come from independently authored fixtures. Use fictional names and records throughout.

| Lab and slug | Interaction and expected behavior | Review cases |
|---|---|---|
| 01 · authentication-is-not-authorization | Choose the project membership policy | Member, nonmember, absent identity, missing project; verify public response consistency |
| 02 · tenant-isolation | Choose the lookup and policy using verified tenant context | Own tenant, other tenant, missing document, conflicting client metadata, absent membership. Retain §7 rubric weights in fixture metadata and normalize by scoring group |
| 03 · role-vs-permission | Choose the helpdesk close rule. Require close permission, scoped ticket and valid open state | Authorized supervisor closes once; missing permission, unrelated scope or already closed leaves state intact |
| 04 · property-level-authorization | Choose an explicit profile projection after access approval | Public viewer receives allowlisted keys; owner receives permitted private fields; internal fields absent for both; denied object returns no profile |
| 05 · validate-inputs-and-limit-work | Choose strict pagination with defined defaults, integer bounds and a public error shape | Example product choice: page 1–1000, size 1–50, omitted defaults 1/20. Test valid edges, malformed, duplicate and out-of-range values; invalid input performs zero simulated reads |
| 06 · least-privilege-capstone | Configure a finite read/edit/share rule matrix and run cases for each action | Read scoped workspace list; permitted edit changes allowed fields only; sharing needs explicit permission. Check tenant mismatch and unknown action; denied operations leave fixtures unchanged |

Each author delivers scenario.md, a validated definition, fixtures, three progressively specific hints, reference rationale, an explanation and a passing and failing example. Pin mappings to OWASP API Security Top 10:2023 as in §6. Do not imply certification. Each pack gets a separate human accuracy review of trusted inputs, HTTP semantics, invariants and teaching copy. [OWASP API Security Project](https://owasp.org/API-Security/)

Build curriculum cards and progress summaries from the same manifest. Finish glossary terms linked from the six labs, metadata, canonical URLs, sitemap, robots file and social preview. Use the final hostname for share links. Present completion as six reviewed labs; show planned modules separately. After the capstone offer review of completed labs and progress export.
