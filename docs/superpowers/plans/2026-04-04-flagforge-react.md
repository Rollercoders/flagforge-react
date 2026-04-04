# flagforge-react Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React client library for consuming FlagForge feature flags, with a context provider, hooks, and declarative components, published to npm.

**Architecture:** A `FlagForgeProvider` fetches flags via `POST /api/evaluate/all` (eager mode) or `POST /api/evaluate/:key` (lazy mode), storing them in React context. Hooks (`useFlag`, `useFlags`, `useFlagForge`) and components (`FeatureFlag`, `FlagGate`) consume the context. The library is built with Vite in library mode and tested with Vitest + React Testing Library.

**Tech Stack:** React 18, TypeScript, Vite (library mode), Vitest, @testing-library/react, @testing-library/jest-dom

---

## File Map

| File | Responsibility |
|---|---|
| `src/client.ts` | HTTP fetch wrapper — `fetchAllFlags(host, apiKey, context)` and `fetchFlag(host, apiKey, key, context)` |
| `src/context.tsx` | `FlagForgeContext`, `FlagForgeProvider`, internal state management |
| `src/hooks.ts` | `useFlag`, `useFlags`, `useFlagForge` |
| `src/components.tsx` | `FeatureFlag`, `FlagGate` |
| `src/index.ts` | Public exports |
| `test/hooks.test.tsx` | Tests for all hooks in eager and lazy modes |
| `test/components.test.tsx` | Tests for `FeatureFlag` and `FlagGate` |
| `package.json` | npm package config |
| `tsconfig.json` | TypeScript config |
| `vite.config.ts` | Library build config |

---

### Task 1: Scaffolding del progetto

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/index.ts`

- [ ] **Step 1: Inizializza package.json**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/package.json`:

```json
{
  "name": "flagforge-react",
  "version": "0.1.0",
  "description": "React client library for FlagForge feature flags",
  "main": "./dist/flagforge-react.umd.js",
  "module": "./dist/flagforge-react.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/flagforge-react.es.js",
      "require": "./dist/flagforge-react.umd.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build && tsc --emitDeclarationOnly",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "packageManager": "yarn@4.9.1",
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^15.0.2",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "jsdom": "^24.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vite-plugin-dts": "^3.9.0",
    "vitest": "^1.5.0"
  }
}
```

- [ ] **Step 2: Crea tsconfig.json**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "declarationDir": "./dist",
    "outDir": "./dist",
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 3: Crea vite.config.ts**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), dts({ include: ["src"] })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "FlagForgeReact",
      fileName: "flagforge-react",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
  },
});
```

- [ ] **Step 4: Crea file setup per i test**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/test/setup.ts`:

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Crea src/index.ts vuoto**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/src/index.ts`:

```typescript
// exports added in later tasks
```

- [ ] **Step 6: Attiva yarn 4 e installa le dipendenze**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
corepack enable
corepack prepare yarn@4.9.1 --activate
yarn install
```

Expected: `.yarn/` e `yarn.lock` creati, `node_modules/` popolata, nessun errore.

- [ ] **Step 7: Commit**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
git init
git add package.json tsconfig.json vite.config.ts test/setup.ts src/index.ts
git commit -m "chore: scaffold project"
```

---

### Task 2: HTTP Client

**Files:**
- Create: `src/client.ts`

- [ ] **Step 1: Scrivi i test per il client HTTP**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/test/client.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAllFlags, fetchFlag } from "../src/client";

const HOST = "https://flagforge.example.com";
const API_KEY = "ff_test";
const CONTEXT = { userId: "user-1", attributes: { plan: "free" } };

describe("fetchAllFlags", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("calls POST /api/evaluate/all with correct headers and body", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: { "flag-a": true, "flag-b": false } }),
    });

    const result = await fetchAllFlags(HOST, API_KEY, CONTEXT);

    expect(fetch).toHaveBeenCalledWith(`${HOST}/api/evaluate/all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ context: CONTEXT }),
    });
    expect(result).toEqual({ "flag-a": true, "flag-b": false });
  });

  it("throws when response is not ok", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await expect(fetchAllFlags(HOST, API_KEY, CONTEXT)).rejects.toThrow(
      "FlagForge: HTTP 401"
    );
  });
});

describe("fetchFlag", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("calls POST /api/evaluate/:key and returns boolean", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enabled: true }),
    });

    const result = await fetchFlag(HOST, API_KEY, "new-dashboard", CONTEXT);

    expect(fetch).toHaveBeenCalledWith(
      `${HOST}/api/evaluate/new-dashboard`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ context: CONTEXT }),
      }
    );
    expect(result).toBe(true);
  });

  it("throws when response is not ok", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(
      fetchFlag(HOST, API_KEY, "new-dashboard", CONTEXT)
    ).rejects.toThrow("FlagForge: HTTP 500");
  });
});
```

- [ ] **Step 2: Esegui i test per verificare che falliscano**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn vitest run test/client.test.ts
```

Expected: FAIL — `Cannot find module '../src/client'`

- [ ] **Step 3: Implementa src/client.ts**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/src/client.ts`:

```typescript
export interface FlagForgeContext {
  userId?: string;
  attributes?: Record<string, unknown>;
}

async function post<T>(
  url: string,
  apiKey: string,
  body: unknown
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`FlagForge: HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAllFlags(
  host: string,
  apiKey: string,
  context: FlagForgeContext
): Promise<Record<string, boolean>> {
  const data = await post<{ flags: Record<string, boolean> }>(
    `${host}/api/evaluate/all`,
    apiKey,
    { context }
  );
  return data.flags;
}

export async function fetchFlag(
  host: string,
  apiKey: string,
  key: string,
  context: FlagForgeContext
): Promise<boolean> {
  const data = await post<{ enabled: boolean }>(
    `${host}/api/evaluate/${key}`,
    apiKey,
    { context }
  );
  return data.enabled;
}
```

- [ ] **Step 4: Esegui i test per verificare che passino**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn vitest run test/client.test.ts
```

Expected: PASS — tutti e 4 i test passano.

- [ ] **Step 5: Commit**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
git add src/client.ts test/client.test.ts
git commit -m "feat: add HTTP client (fetchAllFlags, fetchFlag)"
```

---

### Task 3: Context e Provider

**Files:**
- Create: `src/context.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Scrivi i test per il Provider**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/test/provider.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { FlagForgeProvider } from "../src/context";
import { useFlagForge } from "../src/hooks";

const HOST = "https://flagforge.example.com";
const API_KEY = "ff_test";

function FlagsDisplay() {
  const { flags, loading, error } = useFlagForge();
  if (loading) return <div>loading</div>;
  if (error) return <div>error: {error.message}</div>;
  return <div>flags: {JSON.stringify(flags)}</div>;
}

describe("FlagForgeProvider — eager mode", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading then renders flags on success", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: { "flag-a": true } }),
    });

    render(
      <FlagForgeProvider host={HOST} apiKey={API_KEY}>
        <FlagsDisplay />
      </FlagForgeProvider>
    );

    expect(screen.getByText("loading")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('flags: {"flag-a":true}')).toBeInTheDocument()
    );
  });

  it("sets error and shows false flags on network error", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(
      <FlagForgeProvider host={HOST} apiKey={API_KEY}>
        <FlagsDisplay />
      </FlagForgeProvider>
    );

    await waitFor(() =>
      expect(
        screen.getByText("error: FlagForge: HTTP 500")
      ).toBeInTheDocument()
    );
  });

  it("re-fetches when context prop changes", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ flags: { "flag-a": false } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ flags: { "flag-a": true } }),
      });

    const { rerender } = render(
      <FlagForgeProvider host={HOST} apiKey={API_KEY} context={{ userId: "u1" }}>
        <FlagsDisplay />
      </FlagForgeProvider>
    );

    await waitFor(() =>
      expect(screen.getByText('flags: {"flag-a":false}')).toBeInTheDocument()
    );

    rerender(
      <FlagForgeProvider host={HOST} apiKey={API_KEY} context={{ userId: "u2" }}>
        <FlagsDisplay />
      </FlagForgeProvider>
    );

    await waitFor(() =>
      expect(screen.getByText('flags: {"flag-a":true}')).toBeInTheDocument()
    );

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retains last known flags and sets error on poll failure", async () => {
    vi.useFakeTimers();

    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ flags: { "flag-a": true } }),
      })
      .mockResolvedValueOnce({ ok: false, status: 503 });

    render(
      <FlagForgeProvider host={HOST} apiKey={API_KEY} pollInterval={5000}>
        <FlagsDisplay />
      </FlagForgeProvider>
    );

    await waitFor(() =>
      expect(screen.getByText('flags: {"flag-a":true}')).toBeInTheDocument()
    );

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() =>
      expect(
        screen.getByText("error: FlagForge: HTTP 503")
      ).toBeInTheDocument()
    );
    // flags retained
    expect(screen.queryByText('flags: {}')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});

describe("FlagForgeProvider — lazy mode", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not fetch on mount", () => {
    render(
      <FlagForgeProvider host={HOST} apiKey={API_KEY} mode="lazy">
        <div>ready</div>
      </FlagForgeProvider>
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText("ready")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Esegui i test per verificare che falliscano**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn vitest run test/provider.test.tsx
```

Expected: FAIL — `Cannot find module '../src/context'` e `Cannot find module '../src/hooks'`

- [ ] **Step 3: Implementa src/context.tsx**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/src/context.tsx`:

```typescript
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { fetchAllFlags, FlagForgeContext as FlagContext } from "./client";

export interface FlagForgeState {
  flags: Record<string, boolean>;
  loading: boolean;
  error: Error | null;
  /** Internal: for lazy mode per-key cache + setter */
  _lazyCache: Record<string, boolean>;
  _setLazyCache: (key: string, value: boolean) => void;
  _setError: (err: Error) => void;
  host: string;
  apiKey: string;
  context: FlagContext;
  mode: "eager" | "lazy";
}

export const FlagForgeCtx = createContext<FlagForgeState | null>(null);

export function useFlagForgeCtx(): FlagForgeState {
  const ctx = useContext(FlagForgeCtx);
  if (!ctx) throw new Error("useFlagForge must be used inside FlagForgeProvider");
  return ctx;
}

export interface FlagForgeProviderProps {
  host: string;
  apiKey: string;
  mode?: "eager" | "lazy";
  pollInterval?: number;
  context?: FlagContext;
  children: ReactNode;
}

export function FlagForgeProvider({
  host,
  apiKey,
  mode = "eager",
  pollInterval,
  context = {},
  children,
}: FlagForgeProviderProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(mode === "eager");
  const [error, setError] = useState<Error | null>(null);
  const [lazyCache, setLazyCache] = useState<Record<string, boolean>>({});
  const isFirstFetch = useRef(true);

  function setLazyCacheKey(key: string, value: boolean) {
    setLazyCache((prev) => ({ ...prev, [key]: value }));
  }

  // Serialize context to detect changes
  const contextKey = JSON.stringify(context);

  useEffect(() => {
    if (mode !== "eager") return;

    let cancelled = false;

    async function load(isInitial: boolean) {
      try {
        const result = await fetchAllFlags(host, apiKey, context);
        if (!cancelled) {
          setFlags(result);
          setError(null);
          if (isInitial) setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          if (isInitial) setLoading(false);
        }
      }
    }

    load(isFirstFetch.current);
    isFirstFetch.current = false;

    if (!pollInterval) return () => { cancelled = true; };

    const id = setInterval(() => load(false), pollInterval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey, mode, host, apiKey, pollInterval]);

  const value: FlagForgeState = {
    flags,
    loading,
    error,
    _lazyCache: lazyCache,
    _setLazyCache: setLazyCacheKey,
    _setError: (err) => setError(err),
    host,
    apiKey,
    context,
    mode,
  };

  return <FlagForgeCtx.Provider value={value}>{children}</FlagForgeCtx.Provider>;
}
```

- [ ] **Step 4: Crea src/hooks.ts (stub minimo per far compilare i test del provider)**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/src/hooks.ts`:

```typescript
import { useFlagForgeCtx } from "./context";

export function useFlagForge() {
  const { flags, loading, error } = useFlagForgeCtx();
  return { flags, loading, error };
}

// placeholders — fully implemented in Task 4
export function useFlag(_key: string): boolean {
  return false;
}

export function useFlags(_keys: string[]): Record<string, boolean> {
  return {};
}
```

- [ ] **Step 5: Esegui i test del provider per verificare che passino**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn vitest run test/provider.test.tsx
```

Expected: PASS — tutti e 5 i test passano.

- [ ] **Step 6: Commit**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
git add src/context.tsx src/hooks.ts test/provider.test.tsx
git commit -m "feat: add FlagForgeProvider (eager + lazy skeleton)"
```

---

### Task 4: Hooks completi

**Files:**
- Modify: `src/hooks.ts`
- Create: `test/hooks.test.tsx`

- [ ] **Step 1: Scrivi i test per gli hook**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/test/hooks.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { FlagForgeProvider } from "../src/context";
import { useFlag, useFlags } from "../src/hooks";

const HOST = "https://flagforge.example.com";
const API_KEY = "ff_test";

function EagerWrapper({ children }: { children: ReactNode }) {
  return (
    <FlagForgeProvider host={HOST} apiKey={API_KEY}>
      {children}
    </FlagForgeProvider>
  );
}

function LazyWrapper({ children }: { children: ReactNode }) {
  return (
    <FlagForgeProvider host={HOST} apiKey={API_KEY} mode="lazy">
      {children}
    </FlagForgeProvider>
  );
}

describe("useFlag — eager mode", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns false during loading", () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: { "my-flag": true } }),
    });

    function TestComp() {
      const enabled = useFlag("my-flag");
      return <div>{String(enabled)}</div>;
    }

    render(<EagerWrapper><TestComp /></EagerWrapper>);
    expect(screen.getByText("false")).toBeInTheDocument();
  });

  it("returns true when flag is enabled", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: { "my-flag": true } }),
    });

    function TestComp() {
      const enabled = useFlag("my-flag");
      return <div>{String(enabled)}</div>;
    }

    render(<EagerWrapper><TestComp /></EagerWrapper>);
    await waitFor(() => expect(screen.getByText("true")).toBeInTheDocument());
  });

  it("returns false for unknown flag key", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: {} }),
    });

    function TestComp() {
      const enabled = useFlag("unknown-flag");
      return <div>{String(enabled)}</div>;
    }

    render(<EagerWrapper><TestComp /></EagerWrapper>);
    await waitFor(() => expect(screen.getByText("false")).toBeInTheDocument());
  });
});

describe("useFlag — lazy mode", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.restoreAllMocks());

  it("fetches on-demand and returns value", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enabled: true }),
    });

    function TestComp() {
      const enabled = useFlag("my-flag");
      return <div>{String(enabled)}</div>;
    }

    render(<LazyWrapper><TestComp /></LazyWrapper>);
    await waitFor(() => expect(screen.getByText("true")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not duplicate fetch for same key", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enabled: false }),
    });

    function TestComp() {
      const a = useFlag("my-flag");
      const b = useFlag("my-flag");
      return <div>{String(a)}-{String(b)}</div>;
    }

    render(<LazyWrapper><TestComp /></LazyWrapper>);
    await waitFor(() => expect(screen.getByText("false-false")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns false and sets error on lazy fetch failure", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    function TestComp() {
      const enabled = useFlag("bad-flag");
      return <div>{String(enabled)}</div>;
    }

    render(<LazyWrapper><TestComp /></LazyWrapper>);
    await waitFor(() => expect(screen.getByText("false")).toBeInTheDocument());
  });
});

describe("useFlags — eager mode", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns a record of requested keys", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: { "flag-a": true, "flag-b": false, "flag-c": true } }),
    });

    function TestComp() {
      const flags = useFlags(["flag-a", "flag-b"]);
      return <div>{JSON.stringify(flags)}</div>;
    }

    render(<EagerWrapper><TestComp /></EagerWrapper>);
    await waitFor(() =>
      expect(
        screen.getByText('{"flag-a":true,"flag-b":false}')
      ).toBeInTheDocument()
    );
  });

  it("returns false for missing keys", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flags: {} }),
    });

    function TestComp() {
      const flags = useFlags(["missing"]);
      return <div>{JSON.stringify(flags)}</div>;
    }

    render(<EagerWrapper><TestComp /></EagerWrapper>);
    await waitFor(() =>
      expect(screen.getByText('{"missing":false}')).toBeInTheDocument()
    );
  });
});
```

- [ ] **Step 2: Esegui i test per verificare che (parte di essi) falliscano**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn vitest run test/hooks.test.tsx
```

Expected: FAIL — i test lazy e useFlags falliranno perché gli stub in hooks.ts non sono implementati.

- [ ] **Step 3: Implementa src/hooks.ts completo**

Sostituisci il contenuto di `/Users/alessandrodefendenti/Projects/misc/flagforge-react/src/hooks.ts`:

```typescript
import { useEffect, useRef } from "react";
import { useFlagForgeCtx } from "./context";
import { fetchFlag } from "./client";

export function useFlagForge() {
  const { flags, loading, error } = useFlagForgeCtx();
  return { flags, loading, error };
}

export function useFlag(key: string): boolean {
  const ctx = useFlagForgeCtx();

  // Lazy mode: fire a one-time fetch, deduplicated via cache
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (ctx.mode !== "lazy") return;
    if (key in ctx._lazyCache) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchFlag(ctx.host, ctx.apiKey, key, ctx.context)
      .then((value) => ctx._setLazyCache(key, value))
      .catch((err) => {
        ctx._setError(err instanceof Error ? err : new Error(String(err)));
      });
  // We only want to run this once per key mount, not on every ctx change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ctx.mode]);

  if (ctx.mode === "lazy") {
    return ctx._lazyCache[key] ?? false;
  }

  return ctx.flags[key] ?? false;
}

export function useFlags(keys: string[]): Record<string, boolean> {
  const ctx = useFlagForgeCtx();

  if (ctx.mode === "lazy") {
    return Object.fromEntries(keys.map((k) => [k, ctx._lazyCache[k] ?? false]));
  }

  return Object.fromEntries(keys.map((k) => [k, ctx.flags[k] ?? false]));
}
```

- [ ] **Step 4: Esegui tutti i test degli hook per verificare che passino**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn vitest run test/hooks.test.tsx
```

Expected: PASS — tutti i test passano.

- [ ] **Step 5: Commit**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
git add src/hooks.ts test/hooks.test.tsx
git commit -m "feat: implement useFlag, useFlags hooks (eager + lazy)"
```

---

### Task 5: Componenti dichiarativi

**Files:**
- Create: `src/components.tsx`
- Create: `test/components.test.tsx`

- [ ] **Step 1: Scrivi i test per i componenti**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/test/components.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { FlagForgeProvider } from "../src/context";
import { FeatureFlag, FlagGate } from "../src/components";

const HOST = "https://flagforge.example.com";
const API_KEY = "ff_test";

function Wrapper({ children, flags = {} }: { children: ReactNode; flags?: Record<string, boolean> }) {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ flags }),
  });
  return (
    <FlagForgeProvider host={HOST} apiKey={API_KEY}>
      {children}
    </FlagForgeProvider>
  );
}

describe("FeatureFlag", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders children when flag is enabled", async () => {
    render(
      <Wrapper flags={{ "my-flag": true }}>
        <FeatureFlag flag="my-flag">
          <span>feature content</span>
        </FeatureFlag>
      </Wrapper>
    );

    await waitFor(() =>
      expect(screen.getByText("feature content")).toBeInTheDocument()
    );
  });

  it("renders nothing when flag is disabled", async () => {
    render(
      <Wrapper flags={{ "my-flag": false }}>
        <FeatureFlag flag="my-flag">
          <span>feature content</span>
        </FeatureFlag>
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText("feature content")).not.toBeInTheDocument();
    });
    // wait for fetch to settle
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });

  it("renders nothing during loading", () => {
    render(
      <Wrapper flags={{ "my-flag": true }}>
        <FeatureFlag flag="my-flag">
          <span>feature content</span>
        </FeatureFlag>
      </Wrapper>
    );

    expect(screen.queryByText("feature content")).not.toBeInTheDocument();
  });
});

describe("FlagGate", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders children when flag is enabled", async () => {
    render(
      <Wrapper flags={{ "my-flag": true }}>
        <FlagGate flag="my-flag" fallback={<span>fallback</span>}>
          <span>new feature</span>
        </FlagGate>
      </Wrapper>
    );

    await waitFor(() =>
      expect(screen.getByText("new feature")).toBeInTheDocument()
    );
    expect(screen.queryByText("fallback")).not.toBeInTheDocument();
  });

  it("renders fallback when flag is disabled", async () => {
    render(
      <Wrapper flags={{ "my-flag": false }}>
        <FlagGate flag="my-flag" fallback={<span>fallback</span>}>
          <span>new feature</span>
        </FlagGate>
      </Wrapper>
    );

    await waitFor(() =>
      expect(screen.getByText("fallback")).toBeInTheDocument()
    );
    expect(screen.queryByText("new feature")).not.toBeInTheDocument();
  });

  it("renders fallback during loading", () => {
    render(
      <Wrapper flags={{ "my-flag": true }}>
        <FlagGate flag="my-flag" fallback={<span>fallback</span>}>
          <span>new feature</span>
        </FlagGate>
      </Wrapper>
    );

    expect(screen.getByText("fallback")).toBeInTheDocument();
    expect(screen.queryByText("new feature")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Esegui i test per verificare che falliscano**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn vitest run test/components.test.tsx
```

Expected: FAIL — `Cannot find module '../src/components'`

- [ ] **Step 3: Implementa src/components.tsx**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/src/components.tsx`:

```typescript
import { ReactNode } from "react";
import { useFlag } from "./hooks";
import { useFlagForgeCtx } from "./context";

interface FeatureFlagProps {
  flag: string;
  children: ReactNode;
}

export function FeatureFlag({ flag, children }: FeatureFlagProps) {
  const { loading } = useFlagForgeCtx();
  const enabled = useFlag(flag);

  if (loading || !enabled) return null;
  return <>{children}</>;
}

interface FlagGateProps {
  flag: string;
  children: ReactNode;
  fallback: ReactNode;
}

export function FlagGate({ flag, children, fallback }: FlagGateProps) {
  const { loading } = useFlagForgeCtx();
  const enabled = useFlag(flag);

  if (loading || !enabled) return <>{fallback}</>;
  return <>{children}</>;
}
```

- [ ] **Step 4: Esegui i test dei componenti per verificare che passino**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn vitest run test/components.test.tsx
```

Expected: PASS — tutti i test passano.

- [ ] **Step 5: Commit**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
git add src/components.tsx test/components.test.tsx
git commit -m "feat: add FeatureFlag and FlagGate components"
```

---

### Task 6: Exports pubblici e build

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Aggiorna src/index.ts con tutti gli export pubblici**

Sostituisci il contenuto di `/Users/alessandrodefendenti/Projects/misc/flagforge-react/src/index.ts`:

```typescript
export { FlagForgeProvider } from "./context";
export type { FlagForgeProviderProps, FlagForgeState } from "./context";
export type { FlagForgeContext } from "./client";
export { useFlag, useFlags, useFlagForge } from "./hooks";
export { FeatureFlag, FlagGate } from "./components";
```

- [ ] **Step 2: Esegui la suite completa di test**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn vitest run
```

Expected: PASS — tutti i test passano (client, provider, hooks, components).

- [ ] **Step 3: Verifica la build**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
yarn build
```

Expected: `dist/` creata con `flagforge-react.es.js`, `flagforge-react.umd.js`, e file `.d.ts`.

- [ ] **Step 4: Commit**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
git add src/index.ts dist/
git commit -m "feat: wire public exports and verify build"
```

---

### Task 7: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Crea README.md**

Crea `/Users/alessandrodefendenti/Projects/misc/flagforge-react/README.md`:

```markdown
# flagforge-react

React client library for [FlagForge](https://github.com/your-org/flagforge) feature flags.

## Installation

```bash
yarn install flagforge-react
```

## Quick Start

```tsx
import { FlagForgeProvider, useFlag, FeatureFlag, FlagGate } from "flagforge-react";

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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/alessandrodefendenti/Projects/misc/flagforge-react
git add README.md
git commit -m "docs: add README"
```
