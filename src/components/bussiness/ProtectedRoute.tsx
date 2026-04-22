import { RootState } from "@/app/store";
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
type Role = "guest" | "student" | "teacher" | "admin" | "superadmin";
export default function ProtectedRoute({
  allowRole = "guest",
}: {
  allowRole?: Role;
}) {
  const location = useLocation();
  const role = useSelector(
    (state: RootState) => state.auth.user?.role ?? "guest"
  );
  switch (allowRole) {
    case "guest":
      return <Outlet />;
    case "student":
      if (role === "guest") return <Navigate to="/login" replace />;
      return <Outlet />;
    case "teacher":
      if (role === "guest") return <Navigate to="/login" replace />;
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
      if (role === "guest") return <Navigate to="/login" replace />;
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
      if (role === "guest") return <Navigate to="/login" replace />;
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
