# Potluck mobile app

The Expo (React Native, TypeScript) app for iPhone and Android. Setup, scripts and the layout of the whole repo are in the [root README](../../README.md).

```
src/app/       Expo Router screens (every file here is a route)
src/theme/     Design tokens and the theme hook
src/content/   User-facing labels
src/lib/       Small app helpers
__tests__/     Jest tests (jest-expo preset)
```

The matching engine and dish library are separate packages: `@potluck/engine` and `@potluck/dishes`.

Before using an Expo or React Native API, read the docs for the SDK version in `package.json`. See `AGENTS.md`.
