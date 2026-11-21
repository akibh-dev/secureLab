# Phase 1 · Design the learner experience

[Plan index](README.md) · [Previous phase](00-foundation.md) · [Next phase](02-schema-and-engine.md)

**Entry condition.** Foundation build and shared folder layout available. Runs alongside Phase 2.

**Ownership.** Design owner · packages/ui and apps/web/public/brand. Delegate brand assets and accessible controls separately.

## Work queue

| Ticket | Action | Acceptance evidence |
|---|---|---|
| [x] D1 | Draw, export and inspect the identity assets | Mark remains recognizable at 16 px; wordmark, favicon, touch icon and social preview are present. |
| [x] D2 | Implement tokens, icons and controls | Contrast measurements and focus examples cover normal, selected, disabled and feedback states. |
| [x] D3 | Compose responsive screens with fixture data | Captures show the catalog, progress and lab at phone and desktop widths, including failed and completed states. |
| [x] D4 | Walk through the prototype using only the keyboard | A reviewer can reach a hint, dismiss it, run tests and inspect results. Hand off component props and state examples to W and N. |

Local test evidence is recorded in the [release handoff](../docs/RELEASE.md).

## Implementation details

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
