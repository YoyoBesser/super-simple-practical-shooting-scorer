// Dynamic config — extends app.json and allows env-var overrides at build time.
// EXPO_BASE_URL: set to /repo-name/ for GitHub Pages builds (default: empty = root).
// Expo reads baseUrl from experiments.baseUrl (NOT web.baseUrl).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL?.replace(/\/+$/, '') ?? '',
  },
})
