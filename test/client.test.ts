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
