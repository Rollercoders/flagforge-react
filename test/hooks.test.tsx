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

  it("returns true with a flat server response {my-flag: true}", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ "my-flag": true }),
    });

    function TestComp() {
      const enabled = useFlag("my-flag");
      return <div>{String(enabled)}</div>;
    }

    render(<EagerWrapper><TestComp /></EagerWrapper>);
    await waitFor(() => expect(screen.getByText("true")).toBeInTheDocument());
  });

  it("returns false with a flat server response {my-flag: false}", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ "my-flag": false }),
    });

    function TestComp() {
      const enabled = useFlag("my-flag");
      return <div>{String(enabled)}</div>;
    }

    render(<EagerWrapper><TestComp /></EagerWrapper>);
    await waitFor(() => expect(screen.getByText("false")).toBeInTheDocument());
  });

  it("returns true with a wrapped server response {flags: {my-flag: true}}", async () => {
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

  it("returns false without crashing on an empty response {}", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    function TestComp() {
      const enabled = useFlag("my-flag");
      return <div>{String(enabled)}</div>;
    }

    render(<EagerWrapper><TestComp /></EagerWrapper>);
    await waitFor(() => expect(screen.getByText("false")).toBeInTheDocument());
  });

  it("returns false without crashing when the fetch fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    function TestComp() {
      const enabled = useFlag("my-flag");
      return <div>{String(enabled)}</div>;
    }

    render(<EagerWrapper><TestComp /></EagerWrapper>);
    await waitFor(() => expect(screen.getByText("false")).toBeInTheDocument());
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

  it("maps requested keys with a flat server response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ "flag-a": true, "flag-b": false, "flag-c": true }),
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
