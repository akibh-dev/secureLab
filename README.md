# SecureLab

SecureLab is an interactive API security academy in development. The foundation includes a static Astro homepage, a custom missing-page route and workspace packages for the six planned lessons.

## Local development

Install the versions of Node and Bun listed in .node-version and .bun-version. Run from the repository root.

```sh
bun install --frozen-lockfile
bun run dev
```

Open the localhost URL printed by Astro. For a production preview, run `bun run build` and then `bun run --cwd apps/web astro preview`. The static output lives in apps/web/dist.

## Check a change

```sh
bun run lint
bun run typecheck
bun run validate:labs
bun run test
bun run build
bunx playwright install --with-deps chromium
bun run test:e2e
```

The browser test starts the built site's preview server. For local machines with an existing Chromium installation, set CHROMIUM_PATH to its executable. CI uses Playwright's managed Chromium. Use `bunx prettier --write <file>` to format a changed source file.

## Handoff

Design and engine contributors start from the same foundation commit on main. Record `git rev-parse HEAD` when claiming a ticket. Design owns packages/ui and the brand assets. Engine owns packages/core and packages/lab-schema. Catalog tests illustrate the shared summary contract. The CI job named foundation runs for pushes to main and pull requests.

[Delivery plan](plan/README.md) · [Foundation decision](docs/decisions/0001-static-foundation.md) · [Design assignment](plan/01-design-system.md) · [Engine assignment](plan/02-schema-and-engine.md)
