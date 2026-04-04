import { useEffect, useRef } from "react";
import { useFlagForgeCtx } from "./context";
import { fetchFlag } from "./client";

export function useFlagForge() {
  const { flags, loading, error } = useFlagForgeCtx();
  return { flags, loading, error };
}

export function useFlag(key: string): boolean {
  const ctx = useFlagForgeCtx();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (ctx.mode !== "lazy") return;
    if (key in ctx._lazyCache) return;
    if (ctx._inFlight.has(key)) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    ctx._setInFlight(key);

    fetchFlag(ctx.host, ctx.apiKey, key, ctx.context)
      .then((value) => ctx._setLazyCache(key, value))
      .catch((err) => {
        ctx._setError(err instanceof Error ? err : new Error(String(err)));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ctx.mode]);

  if (ctx.mode === "lazy") {
    return ctx._lazyCache[key] ?? false;
  }

  return ctx.flags[key] ?? false;
}

export function useFlags(keys: string[]): Record<string, boolean> {
  const ctx = useFlagForgeCtx();

  if (ctx.mode === "lazy") {
    return Object.fromEntries(keys.map((k) => [k, ctx._lazyCache[k] ?? false]));
  }

  return Object.fromEntries(keys.map((k) => [k, ctx.flags[k] ?? false]));
}
