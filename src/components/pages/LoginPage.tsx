import React from 'react'
import { Helmet } from 'react-helmet-async'
import LoginForm from '../bussiness/LoginForm'

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>登录 - SeuOJ</title>
      </Helmet>
      <div className='flex flex-col justify-center items-center pt-[5vh] pb-[10vh] px-4 w-full' >
        <div className="w-[40vw] min-w-[360px] max-w-[550px] space-y-6">
          <div className="text-center">
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
              登录
            </h2>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <LoginForm/>
          </div>
        </div>
      </div>
    </>
  )
}
