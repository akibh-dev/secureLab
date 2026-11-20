# Phase 6 · Publish on an existing domain's subdomain

[Plan index](README.md) · [Previous phase](05-release-qualification.md) · [Next phase](07-operations.md)

**Entry condition.** Qualified release SHA, owner-selected hostname, access to the Pages project and authoritative DNS.

**Ownership.** Release maintainer owns deployment. DNS owner handles the chosen record. QA independently checks the public origin.

## Work queue

| Ticket | Action | Acceptance evidence |
|---|---|---|
| [ ] R1 | Configure Pages and test the qualified build on preview | Capture commit, URL, build settings and browser checks under real headers. |
| [ ] R2 | Associate the vacant subdomain and verify TLS | Confirm Pages activation and successful HTTPS on the chosen hostname. |
| [ ] R3 | Run public-origin acceptance | Record canonical URL, working lab, saved progress, offline reload, deep links and 404 evidence. |
| [ ] R4 | Verify recovery and publish release record | Identify prior good deployment. For the first release rehearse on a disposable project with two versions; record the first good production ID as the baseline. |
| [ ] R5 | Transfer ownership | Attach the completed release record and name the person monitoring the launch. |

## Implementation details

**Deployment choice.** Use Cloudflare Pages Free with Git integration and static Astro output. This supports an existing domain's subdomain even when its authoritative DNS stays with another provider. One subdomain under an already-owned domain requires no new registration; the parent domain retains its existing renewal cost. The guide records these Free Pages limits for November 2026 — 500 hosted builds/month, one concurrent build, 20 minutes per build, 20,000 files per site, 25 MiB per file and 100 custom domains per project. Six static lessons need no Functions, database, account service or paid runtime. Confirm the account plan and current limits at launch. [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) · [Subdomain setup](https://developers.cloudflare.com/pages/configuration/custom-domains/)

1. In Cloudflare **Workers & Pages**, create a **Pages** application using **Connect to Git**. Select the GitHub mirror, limit the integration to that repo, set the production branch to main, and use the repository root as build root so workspaces resolve. Use the tested Bun version via the build environment, and ensure the Node version matches CI. Configure build command `bun install --frozen-lockfile && bun run build`, output directory `apps/web/dist`. Set the public Astro site origin to the intended production HTTPS hostname at build time. Use static output with no SSR adapter. [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) · [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
2. Test the release candidate locally and smoke-test the Pages deployment URL before attaching the production hostname. Confirm scripts hydrate and the static deployment serves the qualified commit. Verify the mirrored GitHub CI result for that SHA before release sign-off. Record the production pages.dev URL, deployment ID, commit and previous good deployment. Limit preview branches if automated pushes approach the monthly build allowance.
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

**Recovery.** If the release fails, open the Pages deployment history, select the previous successful production deployment and roll back. Record both deployment IDs, submit the fix or revert through a Forgejo PR, then verify the mirrored CI run and resulting deployment. On a previously used browser check for a waiting service worker, refresh online to activate the recovered bundle and confirm saved progress. Keep progress migrations backward-readable or preserve an exportable original across migration. Drill this sequence on a disposable project before relying on it. [Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
