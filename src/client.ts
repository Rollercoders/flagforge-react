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
  // The `/all` endpoint reads context fields at the body root
  // (`body.userId`, `body.attributes`), not nested under `context`. Sending
  // the flat context is required for targeting to apply. The nested
  // `{ flags, context }` shape is only for the batch `POST /` endpoint.
  const data = await post<
    Record<string, boolean> | { flags: Record<string, boolean> }
  >(`${host}/api/evaluate/all`, apiKey, context);

  if (!data || typeof data !== "object") return {};

  // The server returns the flat flag map (`{ "my-flag": true }`), but older
  // versions wrapped it as `{ flags: { "my-flag": true } }`. Support both.
  const flags =
    "flags" in data && data.flags && typeof data.flags === "object"
      ? data.flags
      : data;

  return (flags as Record<string, boolean>) ?? {};
}

export async function fetchFlag(
  host: string,
  apiKey: string,
  key: string,
  context: FlagForgeContext
): Promise<boolean> {
  // Like `/all`, the `/:key` endpoint reads context fields at the body root.
  const data = await post<{ enabled: boolean }>(
    `${host}/api/evaluate/${key}`,
    apiKey,
    context
  );
  return data.enabled;
}
