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
  return post<Record<string, boolean>>(
    `${host}/api/evaluate/all`,
    apiKey,
    { context }
  );
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
