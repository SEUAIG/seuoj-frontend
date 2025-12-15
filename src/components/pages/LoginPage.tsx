import React from 'react'
import LoginForm from '../bussiness/LoginForm'
import NavBar from '../common/NavBar'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <>

      <div className='flex flex-col justify-center items-center m-8 bg-muted' >
      <span className='text-3xl font-bold'>登录</span>
      <LoginForm/>

      </div>
    </>
  )
}
