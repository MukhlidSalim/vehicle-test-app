# Trial Environment Layer

This folder contains **all code related to marking this VIS deployment as a trial/development copy**. It is fully self-contained and can be removed without affecting any core VIS functionality.

## Purpose

When `enabled: true` in `trialEnvironment.config.ts`:

1. **TrialEnvironmentNotice** — A full-screen modal shown **once per browser session** informing the user this is a trial version and directing them to the official production URL.
2. **TrialEnvironmentBadge** — A persistent pill badge in the TopBar labeled **"نسخة تجريبية"** that opens a small popover with a link to the production URL.

## Official Production URL

```
https://vi-system.vercel.app/
```

This URL is defined in **one place only**: `trialEnvironment.config.ts`.

## Files

| File | Purpose |
|------|---------|
| `trialEnvironment.config.ts` | Central configuration (enabled flag, production URL, session key) |
| `TrialEnvironmentNotice.tsx` | One-time full-screen modal notice |
| `TrialEnvironmentBadge.tsx` | Persistent TopBar badge with popover |
| `README.md` | This file |

## Integration Points (files modified outside this folder)

| File | Change |
|------|--------|
| `src/App.tsx` | Added `<TrialEnvironmentNotice />` inside the root layout |
| `src/components/TopBar.tsx` | Added `<TrialEnvironmentBadge />` inside the header bar |

## How to Disable

Set `enabled: false` in `trialEnvironment.config.ts`:

```ts
export const TRIAL_ENVIRONMENT = {
  enabled: false,  // ← change this
  originalUrl: "https://vi-system.vercel.app/",
  sessionKey: "vis_trial_notice_shown",
};
```

Both the notice and badge will stop rendering. No other changes needed.

## How to Remove Permanently

1. Delete this entire folder: `src/components/trial-environment/`
2. In `src/App.tsx`: remove the import line and `<TrialEnvironmentNotice />` component
3. In `src/components/TopBar.tsx`: remove the import line and `<TrialEnvironmentBadge />` component
4. Done — zero trial code remains
