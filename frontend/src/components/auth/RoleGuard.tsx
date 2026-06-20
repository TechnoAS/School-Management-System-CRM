import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { canAccess } from "@/constants/roles";
import { useAppStore } from "@/store/useAppStore";

export function RoleGuard({
  moduleId,
  children,
}: {
  moduleId: string;
  children: ReactNode;
}) {
  const user = useAppStore(s => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess(user.role, moduleId)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
