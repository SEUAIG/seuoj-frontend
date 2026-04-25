import React from 'react'
import { Helmet } from 'react-helmet-async'
import LoginForm from '../bussiness/LoginForm'

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>登录 - SEUOJ</title>
      </Helmet>
      <div className='flex flex-col justify-center items-center pt-[5vh] pb-[10vh] px-4 w-full' >
        <div className="w-[40vw] min-w-[360px] max-w-[550px] space-y-6">
          <div className="text-center">
            <h2 className="mt-4 text-2xl font-bold text-foreground tracking-tight">
              登录
            </h2>
            <p className="text-muted-foreground mt-1">欢迎回来</p>
          </div>
          <div className="bg-card p-8 rounded-lg border shadow-sm">
            <LoginForm/>
          </div>
        </div>
      </div>
    </>
  )
}
