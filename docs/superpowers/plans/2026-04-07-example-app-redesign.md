# Example App Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Riscrivere `examples/basic/src/App.tsx` e aggiungere `examples/basic/src/App.css` per dare alla demo un look dark/developer presentabile.

**Architecture:** Solo due file toccati — `App.tsx` (logica + struttura JSX) e `App.css` (tutti gli stili). Il CSS usa variabili custom e nessuna dipendenza esterna. La struttura dell'app rimane invariata: header, toggle mode, sezioni per ogni API.

**Tech Stack:** React 18, TypeScript, CSS vanilla (no librerie UI)

---

## File Map

| File | Azione |
|---|---|
| `examples/basic/src/App.css` | Creare — tutti gli stili dark/developer |
| `examples/basic/src/App.tsx` | Modificare — importa il CSS, aggiorna JSX con le classi |

---

### Task 1: Crea `App.css` — stile dark/developer

**Files:**
- Create: `examples/basic/src/App.css`

Il design usa:
- Sfondo: `#0f1117` (pagina), `#1a1d2e` (card), `#12141f` (code block)
- Accenti: `#6366f1` (indaco primario), `#8b5cf6` (viola secondario)
- Testo: `#e2e8f0` (primario), `#94a3b8` (secondario), `#475569` (muted)
- Successo: `#34d399`, Errore: `#f87171`
- Font corpo: `system-ui, sans-serif`; font codice: `'Menlo', 'Courier New', monospace`

- [ ] **Step 1: Crea `examples/basic/src/App.css`**

```css
/* ── Reset & root ──────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #0f1117;
  --surface:   #1a1d2e;
  --surface2:  #12141f;
  --border:    #2a2d3e;
  --accent:    #6366f1;
  --accent2:   #8b5cf6;
  --text:      #e2e8f0;
  --text2:     #94a3b8;
  --text3:     #475569;
  --green:     #34d399;
  --red:       #f87171;
  --yellow:    #fbbf24;
  --radius:    8px;
  --mono:      'Menlo', 'Courier New', monospace;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  min-height: 100vh;
}

/* ── Layout ────────────────────────────────────────────────── */
.app {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* ── Header ────────────────────────────────────────────────── */
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.header-logo {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border-radius: var(--radius);
  flex-shrink: 0;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.header-sub {
  font-size: 12px;
  color: var(--text3);
  font-family: var(--mono);
  margin-top: 1px;
}

.badge-live {
  margin-left: auto;
  font-size: 11px;
  font-family: var(--mono);
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 3px 10px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.badge-live::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
}

/* ── Mode toggle ───────────────────────────────────────────── */
.mode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
}

.mode-label {
  font-size: 12px;
  color: var(--text3);
  font-family: var(--mono);
  margin-right: 4px;
}

.mode-btn {
  font-size: 12px;
  font-family: var(--mono);
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.15s;
}

.mode-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.mode-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 600;
}

/* ── Section card ──────────────────────────────────────────── */
.section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
}

.section-label {
  font-size: 10px;
  font-family: var(--mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  margin-bottom: 6px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  font-family: var(--mono);
  color: var(--text);
  margin-bottom: 14px;
}

/* ── Code block ────────────────────────────────────────────── */
.code-block {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 14px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text2);
  overflow-x: auto;
  white-space: pre;
}

/* ── Flag value ────────────────────────────────────────────── */
.flag-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.flag-row:last-child { margin-bottom: 0; }

.flag-key {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text2);
  min-width: 120px;
}

.flag-true {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--green);
}

.flag-false {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--red);
}

/* ── Status badges ─────────────────────────────────────────── */
.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text2);
}

.status-row:last-child { margin-bottom: 0; }

.status-key { color: var(--text3); }

/* ── Enabled / Disabled pills ──────────────────────────────── */
.pill-enabled {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-family: var(--mono);
  background: rgba(52, 211, 153, 0.1);
  color: var(--green);
  border: 1px solid rgba(52, 211, 153, 0.25);
  padding: 3px 10px;
  border-radius: 99px;
}

.pill-enabled::before {
  content: '✓';
  font-weight: 700;
}

.pill-disabled {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-family: var(--mono);
  background: rgba(248, 113, 113, 0.1);
  color: var(--red);
  border: 1px solid rgba(248, 113, 113, 0.25);
  padding: 3px 10px;
  border-radius: 99px;
}

.pill-disabled::before {
  content: '✗';
  font-weight: 700;
}

/* ── FeatureFlag / FlagGate demo boxes ─────────────────────── */
.demo-box {
  background: var(--surface2);
  border: 1px dashed var(--border);
  border-radius: 6px;
  padding: 12px 14px;
  font-size: 13px;
}

.demo-box-enabled {
  border-color: rgba(52, 211, 153, 0.3);
  color: var(--green);
}

.demo-box-disabled {
  border-color: rgba(248, 113, 113, 0.3);
  color: var(--red);
}

.demo-box-empty {
  color: var(--text3);
  font-style: italic;
}
```

- [ ] **Step 2: Commit**

```bash
git add examples/basic/src/App.css
git commit -m "feat(example): add dark/developer CSS theme"
```

---

### Task 2: Riscrivi `App.tsx` — JSX con le classi CSS

**Files:**
- Modify: `examples/basic/src/App.tsx`

Sostituisce completamente il file. Usa le classi definite in Task 1. Nessuna inline style tranne dove strettamente necessario.

- [ ] **Step 1: Riscrivi `examples/basic/src/App.tsx`**

```tsx
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
import "./App.css";

const firstFlag = FLAGFORGE_FLAGS[0] ?? "example-flag";

export function App() {
  const [mode, setMode] = useState<"eager" | "lazy">("eager");

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo" />
        <div>
          <div className="header-title">flagforge-react</div>
          <div className="header-sub">API demo</div>
        </div>
        <span className="badge-live">live</span>
      </header>

      <div className="mode-toggle">
        <span className="mode-label">mode:</span>
        <button
          className={"mode-btn" + (mode === "eager" ? " active" : "")}
          onClick={() => setMode("eager")}
        >
          eager
        </button>
        <button
          className={"mode-btn" + (mode === "lazy" ? " active" : "")}
          onClick={() => setMode("lazy")}
        >
          lazy
        </button>
      </div>

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
    <div className="section">
      <div className="section-label">hook</div>
      <div className="section-title">useFlagForge()</div>
      <div className="status-row">
        <span className="status-key">loading</span>
        <span>{String(loading)}</span>
      </div>
      <div className="status-row">
        <span className="status-key">error</span>
        <span>{error ? error.message : "null"}</span>
      </div>
      <div className="status-row" style={{ marginBottom: "8px" }}>
        <span className="status-key">flags</span>
      </div>
      <div className="code-block">{JSON.stringify(flags, null, 2)}</div>
    </div>
  );
}

function SingleFlagSection() {
  const enabled = useFlag(firstFlag);
  return (
    <div className="section">
      <div className="section-label">hook</div>
      <div className="section-title">useFlag("{firstFlag}")</div>
      <div className="flag-row">
        <span className="flag-key">{firstFlag}</span>
        {enabled
          ? <span className="flag-true">true</span>
          : <span className="flag-false">false</span>}
      </div>
    </div>
  );
}

function MultiFlagSection() {
  const flagMap = useFlags(FLAGFORGE_FLAGS);
  return (
    <div className="section">
      <div className="section-label">hook</div>
      <div className="section-title">
        useFlags([{FLAGFORGE_FLAGS.map((f) => `"${f}"`).join(", ")}])
      </div>
      {Object.entries(flagMap).map(([key, value]) => (
        <div key={key} className="flag-row">
          <span className="flag-key">{key}</span>
          {value
            ? <span className="flag-true">true</span>
            : <span className="flag-false">false</span>}
        </div>
      ))}
      {FLAGFORGE_FLAGS.length === 0 && (
        <div className="code-block">{"{}"}</div>
      )}
    </div>
  );
}

function FeatureFlagSection() {
  const enabled = useFlag(firstFlag);
  return (
    <div className="section">
      <div className="section-label">component</div>
      <div className="section-title">{"<FeatureFlag flag=\"" + firstFlag + "\">"}</div>
      <FeatureFlag flag={firstFlag}>
        <div className="demo-box demo-box-enabled">
          Flag is enabled — children rendered.
        </div>
      </FeatureFlag>
      {!enabled && (
        <div className="demo-box demo-box-empty">
          Flag is disabled — nothing rendered.
        </div>
      )}
    </div>
  );
}

function FlagGateSection() {
  return (
    <div className="section">
      <div className="section-label">component</div>
      <div className="section-title">{"<FlagGate flag=\"" + firstFlag + "\" fallback={…}>"}</div>
      <FlagGate
        flag={firstFlag}
        fallback={
          <div className="demo-box demo-box-disabled">
            Flag is disabled — fallback rendered.
          </div>
        }
      >
        <div className="demo-box demo-box-enabled">
          Flag is enabled — children rendered.
        </div>
      </FlagGate>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add examples/basic/src/App.tsx
git commit -m "feat(example): apply dark/developer design to demo app"
```
