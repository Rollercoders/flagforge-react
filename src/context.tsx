import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { fetchAllFlags, FlagForgeContext as FlagContext } from "./client";

export interface FlagForgeState {
  flags: Record<string, boolean>;
  loading: boolean;
  error: Error | null;
  _lazyCache: Record<string, boolean>;
  _setLazyCache: (key: string, value: boolean) => void;
  _setError: (err: Error) => void;
  host: string;
  apiKey: string;
  context: FlagContext;
  mode: "eager" | "lazy";
}

export const FlagForgeCtx = createContext<FlagForgeState | null>(null);

export function useFlagForgeCtx(): FlagForgeState {
  const ctx = useContext(FlagForgeCtx);
  if (!ctx) throw new Error("useFlagForge must be used inside FlagForgeProvider");
  return ctx;
}

export interface FlagForgeProviderProps {
  host: string;
  apiKey: string;
  mode?: "eager" | "lazy";
  pollInterval?: number;
  context?: FlagContext;
  children: ReactNode;
}

export function FlagForgeProvider({
  host,
  apiKey,
  mode = "eager",
  pollInterval,
  context = {},
  children,
}: FlagForgeProviderProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(mode === "eager");
  const [error, setError] = useState<Error | null>(null);
  const [lazyCache, setLazyCache] = useState<Record<string, boolean>>({});
  const isFirstFetch = useRef(true);

  function setLazyCacheKey(key: string, value: boolean) {
    setLazyCache((prev) => ({ ...prev, [key]: value }));
  }

  const contextKey = JSON.stringify(context);

  useEffect(() => {
    if (mode !== "eager") return;

    let cancelled = false;

    async function load(isInitial: boolean) {
      try {
        const result = await fetchAllFlags(host, apiKey, context);
        if (!cancelled) {
          setFlags(result);
          setError(null);
          if (isInitial) setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          if (isInitial) setLoading(false);
        }
      }
    }

    load(isFirstFetch.current);
    isFirstFetch.current = false;

    if (!pollInterval) return () => { cancelled = true; };

    const id = setInterval(() => load(false), pollInterval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey, mode, host, apiKey, pollInterval]);

  const value: FlagForgeState = {
    flags,
    loading,
    error,
    _lazyCache: lazyCache,
    _setLazyCache: setLazyCacheKey,
    _setError: (err) => setError(err),
    host,
    apiKey,
    context,
    mode,
  };

  return <FlagForgeCtx.Provider value={value}>{children}</FlagForgeCtx.Provider>;
}
