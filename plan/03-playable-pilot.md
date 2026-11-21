# Phase 3 · Deliver one complete lab and local progress

[Plan index](README.md) · [Previous phase](02-schema-and-engine.md) · [Next phase](04-curriculum-and-site.md)

**Entry condition.** Pilot definition and result contract agreed. Storage work can begin before the UI is ready.

**Ownership.** L1 owns packages/lab-content/mvp-01; P owns progress adapter; W owns lab route and shell. Assign cache integration to one app owner.

## Work queue

| Ticket | Action | Acceptance evidence |
|---|---|---|
| [x] L1 | Write the MVP-01 authoring example | Reviewed fixtures cover membership, missing context and restricted response consistency. |
| [x] P1 | Implement versioned progress and import/export | Round trip an export, cancel a replacement and exercise simultaneous saves. |
| [x] W1 | Connect brief, choices, hints, results and explanation | One learner can fail, correct, complete and explicitly continue. |
| [x] W2 | Integrate restore and offline behavior | Reload preserves the draft; the pilot works after disconnecting. Generate the manifest from published labs so it expands in Phase 4. |
| [x] W3 | Accept the vertical slice | Capture the pilot journey and verify the MVP-02 unlock condition with catalog metadata. Real navigation to playable MVP-02 is verified in Phase 4. |

Local test evidence is recorded in the [release handoff](../docs/RELEASE.md).

## Implementation details

1. Wire the generated static slug page to a single React workspace island. Hydrate the selected lab and evaluator on lab routes only. The island owns draft, reasoning choice, active panel, hint tier and last result. Derive unlocks from catalog prerequisites and validated progress. Route page loads and browser back/forward must restore the same lab. Show a plain-language enable-JavaScript message for interactive controls.
2. Implement the spec §13 snapshot with schemaVersion, updatedAt and a record by lab ID. Store validated choice/rule IDs, version, attempts, distinct hint tiers, completion date and best score. Track prior-version completions separately. A revised lab displays “Updated · review available”; preserve prior unlocks and scores with the version that earned them. Initialize with no data and the first lab available.
3. Put read, update, export, import and erase behind one adapter. For concurrent tabs serialize read–modify–write transactions using IndexedDB transactions over the progress store. Use the same transaction for an attempt and its completion. Refresh other visible tabs after commit via BroadcastChannel or re-read on focus. Update the UI after commit; on blocked/failed writes show “Progress is saved for this session only” and keep export available.
4. Export a versioned JSON snapshot. Cap import at 256 KiB before parsing, validate types, dates, score ranges, known policy IDs and content versions, migrate older supported schemas, and reject unknown future versions without changing existing data. Preview the replacement count and confirm before atomic replacement. Ignore unknown future lab IDs with an explicit count in the preview. Keep newer content-version records as historical if interpretable. On corrupt storage offer export of recoverable records and explicit erase. Reset draft resets current choices; replay starts a new attempt; erase-all clears this site's progress after confirmation.
5. Bundle all assets needed for a loaded exercise before signaling “Ready”. Disconnect the network and verify hints, selection, grading, explanation and saving still work. For offline reload/navigation across all six, generate a small build-versioned service-worker precache manifest of the six pages, shell, local chunks and lesson data. Mark “Available offline” only after the full cache succeeds. Use same-origin GETs only, preserve real 404s, and handle missing cache entries with a recovery page. Keep a waiting update until tabs can safely reload; prune obsolete caches after activation. Keep progress outside asset caches. Test abandoned cache installation and a release update with a draft open.

**Gate.** Ship the pilot internally when a new learner can choose an incomplete policy, read a useful failure, use a hint, correct it, complete MVP-01, refresh and see MVP-02 unlocked. QA records desktop and phone evidence and the persisted snapshot. Freeze this pack as the authoring example.
