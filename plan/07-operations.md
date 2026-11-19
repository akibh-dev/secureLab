# Phase 7 · Operate and extend

[Plan index](README.md) · [Previous phase](06-cloudflare-release.md)

**Entry condition.** Public release record, baseline deployment ID and an assigned maintainer.

**Ownership.** Maintainer owns incidents and releases; curriculum reviewer owns content-version reviews.

## Work queue

| Ticket | Action | Acceptance evidence |
|---|---|---|
| [ ] O1 | After each deployment, check availability and the learning loop | Record home, direct lab, 404, progress restore and certificate results against the tag. |
| [ ] O2 | Triage reported regressions | Capture URL, browser, build/content version and reproducible steps using fictional data. Route content defects to the author and storage defects to P. |
| [ ] O3 | Check usage and maintenance monthly | Review build usage, dependency alerts, broken learning references and the disclosure contact. Assign an owner and due date for each finding. |
| [ ] O4 | Schedule changes through the release gates | For changed lessons, review expected outcomes, update the content version and exercise preserved history before tagging. |
| [ ] O5 | Maintain the post-MVP backlog | Give each future milestone a learner outcome, dependencies and acceptance evidence. Reassess hosting cost when a feature introduces server-side state. |

## Implementation details

The maintainer checks failed builds, deployment status and certificate health after releases, reviews monthly build usage, and reruns the pilot after dependency or content changes. Track first-feedback time in usability sessions. Spec targets are 50% of starters completing the first lab and 15% completing all six. With analytics disabled these are research targets; collect consented aggregate counts only if the owner later adopts measurement. Keep editor contents, fixtures and learner identifiers out of telemetry.

For v0.2, expand toward the 24-topic catalog using the pilot template and graph checks. For v0.3, design optional account sync with conflict resolution, deletion and migration from local progress. Treat v0.4 advanced practice and v1.0 team learning as separate product reviews with their own cost, privacy and grading models. Maintain stable slugs and publish a content-version note when an invariant changes. Release reusable core and schema packages only after verifying package names, public interfaces, licenses and reproducible builds.

**Release record to complete.** Maintainer: ____ · commit/tag: ____ · verified HTTPS hostname: ____ · Pages deployment ID: ____ · prior good deployment: ____ · six lab reviewers: ____ · QA report: ____ · rollback drill date: ____ · known issues and owner: ____. The public-launch milestone closes when this record and the passing custom-origin smoke test are attached to the release.
