# Static foundation for v0.1

SecureLab will publish six reviewed lessons as static Astro pages on Cloudflare Pages Free. A React island will run the learning workspace. The browser will evaluate reviewed policy choices against fictional fixtures and keep versioned progress in IndexedDB. The foundation ships the homepage and missing-page recovery first.

| Owner       | Write area                            | Contract                                                                                           |
| ----------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Design      | packages/ui and apps/web/public/brand | Presentational components receive props and emit user actions.                                     |
| Engine      | packages/core and packages/lab-schema | Pure TypeScript uses serializable inputs and results. Schema owns shared types and Zod validation. |
| Curriculum  | packages/lab-content                  | Export the reviewed catalog. Stable IDs and slugs are unique.                                      |
| Application | apps/web                              | Compose packages, routes and browser storage.                                                      |

The initial catalog is empty. The schema tests include a sample summary and a duplicate-entry diagnostic for consumers. Phase 2 extends this contract with fixtures, invariants and scoring. The integrator owns root configuration, dependencies, lockfile and CI.

Before public release, the owner selects the hostname, confirms DNS access and the private disclosure contact, and approves the software and curriculum licenses. These inputs are needed in the publication phase.
