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
