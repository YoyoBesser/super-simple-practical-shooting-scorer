// Injected at build time via EXPO_PUBLIC_* env vars.
// Falls back to 'dev' / null when running locally.
export const COMMIT_HASH: string = process.env.EXPO_PUBLIC_COMMIT_HASH ?? 'dev'
export const BUILD_TIME: string | null = process.env.EXPO_PUBLIC_BUILD_TIME ?? null
