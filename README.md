# flagforge-react

React client library for FlagForge feature flags.

## Installation

```bash
yarn add @rollercoders/flagforge-react
```

## Quick Start

```tsx
import { FlagForgeProvider, useFlag, FeatureFlag, FlagGate } from "@rollercoders/flagforge-react";

function App() {
  return (
    <FlagForgeProvider
      host="https://flagforge.myapp.com"
      apiKey="ff_xxxx"
      context={{ userId: "user-123", attributes: { plan: "premium" } }}
      pollInterval={30000}
    >
      <MyApp />
    </FlagForgeProvider>
  );
}

function MyApp() {
  const enabled = useFlag("new-dashboard");

  return (
    <>
      {/* Hook */}
      {enabled && <NewDashboard />}

      {/* Declarative — renders children only if enabled */}
      <FeatureFlag flag="new-dashboard">
        <NewDashboard />
      </FeatureFlag>

      {/* Declarative with fallback */}
      <FlagGate flag="new-dashboard" fallback={<OldDashboard />}>
        <NewDashboard />
      </FlagGate>
    </>
  );
}
```

## Modes

| Mode | Behavior |
|---|---|
| `eager` (default) | Fetches all flags on mount, optional polling |
| `lazy` | Fetches each flag on first use, results cached |

## API

### `<FlagForgeProvider>`

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `host` | `string` | yes | — | Base URL of the FlagForge server |
| `apiKey` | `string` | yes | — | API key (`ff_xxxx`) |
| `mode` | `"eager" \| "lazy"` | no | `"eager"` | Fetch strategy |
| `pollInterval` | `number` | no | — | Poll interval in ms (eager only) |
| `context` | `FlagForgeContext` | no | `{}` | User context for flag evaluation |

### `useFlag(key: string): boolean`

Returns `true` if the flag is enabled, `false` otherwise (including during loading or on error).

### `useFlags(keys: string[]): Record<string, boolean>`

Returns a map of the requested flag keys to their boolean values.

### `useFlagForge(): { flags, loading, error }`

Raw context access.

### `<FeatureFlag flag="key">`

Renders `children` only when the flag is enabled and not loading.

### `<FlagGate flag="key" fallback={<OldUI />}>`

Renders `children` when enabled, `fallback` when disabled or loading.
