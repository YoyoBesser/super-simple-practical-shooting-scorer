const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Disable package exports resolution to avoid ESM-only builds (e.g. Zustand v5)
// that use import.meta, which Metro doesn't support outside of modules.
config.resolver.unstable_enablePackageExports = false

module.exports = config
