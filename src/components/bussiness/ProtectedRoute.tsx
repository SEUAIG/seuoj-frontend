import { hasCapability, type Capability } from "@/lib/capabilities";
import { RootState } from "@/app/store";
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { loginPath } from "@/lib/loginRedirect";

type Role = "guest" | "student" | "teacher" | "admin" | "superadmin";
export default function ProtectedRoute({
  allowRole = "guest",
  capability,
}: {
  allowRole?: Role;
  capability?: Capability;
}) {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role ?? "guest";
  if (role === "guest" && (allowRole !== "guest" || capability)) {
    return <Navigate to={loginPath(location.pathname + location.search + location.hash)} replace />;
  }
  if (capability) return hasCapability(user, capability) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
  switch (allowRole) {
    case "guest":
      return <Outlet />;
    case "student":
      return <Outlet />;
    case "teacher":
      if (role === "student") {
        return (
          <Navigate
            to="/unauthorized"
            replace
            state={{
              perm: "teacher",
              role,
              allowedRoles: ["teacher", "admin", "superadmin"],
              fallbackPath: location.state?.fallbackPath ?? "/home",
            }}
          />
        );
      }
      return <Outlet />;
    case "admin":
      if (role === "student" || role === "teacher") {
        return (
          <Navigate
            to="/unauthorized"
            replace
            state={{
              perm: "admin",
              role,
              allowedRoles: ["admin", "superadmin"],
              fallbackPath: location.state?.fallbackPath ?? "/home",
            }}
          />
        );
      }
      return <Outlet />;
    case "superadmin":
      if (role !== "superadmin") {
        return (
          <Navigate
            to="/unauthorized"
            replace
            state={{
              perm: "superadmin",
              role,
              allowedRoles: ["superadmin"],
              fallbackPath: location.state?.fallbackPath ?? "/home",
            }}
          />
        );
      }
      return <Outlet />;
  }
}
