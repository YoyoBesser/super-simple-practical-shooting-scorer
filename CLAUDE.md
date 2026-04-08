# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

A practical shooting competition scorer for IPSC/USPSA-style stages. Users define stages (number of targets, shots per target), enter shooter results (time + hits: A/C/D/Miss), and see ranked leaderboards by category (Open/Standard/Production). Results can be exported as PNG.

## Commands

```bash
npm start           # Expo dev server (all platforms)
npm run web         # Web dev server
npm run android     # Android dev
npm run ios         # iOS dev
npm run build:web   # Export static web build to dist/
```

No test or lint commands are configured.

## Architecture

### State (`store/`)
Zustand v5 store with AsyncStorage persistence (`'scorer-storage'` key). Single `useStore()` hook exposes all data and actions. All scoring logic lives in `store/types.ts`:
- `computeHitFactor(hits, time)` — core scoring formula: `(A×5 + C×3 + D×1 - Miss×10) / time`
- `computePoints(hits)` — raw points without time division
- `getShotsForTarget(stage, targetIndex)` — handles per-target shot count overrides
- `totalExpectedShots(stage)` — sum across all targets

### Screens (`app/`)
Three screens via Expo Router:
- `index.tsx` — stage list (home)
- `stage/new.tsx` — create stage with target/shot configuration
- `stage/[id].tsx` — score entry + live leaderboard (the main screen); handles hit sequence input, edit/delete scores, category tabs

### Platform Split (`utils/captureRef.*`)
`captureRef.native.ts` re-exports from `react-native-view-shot`; `captureRef.ts` is a web stub that throws. Web PNG export uses `html-to-image` directly in `stage/[id].tsx`.

## Key Configuration Notes

**Metro** (`metro.config.js`): `unstable_enablePackageExports: false` — required because Zustand v5 uses ESM-only builds with `import.meta` that breaks Metro's package exports resolution.

**TypeScript**: `@/*` alias maps to project root.

**App config** (`app.config.js`): Sets `baseUrl` from `EXPO_BASE_URL` env var for GitHub Pages deployment.

**Version info**: Injected via `EXPO_PUBLIC_COMMIT_HASH` and `EXPO_PUBLIC_BUILD_TIME` env vars at build time; consumed in `constants/version.ts`.

## CI/CD

GitHub Actions (`.github/workflows/release.yml`) on push to `main`:
1. Exports web → deploys to GitHub Pages
