# flagforge-react — Design Spec

**Date:** 2026-04-04
**Repository:** `~/Projects/misc/flagforge-react`
**Published to:** npm

---

## Overview

A React client library for consuming FlagForge feature flags. Read-only — no flag management. Provides a context provider, hooks, and declarative components.

**Prerequisite:** Requires `POST /api/evaluate/all` endpoint on the FlagForge server (see flagforge server spec).

---

## Project Structure

```
flagforge-react/
├── src/
│   ├── client.ts            — HTTP client (fetch wrapper)
│   ├── context.tsx          — FlagForgeContext + FlagForgeProvider
│   ├── hooks.ts             — useFlag, useFlags, useFlagForge
│   ├── components.tsx       — FeatureFlag, FlagGate
│   └── index.ts             — public exports
├── test/
│   ├── hooks.test.tsx
│   └── components.test.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts           — library build
└── README.md
```

---

## Provider API

```tsx
<FlagForgeProvider
  host="https://flagforge.myapp.com"
  apiKey="ff_xxxx"
  mode="eager"             // "eager" | "lazy" — default: "eager"
  pollInterval={30000}     // ms, optional — only used in eager mode
  context={{
    userId: "user-123",
    attributes: { plan: "premium" }
  }}
>
  <App />
</FlagForgeProvider>
```

---

## Modes

### eager (default)

On mount, calls `POST /api/evaluate/all` to pre-fetch all flags. Optional polling refreshes all flags every `pollInterval` ms. If `context` prop changes, re-fetches immediately.

### lazy

No fetch on mount. Each `useFlag(key)` call triggers `POST /api/evaluate/:key` on-demand. Results are cached locally in context to avoid duplicate calls for the same key. No polling. Cache is cleared on unmount.

---

## Context State

```typescript
interface FlagForgeState {
  flags: Record<string, boolean>;
  loading: boolean;   // true only during initial fetch in eager mode
  error: Error | null;
}
```

---

## Hooks

```typescript
// Single flag — boolean
const enabled = useFlag("new-dashboard");

// Multiple flags — Record<string, boolean>
const flags = useFlags(["flag-a", "flag-b"]);

// Raw context access
const { flags, loading, error } = useFlagForge();
```

---

## Components

```tsx
// Renders children only if flag is enabled
<FeatureFlag flag="new-dashboard">
  <NewDashboard />
</FeatureFlag>

// Renders children or fallback based on flag
<FlagGate flag="new-dashboard" fallback={<OldDashboard />}>
  <NewDashboard />
</FlagGate>
```

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Initial fetch loading | `loading: true`, `useFlag` returns `false` |
| Network error on first fetch | `error` set, all flags return `false` |
| Network error on poll refresh | `error` set, flags retain last known values |
| Unknown flag key | returns `false` |
| Lazy fetch error | `useFlag` returns `false`, `error` set |

---

## Data Flow

**Eager:**
1. Provider mounts → `POST /api/evaluate/all` with context
2. Response populates flags map in context
3. If `pollInterval` set → repeat every N ms
4. If `context` prop changes → re-fetch immediately

**Lazy:**
1. Provider mounts → no fetch
2. `useFlag(key)` called → check local cache → if miss, `POST /api/evaluate/:key`
3. Result stored in local cache

---

## Testing

- Vitest + React Testing Library
- Fetch mocked globally
- Test cases: loading state, success, network error, unknown flag key, polling with fake timers
- Both eager and lazy modes covered

---

## Out of Scope

- Flag management (create/update/delete)
- Next.js SSR integration
- Per-flag polling in lazy mode
