# 心迹Mood

心迹Mood is a warm emotional and body pattern tracker. The MVP is optimized for
one value moment:

> Record a 30-second check-in, review what was heard, and see a Pattern Card
> that helps the user understand a recurring emotional/body loop.

## Current Source Of Truth

- [MVP data contract](docs/mvp-data-contract.md): draft/save flow, object model,
  API boundaries, and frontend state flow.
- [MVP TypeScript types](docs/mvp-types.ts): implementation-ready type draft for
  the first Expo/React Native build.
- [Design system](docs/design-system.md): visual language, image generation
  rules, trace icon dictionary, and icon quality gate.
- [Prototype assets](assets/prototypes): generated visual direction for the MVP
  screens and Today voice check-in.

## MVP Build Order

1. Implement the `CheckInDraft` lifecycle locally with mock data.
2. Build Today voice flow: record, transcribe mock, review transcript.
3. Generate a draft Pattern Card with evidence, confidence, and feedback.
4. Save only after user confirmation.
5. Feed saved check-ins into Patterns, Actions, and Weekly Report.
