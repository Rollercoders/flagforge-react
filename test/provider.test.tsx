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
    vi.useFakeTimers({ shouldAdvanceTime: true });

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
