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
