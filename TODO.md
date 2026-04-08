# Feature TODO

## Task 1 — Delete button on stages list
`app/index.tsx`: Split each row into a navigate Pressable (flex:1) + a red ✕ Pressable on the right.

## Task 2 — Tap shooter name to edit score
`store/useStore.ts`: add `updateScore(stageId, scoreId, score)`
`app/stage/[id].tsx`:
- Tap score row → load data back into form for editing
- Long-press still deletes
- Save button says "Update Score" when editing; Cancel button to exit edit mode

## Task 3 — Target-grouped letter ticker
`app/stage/[id].tsx`:
- Split sequence into chunks of `shotsPerTarget`, one box per target
- Box border: dim (#333) when empty, orange when partial, green when full
- Pad to `numTargets` boxes minimum

## Task 4 — Category system
`store/types.ts`: add `Category = 'Open' | 'Standard' | 'Production'`; add optional `category?` to `ShooterScore`
`app/stage/[id].tsx`:
- Category selector (3-button segment) in entry form, default 'Production'
- Results grouped by category (SectionList), skip empty categories
- Per-category rank

## Task 5 — Export leaderboard as PNG
`app/stage/[id].tsx`:
- Export button on results
- Capture leaderboard view as PNG using react-native-view-shot
- Shows stage name, per-category top-2 winners, full ranked list with grouped ticker
- Web: download PNG file; Native: share via expo-sharing
