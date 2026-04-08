// Dynamic config — extends app.json and allows env-var overrides at build time.
// EXPO_BASE_URL: set to /repo-name/ for GitHub Pages builds (default: /)
module.exports = ({ config }) => ({
  ...config,
  web: {
    ...config.web,
    baseUrl: process.env.EXPO_BASE_URL ?? '/',
  },
})
