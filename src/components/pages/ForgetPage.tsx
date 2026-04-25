import React from "react";
import { Helmet } from "react-helmet-async";
import ForgetForm from "../bussiness/ForgetForm";
import NavBar from "../common/NavBar";

export default function ForgetPage() {
  return (
    <>
      <Helmet>
        <title>找回密码 - SEUOJ</title>
      </Helmet>
      <div className='flex flex-col justify-center items-center m-8 bg-muted' >
      <span className='text-3xl font-bold'>找回密码</span>
      <ForgetForm />
      </div>
    
    </>
  );
}
