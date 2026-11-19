# Phase 5 · Qualify a release candidate

[Plan index](README.md) · [Previous phase](04-curriculum-and-site.md) · [Next phase](06-cloudflare-release.md)

**Entry condition.** Integrated static build with all six reviewed packs. Assign a candidate SHA.

**Ownership.** QA lead coordinates automation, accessibility/content review and build/privacy inspection. Each agent records its environment and evidence.

## Work queue

| Ticket | Action | Acceptance evidence |
|---|---|---|
| [ ] Q1 | Run the clean-checkout commands below | Attach exit results, build file count, largest file and candidate SHA. |
| [ ] Q2 | Exercise the learner and persistence matrix | Attach Playwright results and manual keyboard/screen-reader observations. |
| [ ] Q3 | Check offline, performance and response headers | Test the built output with production headers locally; repeat host-specific checks on the Pages preview in Phase 6. |
| [ ] Q4 | Close candidate defects and prepare publication files | Record expected versus actual behavior, owner and fix SHA; rerun affected suites and full candidate CI. |
| [ ] Q5 | Issue release recommendation | Record local pass/fail by gate, remaining host checks and recovery artifact. Hand the exact qualified SHA to R. |

## Implementation details

Run from a clean checkout with pinned tooling; configure the E2E script to serve apps/web/dist. Save evidence against the release SHA.

```sh
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run validate:labs
bun run test
bun run build
bun run test:e2e
```

| Gate | Evidence required to pass |
|---|---|
| Logic and content | Golden cases for every policy; default deny, missing identity, tenant mismatch, unknown action, stable ordering, response fields and bounds. Bad schema, cyclic prerequisites and wrong validator fixtures fail CI. Verify 0, partial, 90 and 100 point outcomes |
| Learner journey | Playwright completes the six in sequence from blank storage, fails and retries one, uses all hints, refreshes mid-draft, replays and preserves best, checks locked deep links and final progress. Repeat mobile/desktop and keyboard path |
| Persistence | Current and historical snapshots, simultaneous tabs, blocked storage, malformed/oversized import, cancel replacement, confirmed erase and offline restart |
| Accessibility | Automated scans plus a keyboard and screen-reader walkthrough. Verify tab order, dialog focus return, live result summary, text equivalents, target sizes, focus visibility and zoom. Target [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) |
| Privacy and security | Inspect built files and browser network log. No tokens, third-party trackers, posted answers, payload logging or live lab endpoints. Display content as escaped text. Review dependencies, lockfile and contributor changes |
| Performance | Record device/browser and build size. Aim for p95 local grading under 500 ms on a named midrange device across 100 warm runs. Landing and docs omit evaluator chunks. Exercise cold load, offline, reduced motion and slow network |
| HTTP and cache | Genuine 404 on unknown paths, valid deep links, self-hosted assets, revalidating HTML/service worker and immutable fingerprinted files. Old tab remains usable across update, failed cache fill recovers online |
| Publication | README with quick start, demonstration and screenshot; CONTRIBUTING with template and gates; SECURITY with owner-confirmed private contact, conduct policy, PR/issue templates, changelog and asset credits. Owner approves code/content licensing before public distribution. Spec suggests MIT and CC BY 4.0 |

Put static response rules in apps/web/public/_headers. Apply nosniff, a restrictive Referrer-Policy, and CSP with default-src 'self', object-src 'none', frame-ancestors 'none', base-uri 'none', form-action 'none', worker-src 'self' and connect-src 'self'. Generate build-specific hashes for necessary inline scripts/styles or externalize them. Verify Astro hydration, imports, offline cache and icons under the enforced policy on the preview host. Check header line lengths against Pages limits; scope hashes per route if needed. Give HTML and sw.js revalidation rules and hashed assets long immutable caching. Serve the real 404.html at the top level.
