import React from 'react'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom';

export default function AuthButton() {
    const nav = useNavigate()
  return (
    <>
      <Button
        className="bg-zinc-900 text-white hover:bg-zinc-600"
        onClick={() => nav("/login")}
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
