# Phase 2 · Freeze contracts and build the learning engine

[Plan index](README.md) · [Previous phase](01-design-system.md) · [Next phase](03-playable-pilot.md)

**Entry condition.** Foundation packages available. Start with a single synthetic project-membership fixture.

**Ownership.** Schema owner · packages/lab-schema. Engine owner · packages/core. Agree on types before parallel implementation.

## Work queue

| Ticket | Action | Acceptance evidence |
|---|---|---|
| [x] E1 | Publish the schema and sample input/output | L1 can author a lab; W can render a result; P knows exactly which identifiers to persist. |
| [x] E2 | Build catalog and reference validation | Invalid fixture files report stable, actionable diagnostics. |
| [x] E3 | Implement evaluation and result tracing | Run the same fixture twice and compare serialized results. Inputs remain identical after both runs. |
| [x] E4 | Verify scoring and completion independently | A required assertion failure blocks completion even with a high score. Hints have zero effect on correctness. |
| [x] E5 | Freeze the contract | Tag the contract version in the handoff and provide one passing and one failing result for UI tests. |

Local test evidence is recorded in the [release handoff](../docs/RELEASE.md).

## Implementation details

1. Define LabDefinition using spec §8. Require stable ID/slug, integer content version, difficulty, minutes, prerequisite IDs, objective, synthetic scenario, display routes, numbered invariants, mode, candidate/rule IDs, validator ID, cases, three hint tiers, reasoning choices, explanation and edition-pinned references. Use a discriminated union for choose-fix and policy-editor. Both can show read-only defensive TypeScript. Policy editor inputs are finite choices over registered fields, operators and actions. Source Markdown compiles at build time with raw HTML disabled and reviewed HTTPS links.
2. Implement validate:labs. Parse all YAML as data; reject unknown keys and unsupported modes. Verify unique IDs/slugs, resolvable validators/policy IDs, exactly three ordered hints, at least three cases, unique case IDs, complete scoring weights, resolvable references to cases and an acyclic prerequisite graph. Verify a known-good policy passes every required assertion and each distractor fails its intended invariant. Emit file path, field and reason on error. Check primary reference destinations during editorial review.
3. Freeze a contract such as runLab(definition, selection, reasoningChoice) returning labId, version, passed, score breakdown, ordered case results and trace steps. Each case names its invariant, expected decision or output, fixed synthetic identity/resource/input and required assertions. Distinguish verified context from request fields in types. Use typed observations for decisions, public response fields, state transitions and pagination bounds. An allow/deny boolean alone cannot grade the profile and pagination labs.
4. Map selection IDs to reviewed policy data. For each case create fresh immutable fixtures, evaluate checks in declared order and record rule ID, verdict and learner-facing reason. Missing required context, unknown actions or unrecognized policies fail closed. Compare actual outputs with assertions by value. Model state changes in the returned result. Tests and runs perform no network or filesystem I/O. Render method/path, identity, trace and response as labeled simulation text. No user-provided code execution.
5. Score behavior out of 70 and boundary coverage out of 20 using the normalized passed weights within each group; round each subtotal once. Award 10 for the reviewed reasoning choice. Require all mandatory behavioral and boundary assertions to pass to unlock; show reasoning feedback and permit a retry for full points. Record hint tiers separately. Measure elapsed time outside the deterministic result. Use fixed ordering and test repeated runs and reordered irrelevant fixtures.
6. Define attempt states: untouched → draft → evaluated → completed. Editing after evaluation marks results stale until Run tests. Save attempts once per intentional run, disable duplicate submissions while processing, and never revoke an earned completion on a retry. A completed lab unlocks the next prerequisite-satisfied lab. Guided shows objective and hints; Practice reuses the fixtures with hints collapsed and supports a fresh attempt. Keep best score and last run distinct.

**Pilot acceptance example.** Project member, verified identity, permitted relationship → allow, expected project fields, trace ends “Membership confirmed”. Same project, verified identity without membership → consistent restricted response. Unknown project → same public restricted response. In the result panel a learner can identify exactly which requirement passed or failed. Replaying these cases in Vitest and the browser yields the same verdicts.
