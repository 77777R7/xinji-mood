# 心迹Mood Design System

Status: source of truth for visual generation and UI asset direction  
Last updated: 2026-06-13

This document defines the MoodTrace / 心迹Mood visual system. Future generated
images, UI icons, prototype screens, and Figma assets should follow this system.

The rule is simple:

> Do not invent a new style for each new asset. Generate within the existing
> 心迹Mood paper-journal style, and expand it through a finite semantic icon
> dictionary.

## Visual North Star

心迹Mood should feel like:

- a premium emotional journal
- a warm body-and-mind pattern notebook
- a gentle self-awareness tool
- hand-made, calm, trustworthy, and lightweight

It should not feel like:

- a clinical dashboard
- a sci-fi AI product
- a generic chatbot
- a childish sticker pack
- a habit-tracking pressure tool

## Core Visual Language

Use the existing Today page as the visual baseline:

- paper-textured ivory background
- soft cream cards
- hand-drawn clay-coral, amber, and sage icon assets
- dark-brown crayon or ink-like outlines
- calm serif titles
- compact sans-serif labels
- soft, low-contrast dividers and shadows

### Palette

Use this palette family when generating or implementing assets:

| Role | Color |
| --- | --- |
| Paper background | `#f3e8d3` |
| Card | `#f8f3e6` |
| Card light | `#fbf4e6` |
| Nav / soft surface | `#efe2cc` |
| Primary text | `#2c3236` |
| Warm body/text brown | `#4a3f33` |
| Muted text | `#8a7a68` |
| Clay coral | `#e85d42` to `#f0784f` |
| Warm amber | `#e8a83b` to `#f2b950` |
| Sage | `#8f9b69` to `#a9b58a` |
| Dark outline | `#3f2f24` |

Avoid neon, cyber colors, medical blues, strong gradients, and pure black.

### Typography

- Use a warm serif for page and section titles, matching the current Georgia-like
  style.
- Use a clean sans-serif for labels and supporting text.
- Do not bake text into generated icons. All UI text must remain editable and
  i18n-ready.

## Icon System Principle

User language is infinite. The icon system must be finite.

Do not create one icon for every possible user phrase. Instead:

```text
raw user words
-> AI extraction
-> normalized semantic key
-> finite icon dictionary
-> icon + editable text label
```

Examples:

```text
"my boss questioned my work"
-> normalizedKey: work_feedback
-> iconKey: work_feedback
-> label: Work feedback
```

```text
"my landlord emailed me and I worried about money"
-> normalizedKey: money_stress
-> iconKey: money_stress if available, otherwise generic_trigger
-> label: Money stress
```

### Required Display Rule

Never rely on icon-only meaning for trace nodes.

Every icon in `What we’re noticing`, Pattern Cards, Actions, and Weekly Report
must have a text label below or beside it.

Correct:

```text
[icon] Work feedback
```

Incorrect:

```text
[icon only]
```

## Trace Icon Dictionary

The Trace Icon Dictionary is the bridge between AI output and UI rendering.

Each icon entry should have:

```ts
{
  key: string;
  category: 'trigger' | 'thought' | 'body' | 'behavior' | 'sleep' | 'emotion' | 'unknown';
  defaultLabel: string;
  iconAsset: string;
  fallbackIconKey: string;
  aliases: string[];
}
```

The AI should return stable keys, not free-form visual instructions. The UI maps
those keys to assets.

### Homepage Rule

`What we’re noticing` should show at most 4 nodes.

Priority:

```text
trigger -> thought pattern -> behavior/sleep -> body signal
```

If there is not enough context, show `Today’s signals`, not a complete trace.

`What we’re noticing` does not formally carry long-term patterns. It can only
show the current check-in's trace or lightly reference similarity, such as
`Seen again`.

## Trace Icon Dictionary V1

V1 uses a locked 30-icon semantic set. This set is optimized for:

- high-frequency real-life stress and reflection inputs
- clear AI extraction from short voice notes
- strong visual recognizability at mobile size
- actionability for Pattern Cards and Micro Actions
- safe wellness language that avoids diagnosis or clinical claims

The product should only render the icons needed for the current trace. Do not
generate unlimited custom icons from free-form user language.

### Trigger

- `work_feedback` — Work feedback
- `school_workload` — School / workload
- `relationship_replay` — Relationship replay
- `conflict` — Conflict
- `social_media` — Social media
- `family_pressure` — Family pressure
- `money_stress` — Money stress
- `health_concern` — Health concern

### Thought Pattern

- `overthinking` — Overthinking
- `self_blame` — Self-blame
- `worry` — Worry
- `feeling_judged` — Feeling judged
- `comparison` — Comparison
- `perfectionism` — Perfectionism
- `worst_case_thinking` — Worst-case thinking

### Body Signal

- `stomach_tightness` — Stomach tightness
- `chest_tightness` — Chest tightness
- `head_pressure` — Head pressure
- `neck_shoulder_tension` — Neck / shoulder tension
- `tired_heavy` — Tired / heavy
- `heart_racing` — Heart racing

### Behavior / Sleep

- `short_sleep` — Short sleep
- `phone_scrolling` — Phone scrolling
- `avoidance` — Avoidance
- `bedtime_delay` — Bedtime delay

### Generic Fallback

- `generic_trigger` — Trigger
- `generic_thought` — Thought
- `generic_body` — Body signal
- `generic_behavior` — Behavior
- `unknown` — Not sure

V1 count:

```text
Trigger: 8
Thought Pattern: 7
Body Signal: 6
Behavior / Sleep: 4
Generic Fallback: 5
Total: 30
```

### V1.1 Adopted Refinements

The following V1 entries have been officially replaced with clearer V1.1
artwork while keeping the same stable semantic keys and file names:

- `self_blame`
- `perfectionism`
- `relationship_replay`
- `health_concern`
- `school_workload`
- `worst_case_thinking`

The original V1 artwork is archived locally under:

```text
assets/figma/today/trace-icons-v1/original-v1-backup/
```

### V1 Exclusion Rules

Some common user phrases should not become separate V1 icons:

- `decision_stuck` should map to `generic_thought` with the label
  `Decision stuck`, unless future data shows it is frequent enough to promote.
- `not_sure_body` should map to `unknown` or `generic_body`; it is an
  uncertainty state, not a body signal.
- `health_concern` should avoid clinical imagery. It represents worry or
  concern around health, not diagnosis.
- `heart_racing` is a body signal only. It must not imply a medical cause.

## Icon Art Direction

All generated icons should follow these rules:

- 512 x 512 transparent PNG final output
- flat, readable silhouette at small mobile sizes
- one primary metaphor per icon
- thick dark-brown hand-drawn outline
- warm clay-coral, amber, and sage fills
- subtle paper or crayon texture inside the subject
- no background, no frame, no embedded text, no letters, no numbers
- no medical anatomy unless the UI explicitly needs a body signal
- cute and warm, but not childish
- expressive, but not overly detailed

### Avoid

- hyper-realistic icons
- glossy 3D icons
- emoji style
- clinical medical illustration
- cyber / neon / AI glow style
- icons that require a label to become recognizable
- icons with baked-in English or Chinese text

## Image Generation Prompt Base

Use this base when generating new 心迹Mood icons:

```text
Create a mobile app UI icon for MoodTrace / 心迹Mood.

Style: warm premium paper-journal illustration, hand-drawn, cute but not
childish, thick dark-brown crayon/ink outline, subtle handmade paper texture
inside the subject, simple flat shapes.

Palette: clay coral red, warm amber, muted sage green, ivory accents, dark-brown
outline. Keep it calm and trustworthy.

Composition: one centered standalone icon with generous padding, recognizable at
small mobile size, no label, no letters, no numbers.

Transparent preparation: place the icon on a perfectly flat solid #ff00ff
chroma-key background for local background removal. The background must be one
uniform color with no shadows, gradients, paper texture, noise, floor plane, or
lighting variation.

Constraints: no text, no watermark, no mockup phone, no UI frame, no #ff00ff
inside the icon, no cast shadow touching the background.
```

After generation, remove the chroma-key background and validate transparent
corners before committing the asset.

## Asset Naming

Use stable semantic names:

```text
assets/figma/today/trace-icons-v1/trace-work-feedback.png
assets/figma/today/trace-icons-v1/trace-generic-trigger.png
```

Do not name files by prompt attempt or visual description only.

Good:

```text
trace-work-feedback.png
trace-overthinking.png
trace-generic-thought.png
```

Avoid:

```text
cute-orange-bubble-final.png
image-3.png
new-icon-best.png
```

## Quality Gate

Before accepting a new icon:

1. It must match the existing MoodTrace style.
2. It must be understandable at 44-60 px.
3. It must not introduce a new palette or rendering style.
4. It must not overlap semantically with another icon unless it is intentionally
   a generic fallback.
5. It must work with a text label beneath it.
6. It must have transparent corners and no chroma-key fringe.
7. It must not include text, letters, or numbers.

If an icon looks beautiful but is not immediately understandable, reject it.

## Product Behavior Rule

Icons do not create product truth. They only visualize already structured data.

- Mood/body chips create `Today’s signals`.
- Voice or text input can create a `Today’s trace draft`.
- A similar current trace can create a light `Trace Echo` / `Seen again` hint.
- Repeated confirmed traces create `Pattern Seed` or `Repeating Loop`.
- A single check-in should not be called a pattern.

Use icons to make structured data easier to scan, not to imply certainty the
system does not have.
