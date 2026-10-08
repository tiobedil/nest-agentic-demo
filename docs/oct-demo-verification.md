# Inspection Planning verification

## Scope and current requirements

Checked `/inspection-planning` (with a compatibility redirect from `/oct-demo`) against `Demo2_Resident_Aware_Bulk_Inspection_Planning.md`, with `/pgagent1` and `/pgagent2` as interface references. The project uses React, Tailwind, shared UI components, and Plus Jakarta Sans. Repository and global `AGENTS.md` conventions apply.

The user's refinements take precedence:

- Identical opening copy and shared PromptBar; any non-empty prompt starts the fixed scenario.
- All operation content appears in assistant messages.
- No additional prompt focus ring, Thinking container, restart button, or redundant working footer.
- Reply text streams before Thinking. Reveal completed actions and the current action only; never preview future steps. Planning, route optimisation, and approval review end with `Generating UI`; final execution ends with `Sending resident notifications` and has no `Generating UI` step. Skeletons and cards appear only after every action has completed.
- Main actions use the Extension Demo dimensions: full width, 40 px height, 16 px semibold text.
- Prompts and appointment/confirmation decisions append messages instead of replacing existing replies. Previous message actions are disabled.
- Skeletons render the actual card components with masking, not separately maintained placeholder layouts. UI changes therefore update their loading layouts automatically.
- Floor timelines use a fixed 16 px gap, no outer line segments, no arrow, and horizontal scrolling instead of wrapping on narrow screens. All floor markers are neutral except Amar’s constraint marker: yellow at the unchanged 4:30 PM appointment and purple after moving to 5:45 PM.
- Route completion uses a light-green banner with vertically centered icon and text. The final result has no status pill and uses plain check icons for its six outcome rows.
- Automatically follow a newly arriving reply while it is generating. Stop following when that reply becomes interactive. Initial card order is Tower C summary, Technician 4 route, then Requires review; focus the Tower C summary after loading. Radio changes and disclosure controls never trigger bottom scrolling.
- Use product language in the interface, navigation, page title, and result copy. Keep implementation and fixture limitations documented here rather than in user-facing labels.

## Scenario coverage

| Document step | Implementation |
| --- | --- |
| 1. Bulk instruction | Arbitrary input remains in its user bubble. The assistant streams the fixed Tower C scope and date, runs planning actions, generates UI, then loads the cards. |
| 2. Tentative plan | Tuesday, 13 October; 116 apartments; six technicians; 9:00 AM–6:00 PM; 115 standard appointments; one clickable review action. |
| 3. Resident checkpoint | Amar Sundaran, Unit 605; all three evidence items; failed-access risk; selectable 4:30 PM and 5:45 PM options; explicit approval. |
| 4. Original route | The documented eight stops, floor pills, and resident constraint label appear in the planning reply. The subsequent routing reply shows no cards until all five Thinking actions complete, then loads a matching skeleton and starts with the original sequence. |
| 5. Minimum adjustment | Approval adds a user message and routing reply. Only Amar and Unit 205 exchange appointments, using unit-keyed row movement. The earlier reply stays intact. |
| 6. Automatic impact check | The routing introduction explains the impact before Thinking. After Generating UI completes, the persistent schedule animates the minimum adjustment, pauses briefly, and automatically regroups the route. No second optimisation approval is required. |
| 7. Re-optimisation | Seven visits regroup as documented; Amar stays at 5:45 PM. The movement finishes before completion text streams. No time-saving metrics are invented. |
| 8. Building-level approval | A new assistant message shows the compact building-level summary and approval actions. The earlier route stays in history instead of being replaced. Full schedule review covers 116 appointments. |
| 9. Commit point | Confirmation adds a user message and execution reply. Publishing and notification actions take several seconds; the previous confirmation button is disabled. |
| 10. Success | The Inspection plan live title, 116/116 scheduled, six plain outcome checks, and the first inspection at Tuesday 9:00 AM. No additional status pill is shown. |

Keeping 4:30 PM follows a separate approval path, preserving the failed-access warning and never claiming that Amar was moved. Further prompts start a new fixed scenario without erasing previous decisions or results. Radio groups and schedule disclosures have message-specific identifiers. Historical buttons and radio controls are disabled; stale decision handlers also reject outdated message identifiers.

## Interface review

| Domain | Evidence | Result |
| --- | --- | --- |
| Accessibility | Native actions and radios; disclosure state; skeletons hidden from assistive technology; automated axe checks | No automated violations in tested desktop/mobile conversation states. Prompt focus ring omitted by explicit user request. |
| Layout | Reference source and browser geometry; 320 px layout | Opening prompt geometry matches Extension Demo 2 at 1440 px. Same white background, column, user bubbles, and bottom PromptBar. No tested Oct Demo content overflow at 320 px. |
| Writing | Streamed introductions, observable actions, tentative/live labels, alternate-path warnings | Each new reply describes its next operation. No internal reasoning is displayed. |
| Typography | Shared font and rendered control sizes | Plus Jakarta Sans; reference heading scale; slate hierarchy; tabular appointment times; full-width 40 px actions with 16 px semibold labels. |
| Color | Rendered automated contrast checks | No automated contrast violations in tested Oct Demo states. Main actions use violet-600 and white. |
| UI polish | Bare Thinking; synchronized skeleton and real card dimensions; persistent route identity | Shared Card, Button, PromptBar, Thinking, and StreamingText are reused. Reduced motion disables route movement without removing final labels or order. |

## Verification

Passed:

- `npm run build`.
- `npm run lint`: existing project warnings remain; no errors.
- `node --test tests/inspection-plan.test.ts`: four tests cover exact routes, the minimal exchange, Amar's fixed constraint, and 116 unique apartments across six conflict-free schedules.
- Browser checks: arbitrary prompts, matching opening geometry, no added prompt outline, streaming before Thinking, no preview of future actions at any observed Thinking progress, bare Thinking, and no `Generating UI` action in final execution. Skeletons wait until all phase actions complete, and their dimensions match the real cards.
- Browser checks: full-width 40 px actions, append-only decision messages, preservation of old card content, disabled old controls, persistent Amar row during automatic optimisation, six-technician full schedule, and both appointment branches.
- Browser checks: a new arbitrary prompt disables a still-pending appointment button; dispatching a stale button event does not create another message.
- Browser checks: matching neutral floor styles for Units 602–604 and 202–205, yellow Amar row/pill/marker while at 4:30 PM, purple after moving to 5:45 PM, exact 16 px timeline gap, and no exterior line segments or arrow.
- Browser checks: centered green success banner, no final status pill, plain check icons, incoming-message following during Thinking/loading, the summary → route → resident review card order, summary-card focus, and unchanged scroll position after radio selection, schedule review, or disclosure expansion.
- Browser checks: operational navigation and browser title, no user-facing occurrence of the removed presentation label, and compatibility redirect to `/inspection-planning`.
- Browser checks at 320 px with reduced motion: no page content overflow, a single-row horizontally scrollable timeline, no overflowing resident-row text, zero route transition duration, and no automated accessibility violations in the tested conversation area.

To repeat browser checks without modifying repository dependencies, start `npm run dev`, then run:

```sh
npm install --prefix /tmp/oct-demo-check playwright @axe-core/playwright --no-save --ignore-scripts
/tmp/oct-demo-check/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/oct-demo-check/node_modules node tests/oct-demo.browser.cjs
```

Optional environment variables: `DEMO_BASE_URL` for another development server and `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for an existing Chromium executable. Model tests require Node.js 24 or a TypeScript-capable test runner.

Not verified: manual screen-reader use, real-device touch behaviour, full shared-navbar accessibility, and every state of Extension Demo 1 and 2. Their opening layouts and shared components are the comparison boundary, not a full audit of those flows.

## Data boundary

The supplied document specifies only Technician 4's eight afternoon visits. The other 108 appointments are generated illustrative fixtures. The interface presents the supplied workflow as an operational scenario, but no backend publishing or real notification delivery occurs. Removing presentation-only copy does not change that implementation boundary.
