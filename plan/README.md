# SecureLab delivery plan

Use this directory to build the six-lab v0.1 release from an empty repository, deploy it to the owner's subdomain, and hand it over for maintenance. Begin with Phase 0. Each phase file contains its entry condition, file ownership, work queue, implementation details and acceptance evidence. Check off tickets as evidence becomes available.

| Phase | Work product | Dependencies and handoff |
|---|---|---|
| [0 · Foundation](00-foundation.md) | Reproducible static build, package boundaries, scripts and CI | Supplies the common starting commit for design and engine development |
| [1 · Design system and UX](01-design-system.md) | Logo, icons, tokens, accessible controls and responsive screen states | Runs alongside Phase 2. Supplies the workspace and public-page components |
| [2 · Schema and engine](02-schema-and-engine.md) | Content schema, deterministic evaluator, scoring, traces and sample results | Publish the contract early so pilot content and persistence can start |
| [3 · Playable pilot](03-playable-pilot.md) | MVP-01, progress adapter, offline experience and tested authoring example | Integrates design, engine and storage. Acceptance unblocks the other five lab packs |
| [4 · Curriculum and site](04-curriculum-and-site.md) | Five additional labs, curriculum navigation, glossary, progress and public pages | Lab authors work independently. Integrate all six before release qualification |
| [5 · Release qualification](05-release-qualification.md) | Tested release candidate, accessibility review and release recommendation | Hand the exact verified commit to the release maintainer |
| [6 · Cloudflare release](06-cloudflare-release.md) | Verified HTTPS subdomain, deployment record and rollback drill | Requires the real hostname and access to Pages and DNS |
| [7 · Operations](07-operations.md) | Maintenance cadence, incident ownership and post-MVP backlog | Starts when the public release has an identified maintainer |

## Assign and integrate work

1. The lead claims the next dependency-ready ticket and records its owner, base commit and write area. A solo implementer uses the same queue in dependency order.
2. Give each agent the phase file, ticket, interface version, relevant spec sections and expected acceptance evidence. A subagent can own a disjoint file set or review one acceptance case. Keep shared schemas, the lockfile and catalog manifest with their named owners.
3. The worker returns the change location, tested commit, exact checks, results, remaining issues and next consumer. Integrate contract producers before their consumers. Run the phase gate against the integrated commit.
4. Record progress in the project's issue tracker or a shared copy of the table below. The next agent resumes from the last verified commit and the first open ticket.

| Ticket | Owner / write area | Base or merged commit | State | Evidence / next action |
|---|---|---|---|---|
| F1 | Lead / decisions | Set when assigned | Ready | Record scope and owner inputs |

**Launch milestone.** A first-time learner can complete all six labs at the public HTTPS hostname, receive deterministic feedback, close the browser, and return to saved progress. The release record identifies the build, reviewers, verified hostname and recovery baseline. Phase 7 continues after launch.

The phase numbering follows the eight-phase implementation guide. The product specification supplies the original requirements, lesson definitions and longer-term roadmap. [Implementation guide](../IMPLEMENTATION_GUIDE.md) · [Product specification](../SECURELAB_API_PROJECT_SPEC.md)
