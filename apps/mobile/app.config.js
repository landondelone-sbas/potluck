/**
 * Adds to app.json. The web build for GitHub Pages lives under /potluck, so the workflow sets
 * EXPO_BASE_URL=/potluck for that build. Everything else, including the local dev server and the
 * phone builds, leaves it unset and is unchanged. A single-page web build is used because the
 * routes are all client-side.
 */
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
  web: { ...config.web, bundler: 'metro', output: 'single' },
});
