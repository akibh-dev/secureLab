# SecureLab implementation guide

Build v0.1 of the Interactive API Security Academy from [the product specification](./SECURELAB_API_PROJECT_SPEC.md). The release milestone is a learner opening the owner's HTTPS subdomain, completing six fictional defensive-policy labs, closing the browser, and returning to their results. Use MVP-01 through MVP-06 from §7 as the launch catalog. The 24-topic catalog in §6 describes the longer curriculum.

## Phase 0 · Establish the project and divide the work

1. Start in the repository root. Keep the specification as the source of product intent. Record implementation decisions in docs/decisions/. Use the free, static path throughout this release. Treat the real hostname, license approval, disclosure contact and DNS access as owner inputs for publication. Use securelab.example.com in examples.
2. Create a private root package with Bun workspaces for apps/* and packages/*, Turbo tasks for build/check/test, one committed bun.lock, strict TypeScript and shared formatting/lint rules. Pin compatible Bun and Node versions in the repo and CI. Scaffold an Astro static site in apps/web, add its official React integration, and enable HTML output per route. Keep the starting app small enough to verify a clean build before adding content.
3. Create packages/core (pure TypeScript), packages/lab-schema (Zod and shared contracts), packages/lab-content (reviewed YAML, Markdown, fixtures), packages/ui (presentational React and CSS). Keep pages, data loading and persistence in apps/web. Core consumes contract types, content validates against schema, the app composes all four. UI receives data and events as props. CI rejects server-only imports in browser packages.
4. Give root package scripts stable meanings. Use bun run dev for Astro, lint for all workspaces, typecheck for TypeScript plus Astro templates, validate:labs for the catalog checks below, test for Vitest, build for the validated Astro distribution, and test:e2e for Playwright against the built site. Put Playwright browsers in the development/CI setup. Document prerequisites and the localhost URL printed by dev.
5. On pull requests, install from the frozen lockfile and run the checks in Phase 5. Protect main with required checks and review. CI uses read-only repository permissions for testing. Keep deployment credentials out of PR jobs. Gate this phase on a fresh checkout producing apps/web/dist/index.html and a real 404.html.

### Work allocation

One person can execute these tickets in dependency order. With multiple agents, the lead owns contracts, dependency updates, lockfile and integration. Each worker can delegate disjoint files or read-only review. Keep a small status table in the issue tracker with ticket, owner, dependencies, branch, state and evidence. Claim a ticket before editing. A consuming agent can develop against the signed-off sample fixture while its producer completes the implementation.

| Ticket | Starts after | Owner and write area | Deliverable and evidence for the next owner |
|---|---|---|---|
| F · foundation | Start | Lead, root and CI | Clean build, scripts, agreed contract examples |
| D · design | F | Design, packages/ui and public/brand | Tokens, mark, controls, keyboard demo and two viewport captures |
| E · evaluator | F | Engine, packages/core and lab-schema | Versioned input/result types, schema checks, golden fixture |
| P · storage | F, agreed progress contract | Data, web/src/features/progress | Adapter with restore, migration, import and failure tests |
| L1 · pilot content | E contract | Curriculum, lab-content/mvp-01 | Reviewed choices, fixtures and expected results |
| W · workspace | D, E contract | Frontend, web/src/features/lab and labs pages | Pilot works against L1, E and P and survives reload |
| L2–L6 · content | W pilot acceptance | One owner per lab directory | Five independent reviewed lab packs and runner tests |
| N · navigation | D, catalog contract | Site, remaining pages/layouts | All routes, links, progress and responsive catalog states |
| Q · qualification | W, N, six lab packs | QA, e2e and audit evidence | Release report for Phase 5 |
| R · release | Q | Maintainer, hosting and release notes | Verified hostname, deployment ID and recovery procedure |

**Reusable assignment template.** “Implement ticket [ID] at commit [SHA]. Read spec §§[sections] and guide phase [number]. Own [paths]. Consume [contract/version/sample]. Deliver [behavior and tests]. Return changed paths, commit, exact check commands and results, unresolved decisions, and the ticket you unblock.” A subagent receives a narrower path and one acceptance case. Raise a contract-change issue with the input/output example and affected consumers before merging a breaking change. The lead integrates producers before consumers and repeats affected checks on the combined commit.

## Phase 1 · Design the learner experience

**Identity.** Use the SecureLab wordmark with the subtitle “Interactive API Security Academy” on the landing page. Draw an original monochrome mark on a 24-unit grid. Two open square brackets surround a check: left path M8 4 H4 V20 H8, right path M16 4 H20 V20 H16, check M8 12 L11 15 L16 9. Use 2-unit strokes, rounded joins and currentColor. Leave four units of clear space. Pair a 28 px mark with a 22 px semibold wordmark and 8 px gap. Simplify the brackets and pixel-check at 16 px. Deliver logo-mark.svg, horizontal lockup, light/dark favicon, 180 px touch icon and 1200×630 social preview. The home link has the accessible name “SecureLab home”. Hide decorative glyphs beside visible text.

**Interface kit.** Use the §12 dark palette. Page #0c0e11, panel #15191e, raised panel #20262c, primary text #eef2f4, secondary #a6b0ba, accent #8bd7b4. Use dark ink on mint buttons. Pair pass/check, fail/cross, caution/triangle, locked/padlock, hint/lightbulb, replay/rotate and run/play with text. Use one 24-unit outline icon set, 2-unit strokes, 16–20 px glyphs. Record provenance and license. Choose system UI and system monospace for fast offline rendering. Body 16/24 px, code 14/22, headings 24–40 px, 4/8/12/16/24/32 px spacing, 6 px controls, 12 px panels, 44 px target height. Use an explicit 2 px focus ring with offset. Verify actual foreground/background pairs, including borders of interactive inputs, with a contrast checker.

| Screen | What the learner sees and can do | State to test |
|---|---|---|
| / | Spec headline, Start learning button, compact sample lab with a membership rule and labeled result, topic highlights, curriculum and contribution links | Returning learner can resume; initial HTML explains the course before hydration |
| /learn and /learn/[module] | Module objectives, order, duration, prerequisites and badges; cover all six modules including capstones | Show future topics as planned text. Locked labs link to the prerequisite |
| /labs | Six playable entries with difficulty, duration and status; canonical link for each | New, active, complete, revised |
| /labs/[slug] | Breadcrumb and progress above Brief, Fix, Tests and Explain; sticky action bar | Direct-link locked lab shows its brief and prerequisite CTA; missing slug is a real 404 |
| /progress | Completion count out of six, best scores, hints, updated labs, resume, export/import/erase | Fresh, restored, unavailable storage, invalid import, all complete |
| /glossary, /about, /contribute | Linked definitions, scope of simulations, independent-project statement, authoring path | Keyboard navigation and working primary references |
| /privacy, /accessibility, 404 | Local data lifecycle and hosting disclosure, accessibility contact and controls, recovery links | Help reachable from every screen |

**Workspace composition.** At 1100 px and wider use a three-column grid, approximately 25/40/35, for scenario, policy and results. Display the fictional API contract beside its objective. Put candidate fixes in a labeled radio group with readable policy previews; use labeled selects for capstone rules. Make the expected invariant the first line of each result. Below 1100 px switch to Brief / Fix / Tests / Explain tabs. Preserve drafts, scroll code inside its panel, reserve space for the sticky action and phone safe area. Test at 320, 390, 768 and 1440 px and 200% zoom. Avoid clipping long policy names.

**Interaction.** Start in Brief on phones. Provide “Choose a fix” to move to Fix. Enable Run tests after a valid selection. A run moves the mobile view to Tests and announces a short count in a polite live region. Show details on demand with expectation, observed outcome, trust boundary and next hint. Explain shows the selected and corrected rule summaries, takeaway, common mistake and further reading. Keep Next lab explicit. Ctrl/Cmd+Enter runs within Fix; arrows/Home/End operate tabs; Escape closes the hint dialog and focus returns to its trigger. Respect reduced motion. Confirm destructive resets with a named action and Cancel. Prove the flow with keyboard alone before styling additional labs.

## Phase 2 · Freeze contracts and build the learning engine

1. Define LabDefinition using spec §8. Require stable ID/slug, integer content version, difficulty, minutes, prerequisite IDs, objective, synthetic scenario, display routes, numbered invariants, mode, candidate/rule IDs, validator ID, cases, three hint tiers, reasoning choices, explanation and edition-pinned references. Use a discriminated union for choose-fix and policy-editor. Both can show read-only defensive TypeScript. Policy editor inputs are finite choices over registered fields, operators and actions. Source Markdown compiles at build time with raw HTML disabled and reviewed HTTPS links.
2. Implement validate:labs. Parse all YAML as data; reject unknown keys and unsupported modes. Verify unique IDs/slugs, resolvable validators/policy IDs, exactly three ordered hints, at least three cases, unique case IDs, complete scoring weights, resolvable references to cases and an acyclic prerequisite graph. Verify a known-good policy passes every required assertion and each distractor fails its intended invariant. Emit file path, field and reason on error. Check primary reference destinations during editorial review.
3. Freeze a contract such as runLab(definition, selection, reasoningChoice) returning labId, version, passed, score breakdown, ordered case results and trace steps. Each case names its invariant, expected decision or output, fixed synthetic identity/resource/input and required assertions. Distinguish verified context from request fields in types. Use typed observations for decisions, public response fields, state transitions and pagination bounds. An allow/deny boolean alone cannot grade the profile and pagination labs.
4. Map selection IDs to reviewed policy data. For each case create fresh immutable fixtures, evaluate checks in declared order and record rule ID, verdict and learner-facing reason. Missing required context, unknown actions or unrecognized policies fail closed. Compare actual outputs with assertions by value. Model state changes in the returned result. Tests and runs perform no network or filesystem I/O. Render method/path, identity, trace and response as labeled simulation text. No user-provided code execution.
5. Score behavior out of 70 and boundary coverage out of 20 using the normalized passed weights within each group; round each subtotal once. Award 10 for the reviewed reasoning choice. Require all mandatory behavioral and boundary assertions to pass to unlock; show reasoning feedback and permit a retry for full points. Record hint tiers separately. Measure elapsed time outside the deterministic result. Use fixed ordering and test repeated runs and reordered irrelevant fixtures.
6. Define attempt states: untouched → draft → evaluated → completed. Editing after evaluation marks results stale until Run tests. Save attempts once per intentional run, disable duplicate submissions while processing, and never revoke an earned completion on a retry. A completed lab unlocks the next prerequisite-satisfied lab. Guided shows objective and hints; Practice reuses the fixtures with hints collapsed and supports a fresh attempt. Keep best score and last run distinct.

**Pilot acceptance example.** Project member, verified identity, permitted relationship → allow, expected project fields, trace ends “Membership confirmed”. Same project, verified identity without membership → consistent restricted response. Unknown project → same public restricted response. In the result panel a learner can identify exactly which requirement passed or failed. Replaying these cases in Vitest and the browser yields the same verdicts.

## Phase 3 · Deliver one complete lab and local progress

1. Wire the generated static slug page to a single React workspace island. Hydrate the selected lab and evaluator on lab routes only. The island owns draft, reasoning choice, active panel, hint tier and last result. Derive unlocks from catalog prerequisites and validated progress. Route page loads and browser back/forward must restore the same lab. Show a plain-language enable-JavaScript message for interactive controls.
2. Implement the spec §13 snapshot with schemaVersion, updatedAt and a record by lab ID. Store validated choice/rule IDs, version, attempts, distinct hint tiers, completion date and best score. Track prior-version completions separately. A revised lab displays “Updated · review available”; preserve prior unlocks and scores with the version that earned them. Initialize with no data and the first lab available.
3. Put read, update, export, import and erase behind one adapter. For concurrent tabs serialize read–modify–write transactions using IndexedDB transactions over the progress store. Use the same transaction for an attempt and its completion. Refresh other visible tabs after commit via BroadcastChannel or re-read on focus. Update the UI after commit; on blocked/failed writes show “Progress is saved for this session only” and keep export available.
4. Export a versioned JSON snapshot. Cap import at 256 KiB before parsing, validate types, dates, score ranges, known policy IDs and content versions, migrate older supported schemas, and reject unknown future versions without changing existing data. Preview the replacement count and confirm before atomic replacement. Ignore unknown future lab IDs with an explicit count in the preview. Keep newer content-version records as historical if interpretable. On corrupt storage offer export of recoverable records and explicit erase. Reset draft resets current choices; replay starts a new attempt; erase-all clears this site's progress after confirmation.
5. Bundle all assets needed for a loaded exercise before signaling “Ready”. Disconnect the network and verify hints, selection, grading, explanation and saving still work. For offline reload/navigation across all six, generate a small build-versioned service-worker precache manifest of the six pages, shell, local chunks and lesson data. Mark “Available offline” only after the full cache succeeds. Use same-origin GETs only, preserve real 404s, and handle missing cache entries with a recovery page. Keep a waiting update until tabs can safely reload; prune obsolete caches after activation. Keep progress outside asset caches. Test abandoned cache installation and a release update with a draft open.

**Gate.** Ship the pilot internally when a new learner can choose an incomplete policy, read a useful failure, use a hint, correct it, complete MVP-01, refresh and see MVP-02 unlocked. QA records desktop and phone evidence and the persisted snapshot. Freeze this pack as the authoring example.

## Phase 4 · Author the six lessons and finish navigation

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

## Phase 5 · Qualify a release candidate

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

## Phase 6 · Publish on an existing domain's subdomain

**Deployment choice.** Use Cloudflare Pages Free with Git integration and static Astro output. This supports an existing domain's subdomain even when its authoritative DNS stays with another provider. One subdomain under an already-owned domain requires no new registration; the parent domain retains its existing renewal cost. Free Pages currently allows 500 hosted builds/month, one concurrent build, 20 minutes per build, 20,000 files per site, 25 MiB per file and 100 custom domains per project. Six static lessons need no Functions, database, account service or paid runtime. Confirm the account plan and current limits at launch. [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) · [Subdomain setup](https://developers.cloudflare.com/pages/configuration/custom-domains/)

1. In Cloudflare **Workers & Pages**, create a **Pages** application using **Connect to Git**. Select the repository, limit the integration to that repo, set production branch to protected main, and use the repository root as build root so workspaces resolve. Use the tested Bun version via the build environment, and ensure the Node version matches CI. Configure build command `bun install --frozen-lockfile && bun run build`, output directory `apps/web/dist`. Set the public Astro site origin to the intended production HTTPS hostname at build time. Use static output with no SSR adapter. [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) · [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
2. Build a preview branch and smoke-test its deployment URL. Confirm preview pages discourage indexing, all scripts hydrate, and there are no function invocations. Merge only after required checks and review. Record the production pages.dev URL, deployment ID, commit and previous good deployment. Limit preview branches if automated pushes approach the monthly build allowance.
3. Choose a vacant label such as securelab under the owner's domain. Inspect existing DNS records at that exact name and confirm who controls them. In the Pages project select **Custom domains → Set up a domain**, enter the complete hostname and continue. For a zone managed in this Cloudflare account, confirm the proposed DNS record. For external authoritative DNS, add the displayed CNAME at that provider, e.g. name securelab, value project-name.pages.dev, with no scheme or path. Associate the name in Pages before relying on the CNAME. Leave unrelated website and mail records intact. Choose a vacant label if the preferred name already serves traffic. [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
4. Wait for the domain and managed certificate to show active. Verify HTTPS in a private browser and run the checks below with the actual host and slug. A proxied Cloudflare record may resolve as A/AAAA instead of exposing a public CNAME. If activation stalls, check authoritative DNS, conflicting records, certificate-validation redirects and restrictive CAA records using the custom-domain troubleshooting guide.
5. Run the six-lab smoke path on the custom origin, including an offline reload and progress export. Browser storage is origin-scoped; progress on the preview or pages.dev hostname transfers through export/import. Confirm canonical/share URLs, navigation, TLS, cache and security headers. Tag the verified commit v0.1.0 and publish release notes with the public URL.

```sh
host=securelab.example.com
dig +short "$host"
curl -sSI "https://$host/"
curl -sSI "https://$host/labs/tenant-isolation/"
curl -sSI "https://$host/this-page-does-not-exist"
```

Expected outcomes are DNS resolution, successful certificate validation, a successful final response for the two known pages (follow a canonical slash redirect if needed) and HTTP 404 for the missing page. Browser checks cover grading and storage, which HTTP probes cannot observe.

**Recovery.** If the release fails, open the Pages deployment history, select the previous successful production deployment and roll back. Record both deployment IDs, fix or revert the source change on main, run CI, then redeploy. On a previously used browser check for a waiting service worker, refresh online to activate the recovered bundle and confirm saved progress. Keep progress migrations backward-readable or preserve an exportable original across migration. Drill this sequence on a disposable project before relying on it. [Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)

## Phase 7 · Operate and extend

The maintainer checks failed builds, deployment status and certificate health after releases, reviews monthly build usage, and reruns the pilot after dependency or content changes. Track first-feedback time in usability sessions. Spec targets are 50% of starters completing the first lab and 15% completing all six. With analytics disabled these are research targets; collect consented aggregate counts only if the owner later adopts measurement. Keep editor contents, fixtures and learner identifiers out of telemetry.

For v0.2, expand toward the 24-topic catalog using the pilot template and graph checks. For v0.3, design optional account sync with conflict resolution, deletion and migration from local progress. Treat v0.4 advanced practice and v1.0 team learning as separate product reviews with their own cost, privacy and grading models. Maintain stable slugs and publish a content-version note when an invariant changes. Release reusable core and schema packages only after verifying package names, public interfaces, licenses and reproducible builds.

**Release record to complete.** Maintainer: ____ · commit/tag: ____ · verified HTTPS hostname: ____ · Pages deployment ID: ____ · prior good deployment: ____ · six lab reviewers: ____ · QA report: ____ · rollback drill date: ____ · known issues and owner: ____. The public-launch milestone closes when this record and the passing custom-origin smoke test are attached to the release.
