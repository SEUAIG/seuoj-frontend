import React from 'react'
import { Button } from '../ui/button'
import { useNavigate, useLocation } from 'react-router-dom';

import { loginPath } from "@/lib/loginRedirect";

export default function AuthButton() {
    const nav = useNavigate()
    const location = useLocation();
  return (
    <>
      <Button
        className="bg-zinc-900 text-white hover:bg-zinc-600"
        onClick={() => nav(loginPath(location.pathname + location.search + location.hash))}
      >
        登录
      </Button>

      <Button
        variant="outline"
        className="border-zinc-300 text-zinc-700 hover:bg-slate-300 bg-slate-200"
        onClick={() => nav("/signup")}
      >
        注册
      </Button>
    </>
  );
}
