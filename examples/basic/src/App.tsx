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
