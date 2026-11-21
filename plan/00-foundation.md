# Phase 0 · Establish the project and divide the work

[Plan index](README.md) · [Next phase](01-design-system.md)

**Entry condition.** Repository and specification available.

**Ownership.** Lead integrator · repository root, apps/web scaffold, shared configuration and .github/workflows.

## Work queue

| Ticket | Action | Acceptance evidence |
|---|---|---|
| [x] F1 | Record stack, architecture boundaries and owner inputs | Decision record names the six-lab MVP, static build and local progress model. |
| [x] F2 | Create the workspaces and static shell | Fresh install serves a homepage and builds a top-level 404.html. |
| [x] F3 | Connect local checks and mirrored-main CI | Local checks pass; record a GitHub Actions run for the same SHA as Forgejo main. |
| [x] F4 | Publish the first handoff | Design and engine owners can each start from the same SHA and locate their write areas. |

## Foundation handoff

The [foundation decision](../docs/decisions/0001-static-foundation.md) records the architecture and owner inputs. The [root README](../README.md) gives the clean-build and verification commands. Start design and engine work from the initial foundation commit on main. The catalog contract and examples live in packages/lab-schema/src.

F3 includes a host-side acceptance test. The foundation workflow runs lint, type checks, catalog validation, unit tests, build and browser checks. Forgejo main and GitHub matched at df6cc7e after the workflow merge. [Forgejo PR #1](https://git.akibh.dev/akib/secureLab/pulls/1) · [Passing GitHub CI](https://github.com/akibh-dev/secureLab/actions/runs/44664076994)

## Implementation details

1. Start in the repository root. Keep the specification as the source of product intent. Record implementation decisions in docs/decisions/. Use the free, static path throughout this release. Treat the real hostname, license approval, disclosure contact and DNS access as owner inputs for publication. Use securelab.example.com in examples.
2. Create a private root package with Bun workspaces for apps/* and packages/*, Turbo tasks for build/check/test, one committed bun.lock, strict TypeScript and shared formatting/lint rules. Pin compatible Bun and Node versions in the repo and CI. Scaffold an Astro static site in apps/web, add its official React integration, and enable HTML output per route. Keep the starting app small enough to verify a clean build before adding content.
3. Create packages/core (pure TypeScript), packages/lab-schema (Zod and shared contracts), packages/lab-content (reviewed YAML, Markdown, fixtures), packages/ui (presentational React and CSS). Keep pages, data loading and persistence in apps/web. Core consumes contract types, content validates against schema, the app composes all four. UI receives data and events as props. CI rejects server-only imports in browser packages.
4. Give root package scripts stable meanings. Use bun run dev for Astro, lint for all workspaces, typecheck for TypeScript plus Astro templates, validate:labs for the catalog checks below, test for Vitest, build for the validated Astro distribution, and test:e2e for Playwright against the built site. Put Playwright browsers in the development/CI setup. Document prerequisites and the localhost URL printed by dev.
5. Run the Phase 5 checks locally on the integrated phase branch before opening its Forgejo PR into main. After merge, the VPS mirrors main to GitHub and the push triggers read-only CI. Record the merged SHA and matching GitHub run. Gate this phase on a fresh checkout producing apps/web/dist/index.html and a real 404.html.

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
