import React from 'react'
import LogoSEU from '../../assets/黑白校标.svg'
import { Navigate, useNavigate } from 'react-router-dom';
export default function Logo() {
  const nav = useNavigate()
  return (
    <div className='flex items-center justify-center cursor-pointer' onClick={()=>{nav("/home")}}>
      <img src={LogoSEU} alt='seuLogo' className='w-[30px] h-[30px] cursor-pointer'/>
      <span className='font-bold text-xl mx-2 cursor-pointer'>SEUOJ</span>
    </div>
  )
}
