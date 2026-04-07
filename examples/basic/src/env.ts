const host = import.meta.env.VITE_FLAGFORGE_HOST as string | undefined;
const apiKey = import.meta.env.VITE_FLAGFORGE_API_KEY as string | undefined;
const flagsRaw = import.meta.env.VITE_FLAGFORGE_FLAGS as string | undefined;

if (!host) throw new Error("VITE_FLAGFORGE_HOST is not set");
if (!apiKey) throw new Error("VITE_FLAGFORGE_API_KEY is not set");

export const FLAGFORGE_HOST = host;
export const FLAGFORGE_API_KEY = apiKey;
export const FLAGFORGE_FLAGS: string[] = flagsRaw
  ? flagsRaw.split(",").map((f) => f.trim()).filter(Boolean)
  : [];
