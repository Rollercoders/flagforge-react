import { ReactNode } from "react";
import { useFlag } from "./hooks";
import { useFlagForgeCtx } from "./context";

interface FeatureFlagProps {
  flag: string;
  children: ReactNode;
}

export function FeatureFlag({ flag, children }: FeatureFlagProps) {
  const { loading } = useFlagForgeCtx();
  const enabled = useFlag(flag);

  if (loading || !enabled) return null;
  return <>{children}</>;
}

interface FlagGateProps {
  flag: string;
  children: ReactNode;
  fallback: ReactNode;
}

export function FlagGate({ flag, children, fallback }: FlagGateProps) {
  const { loading } = useFlagForgeCtx();
  const enabled = useFlag(flag);

  if (loading || !enabled) return <>{fallback}</>;
  return <>{children}</>;
}
