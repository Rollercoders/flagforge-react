# Example App Design

## Goal

Create a simple React app (`examples/basic/`) that demonstrates every public API of `flagforge-react` against a real FlagForge instance.

## Configuration

The user configures the app via environment variables before running it:

- `VITE_FLAGFORGE_HOST` — base URL of their FlagForge instance (e.g. `https://flagforge.myapp.com`)
- `VITE_FLAGFORGE_API_KEY` — API key (`ff_xxxx`)
- `VITE_FLAGFORGE_FLAGS` — comma-separated flag names to use in the demo (e.g. `new-dashboard,beta-feature,dark-mode`)

Instructions for setting these are in `examples/basic/README.md`.

## Architecture

A single Vite + React + TypeScript app. No UI library — plain HTML with minimal inline styles. The app renders a single page divided into labelled sections, one per API surface.

The root wraps everything in `FlagForgeProvider`. A mode toggle (eager/lazy) at the top remounts the provider with the selected mode so both fetch strategies are exercisable.

## Sections

| Section | API demonstrated |
|---|---|
| Raw state | `useFlagForge()` — shows `loading`, `error`, full `flags` map |
| Single flag | `useFlag(key)` — shows boolean for first flag in the list |
| Multiple flags | `useFlags(keys)` — shows boolean map for all flags |
| FeatureFlag | `<FeatureFlag flag={key}>` — renders content only when enabled |
| FlagGate | `<FlagGate flag={key} fallback={…}>` — renders children or fallback |
| Mode toggle | Switch between `eager` and `lazy` mode, remounts provider |

## Stack

- Vite 5 + React 18 + TypeScript
- `flagforge-react` as a workspace dependency (via `file:../..`)
- Yarn 4 (workspace)
- No additional dependencies

## File Structure

```
examples/basic/
  README.md
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  src/
    main.tsx        — mounts <App /> into #root
    App.tsx         — provider + mode state + all demo sections
    env.ts          — reads and validates VITE_* env vars
```
