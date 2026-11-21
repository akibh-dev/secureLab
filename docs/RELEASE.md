# SecureLab release handoff

Run the checks on the phase branch before requesting review. After the owner merges on Forgejo, verify the matching GitHub Actions run before signing off on a production deployment. [Verification commands](../README.md#check-a-change) · [Cloudflare procedure](../plan/06-cloudflare-release.md)

In the connected Pages project use repository root, build command `bun install --frozen-lockfile && bun run build` and output directory `apps/web/dist`. Set `SITE_URL` to the approved HTTPS origin in production. It drives canonical URLs and the sitemap. Set the pinned Node and Bun versions from the repo's version files. Run the preview/local qualification on the same commit. The build produces the offline worker and generated Cloudflare header rules.

Record the release SHA, successful CI run, Pages deployment ID, verified hostname, qualification results and recovery deployment. Test HTTPS home, a deep lab URL, unknown URL, the full learner path and offline reload. On failure, restore the previous good Pages deployment and correct the source through Forgejo review. Check the resulting browser update while preserving local drafts.

Review availability and certificate status after releases. Review build allowances, dependencies, accessibility reports and source references monthly. Assign each issue an owner and verify the fix on the same release path.

## Local qualification

The full suite passed using Node 24.18.0, Bun 1.4.3 and Chromium. Catalog validation accepted six lessons. Vitest passed four unit tests and Playwright passed ten cases. The browser suite exercises the six labs at two viewport sizes, takes mobile and desktop screenshots, checks WCAG rules with axe, verifies saved progress with two tabs and blocked storage, and reloads a lab offline. Preview applies the generated Pages content security policy during tests. The build contains 36 files, with the largest file about 208 KiB. The high-severity dependency audit passed after upgrading Astro and its React integration.

Before public sign-off, complete the independent curriculum review, manual screen-reader pass, license and disclosure-contact approval, and the Cloudflare preview, DNS, HTTPS and rollback checks. Lessons use validated YAML metadata and plain Markdown paragraphs. CI checks that the compiled catalog matches the authored packs.
