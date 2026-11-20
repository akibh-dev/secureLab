# SecureLab agent workflow

Forgejo on the owner's VPS is the source of truth. The owner mirrors its main branch to GitHub. Use the configured Forgejo origin for development and the configured Git author identity for commits.

1. Read the relevant phase in [the delivery plan](plan/README.md). Fetch origin, start a branch such as `phase/01-design-system` from `origin/main`, and record the starting SHA. When resuming a phase, use its existing branch.
2. Commit one reviewable change at a time. Keep a behavior change with its tests, run the relevant checks, and use a subject that states what changed. For parallel work, integrate contributors' commits into the shared phase branch. The phase lead owns integration and the final PR.
3. At phase end, integrate the latest Forgejo main and run the [local verification suite](README.md#check-a-change) on the resulting phase head. Push the phase branch to origin and open one Forgejo PR targeting main. Include phase tickets, the tested SHA, commands and results, and any outstanding issues. Apply review fixes as small commits on the same branch and recheck them.
4. Leave the phase PR open for the owner to merge on Forgejo. The existing mirror delivers that main commit to GitHub, where the main push starts SecureLab CI. Record the Forgejo PR, merged SHA and corresponding run from [GitHub Actions on main](https://github.com/akibh-dev/secureLab/actions/workflows/foundation.yml?query=branch%3Amain) in the phase handoff.
5. If the run is missing, compare the two main SHAs. A mismatch points to mirror delivery; matching SHAs call for checking GitHub Actions and the workflow at that commit. If CI fails, inspect its first failing step, reproduce it locally, and send the correction through a Forgejo follow-up PR. Verify the resulting mirrored SHA and run.

Pre-merge evidence comes from the phase branch's local checks. GitHub supplies post-merge CI evidence. Keep implementation branches and PRs on Forgejo.
