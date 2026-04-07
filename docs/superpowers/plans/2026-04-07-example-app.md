# Example App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `examples/basic/` — a minimal Vite + React + TypeScript app that demos every public API of `flagforge-react` against a real FlagForge instance.

**Architecture:** Single-page app, no UI library. Root wraps everything in `FlagForgeProvider`. A mode toggle remounts the provider to switch between eager/lazy. One section per API surface.

**Tech Stack:** Vite 5, React 18, TypeScript, Yarn 4 (workspace), `flagforge-react` via `file:../..`

---

## File Map

| File | Purpose |
|---|---|
| `examples/basic/README.md` | Setup instructions (env vars, run command) |
| `examples/basic/package.json` | Vite app deps, `flagforge-react` as local dep |
| `examples/basic/tsconfig.json` | TypeScript config |
| `examples/basic/vite.config.ts` | Vite config with React plugin |
| `examples/basic/index.html` | HTML entry point |
| `examples/basic/src/env.ts` | Reads and exports `VITE_*` env vars |
| `examples/basic/src/main.tsx` | Mounts `<App />` into `#root` |
| `examples/basic/src/App.tsx` | Provider, mode toggle, all demo sections |

---

### Task 1: Scaffold `examples/basic/` directory and config files

**Files:**
- Create: `examples/basic/package.json`
- Create: `examples/basic/tsconfig.json`
- Create: `examples/basic/vite.config.ts`
- Create: `examples/basic/index.html`

- [ ] **Step 1: Create `examples/basic/package.json`**

```json
{
  "name": "flagforge-react-example-basic",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "flagforge-react": "file:../..",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 2: Create `examples/basic/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `examples/basic/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Create `examples/basic/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>flagforge-react example</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Install dependencies**

Run from the repo root:
```bash
yarn install
```

Expected: yarn resolves workspace deps including `flagforge-react` from `file:../..`. No errors.

- [ ] **Step 6: Commit**

```bash
git add examples/basic/package.json examples/basic/tsconfig.json examples/basic/vite.config.ts examples/basic/index.html
git commit -m "chore(example): scaffold basic example app"
```

---

### Task 2: Write `env.ts` — reads and validates env vars

**Files:**
- Create: `examples/basic/src/env.ts`

- [ ] **Step 1: Create `examples/basic/src/env.ts`**

```typescript
const host = import.meta.env.VITE_FLAGFORGE_HOST as string | undefined;
const apiKey = import.meta.env.VITE_FLAGFORGE_API_KEY as string | undefined;
const flagsRaw = import.meta.env.VITE_FLAGFORGE_FLAGS as string | undefined;

if (!host) throw new Error("VITE_FLAGFORGE_HOST is not set");
if (!apiKey) throw new Error("VITE_FLAGFORGE_API_KEY is not set");

export const FLAGFORGE_HOST = host;
export const FLAGFORGE_API_KEY = apiKey;
export const FLAGFORGE_FLAGS: string[] = flagsRaw
  ? flagsRaw.split(",").map((f) => f.trim()).filter(Boolean)
  : [];
```

- [ ] **Step 2: Commit**

```bash
git add examples/basic/src/env.ts
git commit -m "feat(example): add env var reader"
```

---

### Task 3: Write `main.tsx` — entry point

**Files:**
- Create: `examples/basic/src/main.tsx`

- [ ] **Step 1: Create `examples/basic/src/main.tsx`**

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 2: Commit**

```bash
git add examples/basic/src/main.tsx
git commit -m "feat(example): add entry point"
```

---

### Task 4: Write `App.tsx` — provider, mode toggle, demo sections

**Files:**
- Create: `examples/basic/src/App.tsx`

This is the main file. It imports from `flagforge-react`, reads env vars, and renders one section per API surface.

- [ ] **Step 1: Create `examples/basic/src/App.tsx`**

```typescript
import { useState } from "react";
import {
  FlagForgeProvider,
  useFlagForge,
  useFlag,
  useFlags,
  FeatureFlag,
  FlagGate,
} from "flagforge-react";
import { FLAGFORGE_HOST, FLAGFORGE_API_KEY, FLAGFORGE_FLAGS } from "./env";

const firstFlag = FLAGFORGE_FLAGS[0] ?? "example-flag";

export function App() {
  const [mode, setMode] = useState<"eager" | "lazy">("eager");

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "800px" }}>
      <h1>flagforge-react — API demo</h1>

      <section style={sectionStyle}>
        <h2>Mode</h2>
        <label>
          <input
            type="radio"
            name="mode"
            value="eager"
            checked={mode === "eager"}
            onChange={() => setMode("eager")}
          />{" "}
          eager (fetches all flags on mount)
        </label>{" "}
        <label>
          <input
            type="radio"
            name="mode"
            value="lazy"
            checked={mode === "lazy"}
            onChange={() => setMode("lazy")}
          />{" "}
          lazy (fetches each flag on first use)
        </label>
      </section>

      <FlagForgeProvider
        key={mode}
        host={FLAGFORGE_HOST}
        apiKey={FLAGFORGE_API_KEY}
        mode={mode}
      >
        <Sections />
      </FlagForgeProvider>
    </div>
  );
}

function Sections() {
  return (
    <>
      <RawStateSection />
      <SingleFlagSection />
      <MultiFlagSection />
      <FeatureFlagSection />
      <FlagGateSection />
    </>
  );
}

function RawStateSection() {
  const { flags, loading, error } = useFlagForge();
  return (
    <section style={sectionStyle}>
      <h2>useFlagForge()</h2>
      <p>loading: {String(loading)}</p>
      <p>error: {error ? error.message : "null"}</p>
      <p>flags:</p>
      <pre style={preStyle}>{JSON.stringify(flags, null, 2)}</pre>
    </section>
  );
}

function SingleFlagSection() {
  const enabled = useFlag(firstFlag);
  return (
    <section style={sectionStyle}>
      <h2>useFlag("{firstFlag}")</h2>
      <p>
        enabled: <strong>{String(enabled)}</strong>
      </p>
    </section>
  );
}

function MultiFlagSection() {
  const flagMap = useFlags(FLAGFORGE_FLAGS);
  return (
    <section style={sectionStyle}>
      <h2>useFlags([{FLAGFORGE_FLAGS.map((f) => `"${f}"`).join(", ")}])</h2>
      <pre style={preStyle}>{JSON.stringify(flagMap, null, 2)}</pre>
    </section>
  );
}

function FeatureFlagSection() {
  return (
    <section style={sectionStyle}>
      <h2>{"<FeatureFlag flag=\"" + firstFlag + "\">"}</h2>
      <FeatureFlag flag={firstFlag}>
        <p style={{ color: "green" }}>Flag is enabled — this content is visible.</p>
      </FeatureFlag>
    </section>
  );
}

function FlagGateSection() {
  return (
    <section style={sectionStyle}>
      <h2>{"<FlagGate flag=\"" + firstFlag + "\" fallback={…}>"}</h2>
      <FlagGate
        flag={firstFlag}
        fallback={<p style={{ color: "red" }}>Flag is disabled — showing fallback.</p>}
      >
        <p style={{ color: "green" }}>Flag is enabled — showing children.</p>
      </FlagGate>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  borderTop: "1px solid #ccc",
  paddingTop: "1rem",
  marginTop: "1rem",
};

const preStyle: React.CSSProperties = {
  background: "#f4f4f4",
  padding: "0.5rem",
  borderRadius: "4px",
  overflowX: "auto",
};
```

- [ ] **Step 2: Commit**

```bash
git add examples/basic/src/App.tsx
git commit -m "feat(example): add demo sections for all flagforge-react APIs"
```

---

### Task 5: Write `README.md` for the example app

**Files:**
- Create: `examples/basic/README.md`

- [ ] **Step 1: Create `examples/basic/README.md`**

```markdown
# flagforge-react — basic example

A minimal app that demonstrates every public API of `flagforge-react` against a real FlagForge instance.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your values, or export the variables in your shell:

```sh
export VITE_FLAGFORGE_HOST=https://flagforge.myapp.com
export VITE_FLAGFORGE_API_KEY=ff_xxxx
export VITE_FLAGFORGE_FLAGS=flag-a,flag-b,flag-c
```

- `VITE_FLAGFORGE_HOST` — base URL of your FlagForge instance
- `VITE_FLAGFORGE_API_KEY` — your API key
- `VITE_FLAGFORGE_FLAGS` — comma-separated flag names to use in the demo

## Run

From the repo root:

```sh
yarn install
cd examples/basic
yarn dev
```

Open [http://localhost:5173](http://localhost:5173).
```

- [ ] **Step 2: Create `examples/basic/.env.example`**

```
VITE_FLAGFORGE_HOST=https://flagforge.myapp.com
VITE_FLAGFORGE_API_KEY=ff_xxxx
VITE_FLAGFORGE_FLAGS=flag-a,flag-b
```

- [ ] **Step 3: Commit**

```bash
git add examples/basic/README.md examples/basic/.env.example
git commit -m "docs(example): add README and .env.example"
```

---

### Task 6: Smoke-test the app

No automated tests for this example app — it's a manual demo. Verify:

- [ ] **Step 1: Start the dev server**

```bash
cd examples/basic
VITE_FLAGFORGE_HOST=<your-host> VITE_FLAGFORGE_API_KEY=<your-key> VITE_FLAGFORGE_FLAGS=<your-flags> yarn dev
```

Expected: Vite starts on `http://localhost:5173`, no compile errors.

- [ ] **Step 2: Check each section in the browser**

- `useFlagForge()` section shows `loading: false`, `error: null`, and a non-empty flags object (or `{}` if no flags exist yet)
- `useFlag` section shows a boolean value
- `useFlags` section shows a map of flag names to booleans
- `<FeatureFlag>` section shows content if the first flag is enabled, nothing otherwise
- `<FlagGate>` section shows children or fallback depending on the flag state

- [ ] **Step 3: Toggle mode to lazy**

Click the "lazy" radio. The provider remounts. Each section should re-fetch and display updated values.

- [ ] **Step 4: Final commit if any fixes were made**

```bash
git add -p
git commit -m "fix(example): smoke-test fixes"
```
