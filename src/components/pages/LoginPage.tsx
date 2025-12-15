import React from 'react'
import { Helmet } from 'react-helmet-async'
import LoginForm from '../bussiness/LoginForm'
import NavBar from '../common/NavBar'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>登录 - SeuOJ</title>
      </Helmet>
      <div className='flex flex-col justify-center items-center m-8 bg-muted' >
      <span className='text-3xl font-bold'>登录</span>
      <LoginForm/>

      </div>
    </>
  )
}
