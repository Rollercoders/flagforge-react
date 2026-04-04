import { useFlagForgeCtx } from "./context";

export function useFlagForge() {
  const { flags, loading, error } = useFlagForgeCtx();
  return { flags, loading, error };
}

// placeholders — fully implemented in Task 4
export function useFlag(_key: string): boolean {
  return false;
}

export function useFlags(_keys: string[]): Record<string, boolean> {
  return {};
}
