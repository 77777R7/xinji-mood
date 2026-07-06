# Today V1 Freeze

Status: frozen for MVP flow expansion  
Last updated: 2026-06-13

Today V1 is now treated as the first stable interaction loop:

```text
select mood/body
-> tap to speak
-> review/edit transcript
-> OK auto-saves today's trace
-> What we're noticing updates
-> card can flip to explain why Mood AI noticed it
```

## Frozen Scope

Do not make broad visual or interaction changes to Today V1 while building the
next MVP pages.

Allowed changes:

- obvious bug fixes
- accessibility fixes
- layout fixes for overlap or text clipping
- code extraction that preserves the same behavior
- wiring shared data into Patterns or Actions

Avoid for now:

- new Today sections
- new confirmation steps
- changing the recording flow
- changing the nav model
- replacing the trace card concept
- reworking the visual style

## Shared Trace Source

The reusable Today trace logic has moved into:

```text
src/trace/types.ts
src/trace/traceIconDictionary.ts
src/trace/mockTrace.ts
```

Patterns and Actions should import trace keys, trace chains, mock extraction,
and icon metadata from these modules instead of defining their own local copies.
