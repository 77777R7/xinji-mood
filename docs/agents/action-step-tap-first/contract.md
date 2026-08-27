# ActionStep Tap-First Foundation

Status: completed

## Goal

Upgrade the existing Rora action foundation so current actions can be completed through lightweight taps first, with writing as optional support instead of the default burden.

## Roles

- Planner: keep the slice limited to ActionStep schema, existing six action definitions, UI rendering, docs, and tests.
- Generator: implement the smallest functional tap-first foundation.
- Evaluator: verify by typecheck, contract tests, semantic searches, and local web export/8083 smoke check when feasible.

## Done Means

- `ActionStep` supports `options`, `multi_choice`, and optional note fields.
- Existing six actions remain the only action ids; no new actions are added in this slice.
- Body Scan uses tap-first steps: a no-text breath step, body-location choices, and soften choices.
- Fact / Guess / Worry remains intact but is prepared for future confirm/edit by optional option metadata rather than AI prefill.
- Name the Loop is updated toward loop nickname language without requiring new persistence fields.
- Tiny Next Step uses direction choices and a first-30-seconds step instead of relying on a timing prompt.
- Evening Unload has stronger nighttime/mental-tab copy while preserving current routing.
- Kind Reframe becomes less therapy-coded in copy while preserving id compatibility.
- Action UI can render `none`, `single_choice`, and `multi_choice` steps without forcing text input.
- Saved `answers` remain `Record<string, string>` for MVP compatibility.
- `npm run test:contract` and `npm run typecheck` pass in a clean build context.

## Out Of Scope

- Adding the six new proposed actions.
- New artwork generation.
- New backend persistence tables.
- Sending, publishing, or changing external account settings.
- Reworking Weekly Reflection UI beyond keeping action data compatible.

## Stop Conditions

- Stop if action UI requires a product judgment not covered by this contract.
- Restart if the current App.tsx path is too tangled and a smaller renderer helper is needed.
- Ask the user before expanding into new action ids or major visual redesign.
