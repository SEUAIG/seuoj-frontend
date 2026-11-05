import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import type { RootState } from "@/app/store";
import { api } from "@/services/api/axios";
import type { ApiResponse } from "@/models/common";
import type { UserMeResponse } from "@/models/user";
import { setCurrentProfile } from "@/features/auth/authSlice";

export default function AuthRefresh() {
  const jwt = useSelector((state: RootState) => state.auth.jwt);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  useEffect(() => {
    if (!jwt) return;
    let cancelled = false;
    const refresh = () => { void api.get<ApiResponse<UserMeResponse>>("/api/user/me").then(response => {
      if (!cancelled && response.data.code === 0) dispatch(setCurrentProfile(response.data.data));
    }).catch(() => { /* API interceptor handles expired sessions; network failures keep existing UI. */ }); };
    refresh(); window.addEventListener("focus", refresh);
    return () => { cancelled = true; window.removeEventListener("focus", refresh); };
  }, [jwt, dispatch, pathname]);
  return null;
}
